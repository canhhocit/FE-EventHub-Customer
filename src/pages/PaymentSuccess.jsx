import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { CheckCircle2, ArrowRight } from 'lucide-react';
import { useCart } from '../context/CartContext';

const PaymentSuccess = () => {
  const { fetchBackendCart } = useCart();

  // The paid items are gone from the server cart — pull the new state so the
  // navbar badge doesn't keep counting tickets that were already bought.
  useEffect(() => {
    fetchBackendCart().catch(() => {});
    try {
      sessionStorage.removeItem('checkoutItemIds');
      sessionStorage.removeItem('checkoutHoldExpiry');
    } catch {
      /* ignore */
    }
  }, [fetchBackendCart]);

  return (
    <div className="container py-5">
      <div className="panel p-5 text-center mx-auto animate-fade-up" style={{ maxWidth: 520 }}>
        <CheckCircle2 size={48} className="mb-3" style={{ color: 'var(--success)' }} />
        <h1 className="h4 fw-bold mb-2">Thanh toán thành công</h1>
        <p className="text-muted mb-4">
          Cảm ơn bạn. Vé điện tử và hóa đơn sẽ được gửi tới email trong ít phút.
        </p>
        <div className="d-flex flex-column flex-sm-row gap-2 justify-content-center">
          <Link to="/my-tickets" className="btn btn-accent px-4 py-2">
            Xem vé của tôi
          </Link>
          <Link
            to="/"
            className="btn btn-ghost px-4 py-2 d-inline-flex align-items-center justify-content-center gap-2"
          >
            Về trang chủ <ArrowRight size={16} />
          </Link>
        </div>
      </div>
    </div>
  );
};

export default PaymentSuccess;
