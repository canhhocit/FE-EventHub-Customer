import { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import {
  Tag,
  CheckCircle2,
  X,
  Loader2,
  ChevronLeft,
  AlertCircle,
  Timer,
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

  const HOLD_DURATION_SECONDS = 10 * 60; // 10 phút

  const [timeLeft, setTimeLeft] = useState(() => {
    const saved = sessionStorage.getItem('checkoutHoldExpiry');
    if (saved) {
      const diff = Math.floor((parseInt(saved, 10) - Date.now()) / 1000);
      if (diff > 0) return diff;
    }
    const newExpiry = Date.now() + HOLD_DURATION_SECONDS * 1000;
    sessionStorage.setItem('checkoutHoldExpiry', String(newExpiry));
    return HOLD_DURATION_SECONDS;
  });

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

  // If items change and voucher no longer applies, voucher is dropped in calculation
  const activeVoucher = voucherBase > 0 ? voucher : null;
  const discount = computeDiscount(activeVoucher, voucherBase);
  const total = Math.max(0, subtotal - discount);

  // Countdown timer for 10-minute hold
  useEffect(() => {
    if (success || settled.current || items.length === 0) return;

    const timer = setInterval(() => {
      const saved = sessionStorage.getItem('checkoutHoldExpiry');
      if (!saved) return;
      const diff = Math.floor((parseInt(saved, 10) - Date.now()) / 1000);
      if (diff <= 0) {
        clearInterval(timer);
        setTimeLeft(0);
        sessionStorage.removeItem('checkoutHoldExpiry');
        sessionStorage.removeItem('checkoutItemIds');
        toast?.error('Đã hết 10 phút giữ vé! Vé của bạn đã được hoàn lại kho.');
      } else {
        setTimeLeft(diff);
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [items.length, success, toast]);

  // Nothing to pay for → back to the cart.
  useEffect(() => {
    if (success || cartLoading || settled.current) return;
    if (items.length === 0) {
      navigate('/cart', { replace: true });
    }
  }, [items.length, cartLoading, success, navigate]);

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
      sessionStorage.removeItem('checkoutHoldExpiry');
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

      if (paymentMethod === 'PAYOS') {
        throw new Error('Không thể khởi tạo liên kết thanh toán PayOS. Vui lòng thử lại sau.');
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

  if (timeLeft <= 0) {
    return (
      <div className="container py-5">
        <div className="panel p-5 text-center mx-auto" style={{ maxWidth: 480 }}>
          <AlertCircle size={44} className="mb-3 text-danger" />
          <h1 className="h5 fw-bold mb-2">Đã hết thời gian giữ vé</h1>
          <p className="text-muted small mb-4">
            Đã quá 10 phút giữ vé. Để đảm bảo công bằng cho các khách hàng khác, các vé trong đơn hàng đã được tự động hoàn lại hệ thống. Vui lòng quay lại giỏ hàng và đặt lại vé.
          </p>
          <div className="d-flex justify-content-center gap-2">
            <Link to="/cart" className="btn btn-accent px-4 py-2">
              Quay lại giỏ hàng
            </Link>
          </div>
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

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  const formattedTime = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
  const isUrgent = timeLeft <= 180;
  const isCritical = timeLeft <= 60;
  const progressPercent = Math.max(0, Math.min(100, (timeLeft / HOLD_DURATION_SECONDS) * 100));

  return (
    <div className="container py-4">
      <Link
        to="/cart"
        className="d-inline-flex align-items-center gap-1 small text-muted hover-primary mb-3"
      >
        <ChevronLeft size={15} /> Giỏ hàng
      </Link>
      <h1 className="h4 fw-bold mb-3">Thanh toán</h1>

      {/* Ticket Hold Countdown Banner */}
      <div
        className="p-3 mb-4 rounded-3 d-flex flex-column flex-sm-row align-items-sm-center justify-content-between gap-3 shadow-sm"
        style={{
          background: isCritical
            ? 'linear-gradient(135deg, rgba(220, 53, 69, 0.12) 0%, rgba(220, 53, 69, 0.04) 100%)'
            : isUrgent
            ? 'linear-gradient(135deg, rgba(255, 193, 7, 0.15) 0%, rgba(255, 193, 7, 0.04) 100%)'
            : 'linear-gradient(135deg, rgba(69, 96, 230, 0.10) 0%, rgba(69, 96, 230, 0.03) 100%)',
          border: `1.5px solid ${
            isCritical ? 'var(--danger, #dc3545)' : isUrgent ? 'var(--warning, #ffc107)' : 'var(--accent, #4560e6)'
          }`,
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        <div className="d-flex align-items-center gap-3">
          <div
            className="rounded-circle d-flex align-items-center justify-content-center"
            style={{
              width: 42,
              height: 42,
              background: isCritical
                ? 'rgba(220, 53, 69, 0.2)'
                : isUrgent
                ? 'rgba(255, 193, 7, 0.25)'
                : 'rgba(69, 96, 230, 0.15)',
              color: isCritical
                ? 'var(--danger, #dc3545)'
                : isUrgent
                ? '#b57a00'
                : 'var(--accent, #4560e6)',
              flexShrink: 0,
            }}
          >
            <Timer size={20} />
          </div>
          <div>
            <div className="d-flex align-items-center gap-2">
              <span className="fw-bold small" style={{ color: isCritical ? '#dc3545' : 'inherit' }}>
                Thời gian giữ vé còn lại
              </span>
              {isCritical && (
                <span className="badge bg-danger text-white rounded-pill px-2 py-0" style={{ fontSize: '0.7rem' }}>
                  Sắp hết hạn
                </span>
              )}
            </div>
            <div className="text-muted" style={{ fontSize: '0.8125rem' }}>
              Vé tạm giữ tự động nhả về kho sau 10 phút nếu chưa thanh toán hoàn tất.
            </div>
          </div>
        </div>

        <div className="d-flex align-items-center gap-2 align-self-sm-center">
          <div
            className="px-3 py-1 rounded-2 fw-bold font-monospace text-center shadow-sm"
            style={{
              fontSize: '1.25rem',
              letterSpacing: '1px',
              background: isCritical ? '#dc3545' : isUrgent ? '#e08a00' : 'var(--accent, #4560e6)',
              color: '#ffffff',
              minWidth: 88,
            }}
          >
            {formattedTime}
          </div>
        </div>

        {/* Thin progress line at bottom */}
        <div
          style={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            height: 3,
            width: `${progressPercent}%`,
            background: isCritical ? '#dc3545' : isUrgent ? '#ffc107' : 'var(--accent, #4560e6)',
            transition: 'width 1s linear',
          }}
        />
      </div>

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
