import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { XCircle, ArrowLeft, ShoppingCart, Loader2 } from 'lucide-react';
import { cancelAndRestoreCart } from '../utils/api';
import { useCart } from '../context/CartContext';

const PaymentCancel = () => {
  const [searchParams] = useSearchParams();
  const orderCode = searchParams.get('orderCode');
  const { fetchBackendCart } = useCart();
  const [restoring, setRestoring] = useState(!!orderCode);
  const [restored, setRestored] = useState(false);

  useEffect(() => {
    try {
      sessionStorage.removeItem('checkoutHoldExpiry');
    } catch {
      /* ignore */
    }
    if (!orderCode) return;
    let cancelled = false;

    cancelAndRestoreCart(orderCode)
      .then((data) => !cancelled && setRestored(data?.code === 1000))
      .catch(() => {})
      .finally(async () => {
        await fetchBackendCart().catch(() => {});
        if (!cancelled) setRestoring(false);
      });

    return () => {
      cancelled = true;
    };
  }, [orderCode, fetchBackendCart]);

  return (
    <div className="container py-5">
      <div className="panel p-5 text-center mx-auto animate-fade-up" style={{ maxWidth: 520 }}>
        <XCircle size={48} className="mb-3" style={{ color: 'var(--danger)' }} />
        <h1 className="h4 fw-bold mb-2">Thanh toán đã bị hủy</h1>
        <p className="text-muted mb-4">
          {restoring ? (
            <span className="d-inline-flex align-items-center gap-2">
              <Loader2 size={15} className="spin" /> Đang khôi phục giỏ hàng…
            </span>
          ) : restored ? (
            'Các vé trong đơn đã được trả lại giỏ hàng. Bạn có thể thanh toán lại bất cứ lúc nào.'
          ) : (
            'Giao dịch chưa hoàn tất. Bạn có thể quay lại giỏ hàng để thử lại.'
          )}
        </p>
        <div className="d-flex flex-column flex-sm-row gap-2 justify-content-center">
          <Link
            to="/cart"
            className="btn btn-accent px-4 py-2 d-inline-flex align-items-center justify-content-center gap-2"
          >
            <ShoppingCart size={16} /> Về giỏ hàng
          </Link>
          <Link
            to="/"
            className="btn btn-ghost px-4 py-2 d-inline-flex align-items-center justify-content-center gap-2"
          >
            <ArrowLeft size={16} /> Trang chủ
          </Link>
        </div>
      </div>
    </div>
  );
};

export default PaymentCancel;
