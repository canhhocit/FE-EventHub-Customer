import { useState, useEffect, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  ShoppingCart,
  Trash2,
  ArrowRight,
  Plus,
  Minus,
  Loader2,
  AlertTriangle,
} from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useToast } from '../context/ToastContext';
import {
  getImageUrl,
  handleImageError,
  formatCurrency,
} from '../utils/constants';

const Cart = () => {
  const { cart, loading, removeFromCart, updateQuantity, clearCart } = useCart();
  const toast = useToast();
  const navigate = useNavigate();

  const [selectedIds, setSelectedIds] = useState([]);
  const [busyId, setBusyId] = useState(null);
  const [initialised, setInitialised] = useState(false);

  // Select everything on the first load, then keep the selection in sync with
  // the cart — without silently re-selecting items the user just unchecked.
  useEffect(() => {
    const ids = cart.map((item) => item.cartItemId);
    setSelectedIds((prev) => {
      if (!initialised && ids.length > 0) return ids;
      return prev.filter((id) => ids.includes(id));
    });
    if (!initialised && (ids.length > 0 || !loading)) setInitialised(true);
  }, [cart, loading, initialised]);

  const toggleSelect = (id) =>
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id],
    );

  const allSelected = cart.length > 0 && selectedIds.length === cart.length;

  const toggleSelectAll = () =>
    setSelectedIds(allSelected ? [] : cart.map((item) => item.cartItemId));

  const { selectedTotal, selectedCount, hasExpired } = useMemo(() => {
    const selected = cart.filter((i) => selectedIds.includes(i.cartItemId));
    return {
      selectedTotal: selected.reduce((t, i) => t + i.price * i.quantity, 0),
      selectedCount: selected.reduce((t, i) => t + i.quantity, 0),
      hasExpired: selected.some(
        (i) => i.saleEndDate && new Date(i.saleEndDate) < new Date(),
      ),
    };
  }, [cart, selectedIds]);

  const runItemAction = async (id, action, failureMessage) => {
    setBusyId(id);
    try {
      await action();
    } catch (err) {
      toast?.error(err.message || failureMessage);
    } finally {
      setBusyId(null);
    }
  };

  const handleClear = async () => {
    if (!window.confirm('Xóa toàn bộ vé trong giỏ hàng?')) return;
    try {
      await clearCart();
      setSelectedIds([]);
      toast?.success('Đã xóa giỏ hàng.');
    } catch (err) {
      toast?.error(err.message || 'Không xóa được giỏ hàng.');
    }
  };

  const handleCheckout = () => {
    if (selectedIds.length === 0) {
      toast?.warning('Vui lòng chọn ít nhất một vé để thanh toán.');
      return;
    }
    if (hasExpired) {
      toast?.error('Có vé đã hết hạn bán trong lựa chọn. Vui lòng bỏ chọn hoặc xóa vé đó.');
      return;
    }
    navigate('/checkout', { state: { selectedCartItemIds: selectedIds } });
  };

  if (loading && cart.length === 0) {
    return (
      <div className="container py-5 text-center text-muted">
        <Loader2 size={28} className="spin mb-3" />
        <p className="small mb-0">Đang tải giỏ hàng…</p>
      </div>
    );
  }

  if (cart.length === 0) {
    return (
      <div className="container py-5">
        <div className="panel p-5 text-center mx-auto" style={{ maxWidth: 480 }}>
          <ShoppingCart size={34} className="text-muted mb-3" />
          <h1 className="h5 fw-bold mb-2">Giỏ hàng trống</h1>
          <p className="text-muted small mb-4">
            Bạn chưa chọn vé nào. Khám phá các sự kiện đang mở bán.
          </p>
          <Link to="/" className="btn btn-accent px-4 py-2">
            Khám phá sự kiện
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container py-4">
      <div className="d-flex align-items-center justify-content-between mb-4">
        <h1 className="h4 fw-bold mb-0 d-flex align-items-center gap-2">
          <ShoppingCart size={22} className="text-primary" /> Giỏ hàng
        </h1>
        <button className="btn btn-ghost btn-sm px-3 py-2" onClick={handleClear}>
          Xóa tất cả
        </button>
      </div>

      <div className="row g-4">
        <div className="col-lg-8">
          <div className="panel">
            <label
              className="d-flex align-items-center gap-2 p-3 border-bottom small text-muted mb-0"
              style={{ cursor: 'pointer' }}
            >
              <input
                type="checkbox"
                className="form-check-input mt-0"
                checked={allSelected}
                onChange={toggleSelectAll}
              />
              Chọn tất cả ({cart.length})
            </label>

            {cart.map((item) => {
              const expired =
                item.saleEndDate && new Date(item.saleEndDate) < new Date();
              const busy = busyId === item.cartItemId;

              return (
                <div
                  key={item.cartItemId}
                  className="d-flex align-items-start gap-3 p-3 border-bottom"
                  style={{ opacity: busy ? 0.5 : 1 }}
                >
                  <input
                    type="checkbox"
                    className="form-check-input mt-2 flex-shrink-0"
                    checked={selectedIds.includes(item.cartItemId)}
                    onChange={() => toggleSelect(item.cartItemId)}
                    aria-label={`Chọn ${item.eventName}`}
                  />

                  <img
                    src={getImageUrl(item.eventImage)}
                    onError={handleImageError}
                    alt=""
                    className="rounded flex-shrink-0"
                    style={{ width: 72, height: 54, objectFit: 'cover' }}
                  />

                  <div className="flex-grow-1 min-w-0">
                    <Link
                      to={`/events/${item.eventId}`}
                      className="fw-semibold small d-block text-truncate text-decoration-none"
                      style={{ color: 'var(--text)' }}
                    >
                      {item.eventName}
                    </Link>
                    <div className="d-flex flex-wrap align-items-center gap-2 mt-1">
                      <span className="pill pill-neutral">{item.ticketTypeName}</span>
                      {expired && (
                        <span className="pill pill-danger d-inline-flex align-items-center gap-1">
                          <AlertTriangle size={11} /> Hết hạn bán
                        </span>
                      )}
                    </div>
                    <div className="text-muted mt-1" style={{ fontSize: '0.8125rem' }}>
                      {formatCurrency(item.price)} / vé
                    </div>
                  </div>

                  <div className="d-flex flex-column align-items-end gap-2 flex-shrink-0">
                    <div className="fw-bold">
                      {formatCurrency(item.price * item.quantity)}
                    </div>
                    <div className="d-flex align-items-center gap-1">
                      <button
                        type="button"
                        className="btn btn-subtle btn-sm px-2 py-1"
                        disabled={busy}
                        onClick={() =>
                          runItemAction(
                            item.cartItemId,
                            () => updateQuantity(item.cartItemId, item.quantity - 1),
                            'Không cập nhật được số lượng.',
                          )
                        }
                        aria-label="Giảm số lượng"
                      >
                        <Minus size={13} />
                      </button>
                      <span className="small fw-semibold text-center" style={{ minWidth: 24 }}>
                        {item.quantity}
                      </span>
                      <button
                        type="button"
                        className="btn btn-subtle btn-sm px-2 py-1"
                        disabled={busy}
                        onClick={() =>
                          runItemAction(
                            item.cartItemId,
                            () => updateQuantity(item.cartItemId, item.quantity + 1),
                            'Không cập nhật được số lượng.',
                          )
                        }
                        aria-label="Tăng số lượng"
                      >
                        <Plus size={13} />
                      </button>
                      <button
                        type="button"
                        className="btn btn-sm border-0 px-2 py-1 text-muted"
                        disabled={busy}
                        onClick={() =>
                          runItemAction(
                            item.cartItemId,
                            () => removeFromCart(item.cartItemId),
                            'Không xóa được vé.',
                          )
                        }
                        aria-label="Xóa khỏi giỏ"
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="col-lg-4">
          <div className="panel p-4 sticky-top" style={{ top: 'calc(var(--nav-h) + 16px)' }}>
            <h2 className="section-title h6 mb-3">Tóm tắt đơn hàng</h2>

            <div className="d-flex justify-content-between small text-muted mb-2">
              <span>Vé đã chọn</span>
              <span style={{ color: 'var(--text)' }}>{selectedCount}</span>
            </div>

            <hr className="divider my-3" />

            <div className="d-flex justify-content-between align-items-baseline mb-4">
              <span className="fw-semibold">Tạm tính</span>
              <span className="fw-bold fs-5">{formatCurrency(selectedTotal)}</span>
            </div>

            {hasExpired && (
              <div className="alert alert-danger py-2 px-3">
                Lựa chọn của bạn có vé đã hết hạn bán.
              </div>
            )}

            <button
              className="btn btn-accent w-100 py-2 d-flex align-items-center justify-content-center gap-2"
              onClick={handleCheckout}
              disabled={selectedIds.length === 0}
            >
              Thanh toán ({selectedIds.length}) <ArrowRight size={16} />
            </button>
            <Link to="/" className="btn btn-ghost w-100 py-2 mt-2">
              Tiếp tục chọn vé
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Cart;
