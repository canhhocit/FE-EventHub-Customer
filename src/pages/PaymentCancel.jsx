import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { XCircle, ArrowLeft, RefreshCw } from 'lucide-react';
import { cancelAndRestoreCart } from '../api/api';

const PaymentCancel = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const orderCode = searchParams.get('orderCode');

  useEffect(() => {
    const handleCancel = async () => {
      if (!orderCode) return;
      
      try {
        const data = await cancelAndRestoreCart(orderCode);
        if (data.code === 1000) {
          console.log('Đã hủy thanh toán và khôi phục giỏ hàng');
        }
      } catch (error) {
        console.error('Lỗi khi xử lý hủy thanh toán:', error);
      }
    };

    handleCancel();
  }, [orderCode]);

  return (
    <div className="container py-5 text-center">
      <div className="glass-card p-5 max-w-lg mx-auto animate-fade-up">
        <XCircle size={80} className="text-danger mb-4 mx-auto" />
        <h2 className="fw-bold mb-3">Thanh toán đã bị hủy</h2>
        <p className="text-muted mb-5">
          Giao dịch của bạn đã bị hủy bỏ. Nếu đây là nhầm lẫn, bạn có thể quay lại giỏ hàng để thực hiện lại thanh toán.
        </p>
        
        <div className="d-flex flex-column gap-3">
          <button 
            onClick={() => navigate('/checkout')}
            className="btn btn-primary py-3 rounded-pill fw-bold d-flex align-items-center justify-content-center gap-2"
          >
            <RefreshCw size={20} /> Thử lại thanh toán
          </button>
          
          <button 
            onClick={() => navigate('/')}
            className="btn btn-outline-light py-2 rounded-pill d-flex align-items-center justify-content-center gap-2"
          >
            <ArrowLeft size={18} /> Quay về trang chủ
          </button>
        </div>
      </div>
    </div>
  );
};

export default PaymentCancel;
