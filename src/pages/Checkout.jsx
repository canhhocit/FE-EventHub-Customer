import { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import {
  Tag,
  CheckCircle2,
  X,
  Loader2,
  ChevronLeft,
  AlertCircle,
} from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useToast } from '../context/ToastContext';
import { checkoutSelected, getVouchersForEvent } from '../utils/api';
import { formatCurrency } from '../utils/constants';

const PAYMENT_METHODS = [
  {
    id: 'PAYOS',
    name: 'VietQR (PayOS)',
    note: 'Quét mã QR qua ứng dụng ngân hàng',
  },
  {
    id: 'MOMO',
    name: 'MoMo',
    note: 'Giả lập — dùng cho môi trường thử nghiệm',
  },
];

/** Mirrors VoucherService.calculateDiscount so the preview matches the charge. */
const computeDiscount = (voucher, applicableAmount) => {
  if (!voucher || applicableAmount <= 0) return 0;
  const amount = Number(voucher.amount) || 0;
  let discount;

  if (String(voucher.discountType).toUpperCase() === 'PERCENTAGE') {
    discount = (applicableAmount * amount) / 100;
    const max = voucher.maxDiscount == null ? null : Number(voucher.maxDiscount);
    if (max !== null && discount > max) discount = max;
  } else {
    discount = amount;
  }

  return Math.min(discount, applicableAmount);
};

