import { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  Calendar,
  MapPin,
  Ticket,
  Info,
  ShoppingCart,
  Plus,
  Minus,
  Loader2,
  AlertCircle,
  ChevronLeft,
  Clock,
} from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { getEventDetail } from '../utils/api';
import {
  getImageUrl,
  handleImageError,
  formatCurrency,
  formatDateTime,
  getEventStatus,
  getEventLocation,
} from '../utils/constants';

const EventDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const { isAuthenticated } = useAuth();
  const toast = useToast();

  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [quantities, setQuantities] = useState({});
  const [submitting, setSubmitting] = useState(null); // 'cart' | 'now' | null

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError('');
    setQuantities({});

    getEventDetail(id)
      .then((data) => {
        if (cancelled) return;
        if (data?.code === 1000 && data.result) setEvent(data.result);
        else setError(data?.message || 'Không tìm thấy sự kiện.');
      })
      .catch((err) => !cancelled && setError(err.message))
      .finally(() => !cancelled && setLoading(false));

    return () => {
      cancelled = true;
    };
  }, [id]);

  /** Single source of truth for whether tickets can be bought right now. */
  const sale = useMemo(() => {
    if (!event) return { canBuy: false, reason: '' };

    const now = new Date();
    const start = event.saleStartDate ? new Date(event.saleStartDate) : null;
    const end = event.saleEndDate ? new Date(event.saleEndDate) : null;
    const types = event.ticketTypes || [];
    const soldOut =
      types.length > 0 && types.every((t) => Number(t.remainingQuantity) <= 0);

    if (types.length === 0)
      return { canBuy: false, reason: 'Sự kiện chưa công bố hạng vé.', tone: 'info' };
    if (event.status === 'CANCELLED')
      return { canBuy: false, reason: 'Sự kiện đã bị hủy.', tone: 'danger' };
    if (start && now < start)
      return {
        canBuy: false,
        reason: `Mở bán từ ${formatDateTime(event.saleStartDate)}`,
        tone: 'info',
        label: 'Chưa mở bán',
      };
    if (end && now > end)
      return {
        canBuy: false,
        reason: 'Đã kết thúc thời gian bán vé.',
        tone: 'danger',
        label: 'Đã kết thúc',
      };
    if (event.status !== 'OPENING')
      return {
        canBuy: false,
        reason: 'Sự kiện hiện chưa mở bán vé.',
        tone: 'info',
        label: 'Chưa mở bán',
      };
    if (soldOut)
      return { canBuy: false, reason: 'Vé đã bán hết.', tone: 'danger', label: 'Hết vé' };

    return { canBuy: true, reason: '' };
  }, [event]);

  const setQty = (ticketType, next) => {
    const max = Math.max(0, Number(ticketType.remainingQuantity) || 0);
    setQuantities((prev) => ({
      ...prev,
      [ticketType.id]: Math.min(Math.max(0, next), max),
    }));
  };

  const selection = useMemo(() => {
    if (!event?.ticketTypes) return [];
    return event.ticketTypes
      .map((t) => ({
        typeId: t.id,
        typeName: t.name,
        price: Number(t.price) || 0,
        qty: quantities[t.id] || 0,
      }))
      .filter((t) => t.qty > 0);
  }, [event, quantities]);

  const selectionTotal = selection.reduce((sum, t) => sum + t.price * t.qty, 0);
  const selectionCount = selection.reduce((sum, t) => sum + t.qty, 0);

  const submit = async (mode) => {
    if (!isAuthenticated) {
      toast?.warning('Vui lòng đăng nhập để đặt vé.');
      navigate('/login', { state: { from: { pathname: `/events/${id}` } } });
      return;
    }
    if (selection.length === 0) {
      toast?.warning('Vui lòng chọn ít nhất một vé.');
      return;
    }

    setSubmitting(mode);
    try {
      const updatedCart = await addToCart(selection);
      setQuantities({});

      if (mode === 'now') {
        // Checkout needs the server-side cart item ids for what we just added.
        const selectedTypeIds = new Set(selection.map((s) => String(s.typeId)));
        const ids = updatedCart
          .filter((item) => selectedTypeIds.has(String(item.ticketTypeId)))
          .map((item) => item.cartItemId);

        if (ids.length === 0) {
          toast?.error('Không xác định được vé vừa chọn. Vui lòng mở giỏ hàng.');
          navigate('/cart');
          return;
        }
        navigate('/checkout', { state: { selectedCartItemIds: ids } });
        return;
      }

      toast?.success('Đã thêm vé vào giỏ hàng.');
    } catch (err) {
      toast?.error(err.message || 'Không thêm được vé vào giỏ hàng.');
    } finally {
      setSubmitting(null);
    }
  };

  if (loading) {
    return (
      <div className="container py-5 text-center text-muted">
        <Loader2 size={30} className="spin mb-3" />
        <p className="small mb-0">Đang tải sự kiện…</p>
      </div>
    );
  }

  if (error || !event) {
    return (
      <div className="container py-5">
        <div className="panel p-5 text-center mx-auto" style={{ maxWidth: 520 }}>
          <AlertCircle size={34} className="mb-3" style={{ color: 'var(--danger)' }} />
          <h1 className="h5 fw-bold mb-2">Không xem được sự kiện</h1>
          <p className="text-muted small mb-4">{error || 'Sự kiện không tồn tại.'}</p>
          <Link to="/" className="btn btn-accent px-4 py-2">
            Về trang chủ
          </Link>
        </div>
      </div>
    );
  }

  const status = getEventStatus(event.status);

  return (
    <div className="container py-4">
      <Link
        to="/"
        className="d-inline-flex align-items-center gap-1 small text-muted hover-primary mb-3"
      >
        <ChevronLeft size={15} /> Danh sách sự kiện
      </Link>

      <div className="row g-4">
        {/* ---- Left: media + description ---- */}
        <div className="col-lg-8">
          <div
            className="panel overflow-hidden mb-4"
            style={{ borderRadius: 'var(--r-lg)' }}
          >
            <div style={{ aspectRatio: '16 / 8', background: 'var(--surface-2)' }}>
              <img
                src={getImageUrl(event.imageUrls?.[0])}
                onError={handleImageError}
                alt=""
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
            </div>

            <div className="p-4">
              <div className="d-flex flex-wrap align-items-center gap-2 mb-3">
                <span className={`pill ${status.pill}`}>{status.label}</span>
                {event.category?.name && (
                  <span className="pill pill-neutral">{event.category.name}</span>
                )}
              </div>

              <h1 className="h3 fw-bold mb-3">{event.name}</h1>

              <div className="row g-3 mb-4">
                <div className="col-sm-6 d-flex align-items-start gap-2">
                  <Calendar size={17} className="text-muted flex-shrink-0 mt-1" />
                  <div>
                    <div className="small text-muted">Thời gian diễn ra</div>
                    <div className="small">{formatDateTime(event.startTime)}</div>
                  </div>
                </div>
                <div className="col-sm-6 d-flex align-items-start gap-2">
                  <MapPin size={17} className="text-muted flex-shrink-0 mt-1" />
                  <div>
                    <div className="small text-muted">Địa điểm</div>
                    <div className="small">{getEventLocation(event)}</div>
                  </div>
                </div>
                {event.saleEndDate && (
                  <div className="col-sm-6 d-flex align-items-start gap-2">
                    <Clock size={17} className="text-muted flex-shrink-0 mt-1" />
                    <div>
                      <div className="small text-muted">Kết thúc bán vé</div>
                      <div className="small">{formatDateTime(event.saleEndDate)}</div>
                    </div>
                  </div>
                )}
                {event.organizer?.fullName && (
                  <div className="col-sm-6 d-flex align-items-start gap-2">
                    <Info size={17} className="text-muted flex-shrink-0 mt-1" />
                    <div>
                      <div className="small text-muted">Ban tổ chức</div>
                      <div className="small">{event.organizer.fullName}</div>
                    </div>
                  </div>
                )}
              </div>

              <hr className="divider mb-4" />

              <h2 className="section-title h6 mb-3">Giới thiệu</h2>
              <div
                className="text-muted"
                style={{ lineHeight: 1.75, fontSize: '0.9375rem' }}
                dangerouslySetInnerHTML={{
                  __html: event.description || 'Chưa có mô tả chi tiết.',
                }}
              />
            </div>
          </div>
        </div>

        {/* ---- Right: ticket picker ---- */}
        <div className="col-lg-4">
          <div className="panel p-4 sticky-top" style={{ top: 'calc(var(--nav-h) + 16px)' }}>
            <h2 className="section-title h6 d-flex align-items-center gap-2 mb-3">
              <Ticket size={18} className="text-muted" /> Chọn vé
            </h2>

            {!sale.canBuy && sale.reason && (
              <div
                className={`alert py-2 px-3 alert-${sale.tone === 'danger' ? 'danger' : 'info'}`}
              >
                {sale.reason}
              </div>
            )}

            {(event.ticketTypes || []).length === 0 ? (
              <p className="text-muted small mb-0">Sự kiện chưa có hạng vé nào.</p>
            ) : (
              <div className="d-flex flex-column gap-2 mb-3">
                {event.ticketTypes.map((tt) => {
                  const remaining = Number(tt.remainingQuantity) || 0;
                  const qty = quantities[tt.id] || 0;
                  const disabled = !sale.canBuy || remaining <= 0;

                  return (
                    <div
                      key={tt.id}
                      className="p-3 rounded"
                      style={{
                        background: 'var(--surface-2)',
                        border: '1px solid var(--border)',
                        opacity: disabled ? 0.6 : 1,
                      }}
                    >
                      <div className="d-flex justify-content-between align-items-start gap-2 mb-1">
                        <div className="min-w-0">
                          <div className="fw-semibold small">{tt.name}</div>
                          {tt.description && (
                            <div className="text-muted clamp-2" style={{ fontSize: '0.75rem' }}>
                              {tt.description}
                            </div>
                          )}
                        </div>
                        <div className="fw-bold text-primary flex-shrink-0">
                          {formatCurrency(tt.price)}
                        </div>
                      </div>

                      <div className="d-flex justify-content-between align-items-center mt-2">
                        <span
                          className="text-muted"
                          style={{ fontSize: '0.75rem' }}
                        >
                          {remaining > 0 ? `Còn ${remaining} vé` : 'Hết vé'}
                        </span>
                        <div className="d-flex align-items-center gap-1">
                          <button
                            type="button"
                            className="btn btn-subtle btn-sm px-2 py-1"
                            onClick={() => setQty(tt, qty - 1)}
                            disabled={disabled || qty === 0}
                            aria-label={`Bớt vé ${tt.name}`}
                          >
                            <Minus size={14} />
                          </button>
                          <span
                            className="text-center fw-semibold small"
                            style={{ minWidth: 26 }}
                          >
                            {qty}
                          </span>
                          <button
                            type="button"
                            className="btn btn-subtle btn-sm px-2 py-1"
                            onClick={() => setQty(tt, qty + 1)}
                            disabled={disabled || qty >= remaining}
                            aria-label={`Thêm vé ${tt.name}`}
                          >
                            <Plus size={14} />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {selectionCount > 0 && (
              <div
                className="d-flex justify-content-between align-items-baseline py-3 mb-2 border-top border-bottom"
              >
                <span className="small text-muted">{selectionCount} vé</span>
                <span className="fw-bold fs-5">{formatCurrency(selectionTotal)}</span>
              </div>
            )}

            <div className="d-flex flex-column gap-2">
              <button
                type="button"
                className="btn btn-accent py-2 d-flex align-items-center justify-content-center gap-2"
                onClick={() => submit('now')}
                disabled={!sale.canBuy || !!submitting}
              >
                {submitting === 'now' ? (
                  <Loader2 size={16} className="spin" />
                ) : (
                  <ShoppingCart size={16} />
                )}
                {sale.label || 'Mua ngay'}
              </button>
              <button
                type="button"
                className="btn btn-ghost py-2 d-flex align-items-center justify-content-center gap-2"
                onClick={() => submit('cart')}
                disabled={!sale.canBuy || !!submitting}
              >
                {submitting === 'cart' ? (
                  <Loader2 size={16} className="spin" />
                ) : (
                  <Plus size={16} />
                )}
                Thêm vào giỏ
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EventDetail;
