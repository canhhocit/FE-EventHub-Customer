import React from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckCircle, ArrowRight } from 'lucide-react';

const PaymentSuccess = () => {
  const navigate = useNavigate();

  return (
    <div className="container py-5 text-center animate-fade-up">
      <div className="glass-card p-5 mx-auto" style={{ maxWidth: '600px' }}>
        <div className="mb-4 d-flex justify-content-center">
          <div className="bg-success bg-opacity-10 p-3 rounded-circle">
            <CheckCircle size={80} className="text-success" />
          </div>
        </div>
        
        <h1 className="fw-bold text-white mb-3">Thanh toán thành công!</h1>
        <p className="text-muted mb-5 fs-5">
          Cảm ơn bạn đã mua vé. Đơn hàng của bạn đang được xử lý và vé điện tử sẽ được gửi đến email của bạn trong giây lát.
        </p>

        <div className="d-flex flex-column flex-sm-row gap-3 justify-content-center">
          <button 
            onClick={() => navigate('/my-tickets')}
            className="btn btn-gradient px-4 py-2"
          >
            Xem vé của tôi
          </button>
          <button 
            onClick={() => navigate('/')}
            className="btn btn-outline-primary px-4 py-2"
          >
            Quay lại trang chủ <ArrowRight size={18} className="ms-2" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default PaymentSuccess;