const Checkout = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { cart, loading: cartLoading, fetchBackendCart } = useCart();
  const toast = useToast();

  // Keep the ids from the cart page, but survive a refresh (which wipes
  // router state) by remembering them for the length of the session.
  const [selectedIds] = useState(() => {
    const fromState = location.state?.selectedCartItemIds;
    if (Array.isArray(fromState) && fromState.length) {
      sessionStorage.setItem('checkoutItemIds', JSON.stringify(fromState));
      return fromState;
    }
    try {
      const stored = JSON.parse(sessionStorage.getItem('checkoutItemIds') || '[]');
      return Array.isArray(stored) ? stored : [];
    } catch {
      return [];
    }
  });

  const [paymentMethod, setPaymentMethod] = useState('PAYOS');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  // Set the moment an order goes through, so emptying the cart afterwards
  // can't race the redirect and bounce the user back to /cart.
  const settled = useRef(false);

  const [voucher, setVoucher] = useState(null);
  const [vouchersByEvent, setVouchersByEvent] = useState({});
  const [voucherLoading, setVoucherLoading] = useState(false);
  const [voucherModalEventId, setVoucherModalEventId] = useState(null);

  const items = useMemo(
    () => cart.filter((item) => selectedIds.includes(item.cartItemId)),
    [cart, selectedIds],
  );

  const subtotal = items.reduce((sum, i) => sum + i.price * i.quantity, 0);

  const eventGroups = useMemo(() => {
    const map = new Map();
    items.forEach((item) => {
      const key = String(item.eventId);
      if (!map.has(key)) {
        map.set(key, {
          eventId: key,
          eventName: item.eventName,
          items: [],
          totalPrice: 0,
        });
      }
      const group = map.get(key);
      group.items.push(item);
      group.totalPrice += item.price * item.quantity;
    });
    return [...map.values()];
  }, [items]);

  // The backend applies one voucher to the events it covers, so the preview
  // uses that same base amount.
  const voucherBase = useMemo(() => {
    if (!voucher) return 0;
    if (voucher.eventId == null) return subtotal;
    const group = eventGroups.find((g) => g.eventId === String(voucher.eventId));
    return group?.totalPrice || 0;
  }, [voucher, eventGroups, subtotal]);

  const discount = computeDiscount(voucher, voucherBase);
  const total = Math.max(0, subtotal - discount);

  // Nothing to pay for → back to the cart.
  useEffect(() => {
    if (success || cartLoading || settled.current) return;
    if (items.length === 0) {
      navigate('/cart', { replace: true });
    }
  }, [items.length, cartLoading, success, navigate]);

  // Drop a voucher that no longer applies to what's being bought.
  useEffect(() => {
    if (voucher && voucherBase <= 0) setVoucher(null);
  }, [voucher, voucherBase]);

  const openVoucherModal = useCallback(
    async (eventId) => {
      setVoucherModalEventId(eventId);
      if (vouchersByEvent[eventId]) return;

      setVoucherLoading(true);
      try {
        const data = await getVouchersForEvent(eventId);
        setVouchersByEvent((prev) => ({
          ...prev,
          [eventId]: data?.code === 1000 && Array.isArray(data.result) ? data.result : [],
        }));
      } catch (err) {
        setVouchersByEvent((prev) => ({ ...prev, [eventId]: [] }));
        toast?.error(err.message || 'Không tải được danh sách voucher.');
      } finally {
        setVoucherLoading(false);
      }
    },
    [vouchersByEvent, toast],
  );

  const isVoucherUsable = (v, group) => {
    const base = v.eventId == null ? subtotal : group.totalPrice;
    if (v.minOrderAmount && subtotal < Number(v.minOrderAmount)) return false;
    if (v.quantity != null && Number(v.quantity) <= 0) return false;
    return base > 0;
  };

  const handlePayment = async () => {
    if (loading || items.length === 0) return;
    setLoading(true);
    try {
      const data = await checkoutSelected({
        itemIds: selectedIds,
        paymentMethod,
        voucherCode: voucher?.code || null,
      });

      if (data?.code !== 1000) {
        throw new Error(data?.message || 'Thanh toán thất bại.');
      }

      settled.current = true;
      sessionStorage.removeItem('checkoutItemIds');
      const paymentUrl = data.result?.paymentUrl;

      // PayOS hands back an external checkout link; the MoMo simulation hands
      // back an in-app path, which must be routed, not assigned to location.
      if (paymentUrl && /^https?:\/\//i.test(paymentUrl)) {
        window.location.href = paymentUrl;
        return;
      }

      if (paymentUrl?.startsWith('/')) {
        navigate(paymentUrl, { replace: true });
        fetchBackendCart().catch(() => {});
        return;
      }

      setSuccess(true);
      await fetchBackendCart().catch(() => {});
      setTimeout(() => navigate('/my-tickets'), 2500);
    } catch (err) {
      toast?.error(err.message || 'Không hoàn tất được thanh toán.');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="container py-5">
        <div className="panel p-5 text-center mx-auto" style={{ maxWidth: 480 }}>
          <CheckCircle2 size={44} className="mb-3" style={{ color: 'var(--success)' }} />
          <h1 className="h5 fw-bold mb-2">Đặt vé thành công</h1>
          <p className="text-muted small mb-0">
            Hóa đơn điện tử đã được gửi tới email của bạn. Đang chuyển tới trang vé…
          </p>
        </div>
      </div>
    );
  }

  if (cartLoading && items.length === 0) {
    return (
      <div className="container py-5 text-center text-muted">
        <Loader2 size={28} className="spin mb-3" />
        <p className="small mb-0">Đang tải đơn hàng…</p>
      </div>
    );
  }

  const modalGroup = eventGroups.find((g) => g.eventId === voucherModalEventId);
  const modalVouchers = vouchersByEvent[voucherModalEventId] || [];

  return (
    <div className="container py-4">
      <Link
        to="/cart"
        className="d-inline-flex align-items-center gap-1 small text-muted hover-primary mb-3"
      >
        <ChevronLeft size={15} /> Giỏ hàng
      </Link>
      <h1 className="h4 fw-bold mb-4">Thanh toán</h1>

      <div className="row g-4">
        <div className="col-lg-8">
          {/* Order items */}
          <div className="panel p-4 mb-4">
            <h2 className="section-title h6 mb-3">Chi tiết đơn hàng</h2>

            <div className="d-flex flex-column gap-3">
              {eventGroups.map((group) => {
                const applies =
                  voucher &&
                  (voucher.eventId == null ||
                    String(voucher.eventId) === group.eventId);

                return (
                  <div
                    key={group.eventId}
                    className="p-3 rounded"
                    style={{
                      background: 'var(--surface-2)',
                      border: '1px solid var(--border)',
                    }}
                  >
                    <div className="fw-semibold small mb-2">{group.eventName}</div>

                    {group.items.map((item) => (
                      <div
                        key={item.cartItemId}
                        className="d-flex justify-content-between small text-muted mb-1"
                      >
                        <span>
                          {item.ticketTypeName} × {item.quantity}
                        </span>
                        <span>{formatCurrency(item.price * item.quantity)}</span>
                      </div>
                    ))}

                    <div className="d-flex justify-content-between align-items-center mt-3 pt-3 border-top">
                      <button
                        type="button"
                        className="btn btn-ghost btn-sm px-3 py-1 d-inline-flex align-items-center gap-1"
                        onClick={() => openVoucherModal(group.eventId)}
                      >
                        <Tag size={13} />
                        {applies ? 'Đổi voucher' : 'Chọn voucher'}
                      </button>
                      <span className="fw-semibold">
                        {formatCurrency(group.totalPrice)}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>

            {eventGroups.length > 1 && (
              <p className="text-muted mt-3 mb-0" style={{ fontSize: '0.8125rem' }}>
                <AlertCircle size={13} className="me-1" />
                Mỗi đơn hàng chỉ áp dụng được một mã giảm giá.
              </p>
            )}
          </div>

          {/* Payment method */}
          <div className="panel p-4">
            <h2 className="section-title h6 mb-3">Phương thức thanh toán</h2>
            <div className="d-flex flex-column gap-2">
              {PAYMENT_METHODS.map((method) => {
                const active = paymentMethod === method.id;
                return (
                  <label
                    key={method.id}
                    className="d-flex align-items-center gap-3 p-3 rounded"
                    style={{
                      cursor: 'pointer',
                      background: active ? 'var(--accent-soft)' : 'var(--surface-2)',
                      border: `1px solid ${active ? 'var(--accent)' : 'var(--border)'}`,
                    }}
                  >
                    <input
                      type="radio"
                      name="payment"
                      className="form-check-input mt-0"
                      checked={active}
                      onChange={() => setPaymentMethod(method.id)}
                    />
                    <div>
                      <div className="fw-semibold small">{method.name}</div>
                      <div className="text-muted" style={{ fontSize: '0.75rem' }}>
                        {method.note}
                      </div>
                    </div>
                  </label>
                );
              })}
            </div>
          </div>
        </div>

        {/* Summary */}
        <div className="col-lg-4">
          <div className="panel p-4 sticky-top" style={{ top: 'calc(var(--nav-h) + 16px)' }}>
            <h2 className="section-title h6 mb-3">Tổng cộng</h2>

            <div className="d-flex justify-content-between small text-muted mb-2">
              <span>Tạm tính</span>
              <span style={{ color: 'var(--text)' }}>{formatCurrency(subtotal)}</span>
            </div>

            {voucher && (
              <div className="d-flex justify-content-between align-items-start gap-2 small mb-2">
                <span
                  className="d-inline-flex align-items-center gap-1"
                  style={{ color: 'var(--success)' }}
                >
                  <Tag size={13} /> {voucher.code}
                  <button
                    type="button"
                    className="btn btn-sm border-0 p-0 ms-1 text-muted"
                    onClick={() => setVoucher(null)}
                    aria-label="Bỏ voucher"
                  >
                    <X size={13} />
                  </button>
                </span>
                <span style={{ color: 'var(--success)' }}>
                  −{formatCurrency(discount)}
                </span>
              </div>
            )}

            <hr className="divider my-3" />

            <div className="d-flex justify-content-between align-items-baseline mb-4">
              <span className="fw-semibold">Thành tiền</span>
              <span className="fw-bold fs-5">{formatCurrency(total)}</span>
            </div>

            <button
              className="btn btn-accent w-100 py-2 d-flex align-items-center justify-content-center gap-2"
              onClick={handlePayment}
              disabled={loading || items.length === 0}
            >
              {loading && <Loader2 size={16} className="spin" />}
              {loading ? 'Đang xử lý…' : 'Thanh toán'}
            </button>
          </div>
        </div>
      </div>

      {/* Voucher picker */}
      {voucherModalEventId && (
        <>
          <div
            className="modal-backdrop fade show"
            onClick={() => setVoucherModalEventId(null)}
          />
          <div className="modal d-block" tabIndex={-1} role="dialog">
            <div className="modal-dialog modal-dialog-centered">
              <div className="modal-content">
                <div className="modal-header">
                  <h3 className="modal-title h6 fw-bold mb-0">Chọn mã giảm giá</h3>
                  <button
                    type="button"
                    className="btn-close"
                    onClick={() => setVoucherModalEventId(null)}
                    aria-label="Đóng"
                  />
                </div>
                <div className="modal-body">
                  {voucherLoading ? (
                    <div className="text-center py-4 text-muted">
                      <Loader2 size={24} className="spin" />
                    </div>
                  ) : modalVouchers.length === 0 ? (
                    <p className="text-muted small text-center mb-0 py-3">
                      Sự kiện này chưa có mã giảm giá khả dụng.
                    </p>
                  ) : (
                    <div className="d-flex flex-column gap-2">
                      {voucher && (
                        <button
                          type="button"
                          className="btn btn-ghost text-start p-3"
                          onClick={() => {
                            setVoucher(null);
                            setVoucherModalEventId(null);
                          }}
                        >
                          Không dùng voucher
                        </button>
                      )}
                      {modalVouchers.map((v) => {
                        const usable = modalGroup ? isVoucherUsable(v, modalGroup) : false;
                        return (
                          <button
                            key={v.id}
                            type="button"
                            className="btn btn-ghost text-start p-3"
                            style={{ opacity: usable ? 1 : 0.45 }}
                            disabled={!usable}
                            onClick={() => {
                              setVoucher(v);
                              setVoucherModalEventId(null);
                            }}
                          >
                            <div className="d-flex justify-content-between gap-3">
                              <div>
                                <div className="fw-bold small">{v.code}</div>
                                <div className="text-muted" style={{ fontSize: '0.75rem' }}>
                                  {String(v.discountType).toUpperCase() === 'PERCENTAGE'
                                    ? `Giảm ${Number(v.amount)}%`
                                    : `Giảm ${formatCurrency(v.amount)}`}
                                  {v.maxDiscount != null &&
                                    String(v.discountType).toUpperCase() === 'PERCENTAGE' &&
                                    ` (tối đa ${formatCurrency(v.maxDiscount)})`}
                                </div>
                                {v.minOrderAmount != null && (
                                  <div
                                    style={{ fontSize: '0.75rem' }}
                                    className={usable ? 'text-muted' : ''}
                                  >
                                    <span style={{ color: usable ? undefined : 'var(--danger)' }}>
                                      Đơn tối thiểu {formatCurrency(v.minOrderAmount)}
                                    </span>
                                  </div>
                                )}
                              </div>
                              {v.quantity != null && (
                                <span
                                  className="text-muted flex-shrink-0"
                                  style={{ fontSize: '0.75rem' }}
                                >
                                  Còn {v.quantity}
                                </span>
                              )}
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default Checkout;
