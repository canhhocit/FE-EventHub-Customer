import React, { useEffect, useState, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { XCircle, RefreshCw, ShoppingCart, Loader2 } from 'lucide-react';
import { useCart } from '../context/CartContext';

const PaymentCancel = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [restoring, setRestoring] = useState(true);
  const calledRef = useRef(false);
  const { fetchBackendCart } = useCart();

  useEffect(() => {
    if (calledRef.current) return;
    
    const params = new URLSearchParams(location.search);
    const orderCode = params.get('orderCode');

    if (orderCode) {
      calledRef.current = true;
      const restoreCart = async () => {
        console.log("DEBUG: Calling restore cart API for orderCode:", orderCode);
        try {
          const token = localStorage.getItem('token');
          console.log("DEBUG: Using token:", token ? "Token exists" : "No token found");
          
          const response = await fetch(`http://localhost:8080/bookings/cancel-and-restore-cart?orderCode=${orderCode}`, {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${token}`
            }
          });
          
          const data = await response.json();
          console.log("DEBUG: API Response:", data);
          if (data.code === 1000) {
            await fetchBackendCart();
          }
        } catch (error) {
          console.error("DEBUG: Error restoring cart:", error);
        } finally {
          setRestoring(false);
        }
      };

      restoreCart();
    } else {
      setRestoring(false);
    }
  }, [location]);

  return (
    <div className="container py-5 text-center animate-fade-up">
      <div className="glass-card p-5 mx-auto" style={{ maxWidth: '600px' }}>
        {restoring ? (
          <div className="py-5">
            {/* hoàn tác giỏ hagf */}
            <Loader2 className="animate-spin mx-auto text-primary mb-3" size={48} />
            <p className="text-white">Đang xử lý ...</p>
          </div>
        ) : (
          <>
            <div className="mb-4 d-flex justify-content-center">
              <div className="bg-danger bg-opacity-10 p-3 rounded-circle">
                <XCircle size={80} className="text-danger" />
              </div>
            </div>
            
            <h1 className="fw-bold text-white mb-3">Thanh toán bị hủy</h1>
            <p className="text-muted mb-5 fs-5">
              Bạn đã hủy quá trình thanh toán
            </p>

            <div className="d-flex flex-column flex-sm-row gap-3 justify-content-center">
              <button 
                onClick={() => navigate('/checkout')}
                className="btn btn-gradient px-4 py-2"
              >
                <RefreshCw size={18} className="me-2" /> Thử lại ngay
              </button>
              <button 
                onClick={() => navigate('/cart')}
                className="btn btn-outline-primary px-4 py-2"
              >
                <ShoppingCart size={18} className="me-2" /> Xem giỏ hàng
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default PaymentCancel;
