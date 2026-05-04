import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { CreditCard, Tag, CheckCircle } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { validateVoucher, checkoutSelected } from '../utils/api';

const Checkout = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { cart, fetchBackendCart } = useCart();
  
  const selectedCartItemIds = location.state?.selectedCartItemIds || [];
  // cart bây giờ đã là Mảng nên .filter sẽ chạy bình thường
  const checkoutItems = cart.filter(item => selectedCartItemIds.includes(item.cartItemId));
  
  const [voucherCode, setVoucherCode] = useState('');
  const [discountAmount, setDiscountAmount] = useState(0);
  const [paymentMethod, setPaymentMethod] = useState('PAYOS');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      alert("Vui lòng đăng nhập để thanh toán!");
      navigate('/login');
      return;
    }
    if (checkoutItems.length === 0 && !success) {
      navigate('/cart');
    }
  }, [checkoutItems, navigate, success]);

  const subtotal = checkoutItems.reduce((total, item) => total + (item.price * item.quantity), 0);

  const handleApplyVoucher = async () => {
    if (!voucherCode) return;
    try {
      const eventAmounts = {};
      checkoutItems.forEach(item => {
        eventAmounts[item.eventId] = (eventAmounts[item.eventId] || 0) + (item.price * item.quantity);
      });

      const data = await validateVoucher({ code: voucherCode, eventAmounts });
      
      if (data.result !== undefined) {
        setDiscountAmount(data.result);
        alert(`Áp mã thành công! Giảm: ${data.result.toLocaleString('vi-VN')}đ`);
      } else {
        alert("Lỗi áp dụng mã: " + (data.message || "Mã không hợp lệ hoặc không áp dụng cho các mục đã chọn"));
      }
    } catch (error) {
      console.error(error);
      alert("Lỗi hệ thống: " + (error.message || "Không thể kiểm tra mã giảm giá"));
    }
  };

  const handlePayment = async () => {
    setLoading(true);
    try {
      const data = await checkoutSelected(selectedCartItemIds, paymentMethod, voucherCode);
      
      if (data.code === 1000) {
        if (data.result && data.result.paymentUrl && paymentMethod === 'PAYOS') {
          window.location.href = data.result.paymentUrl;
          return;
        }

        await fetchBackendCart();
        setSuccess(true);
        setTimeout(() => {
          navigate('/my-tickets');
        }, 3000);
        return;
      } else {
        alert("Thanh toán thất bại: " + (data.message || "Vui lòng thử lại sau"));
      }
    } catch (error) {
      console.error('Checkout error:', error);
      alert("Lỗi hệ thống: " + (error.message || "Không thể hoàn tất thanh toán"));
    } finally {
      setLoading(false);
    }
  };

  const total = subtotal - discountAmount;

  if (success) {
    return (
      <div className="container py-5 text-center animate-fade-up">
        <div className="glass-card p-5 mx-auto" style={{ maxWidth: '500px' }}>
          <CheckCircle size={64} className="text-success mb-4 mx-auto" />
          <h2 className="fw-bold mb-3">Thanh toán thành công!</h2>
          <p className="text-muted">
            Hóa đơn điện tử PDF đã được gửi vào Email của bạn.
            <br />Hệ thống sẽ chuyển về trang Quản lý vé...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="container py-4">
      <h2 className="fw-bold mb-4">Thanh toán</h2>
      <div className="row g-4">
        <div className="col-lg-8 animate-fade-up">
          <div className="glass-card p-4 mb-4">
            <h5 className="fw-bold mb-4">Chi tiết vé</h5>
            {checkoutItems.map((item, idx) => (
              <div key={idx} className="d-flex justify-content-between align-items-center mb-3 pb-3 border-bottom border-secondary">
                <div>
                  <h6 className="mb-1">{item.eventName}</h6>
                  <small className="text-muted">{item.ticketTypeName} x {item.quantity}</small>
                </div>
                <span className="fw-bold">{(item.price * item.quantity).toLocaleString('vi-VN')}đ</span>
              </div>
            ))}
          </div>

          <div className="glass-card p-4">
            <h5 className="fw-bold mb-4">Phương thức thanh toán</h5>
            <div className="d-flex flex-column gap-3">
              <label className={`d-flex align-items-center gap-3 p-3 border rounded cursor-pointer transition-all ${paymentMethod === 'PAYOS' ? 'border-primary bg-primary bg-opacity-10' : 'border-secondary bg-dark'}`} onClick={() => setPaymentMethod('PAYOS')}>
                <input 
                  type="radio" 
                  name="payment" 
                  checked={paymentMethod === 'PAYOS'}
                  onChange={() => setPaymentMethod('PAYOS')}
                  className="form-check-input mt-0"
                />
                <img 
                  src="https://th.bing.com/th/id/OIP.7088OwVKnkxm9jJwOy8z5QHaHa?w=161&h=180&c=7&r=0&o=7&dpr=1.1&pid=1.7&rm=3" 
                  height={40}
                  width={40}
                  alt="VietQR(PayOS)" 
                  className="rounded object-fit-contain bg-white px-2"
                />
                <span className="fw-medium">VietQR</span>
              </label>

              <label className={`d-flex align-items-center gap-3 p-3 border rounded cursor-pointer transition-all ${paymentMethod === 'MOMO' ? 'border-primary bg-primary bg-opacity-10' : 'border-secondary bg-dark'}`} onClick={() => setPaymentMethod('MOMO')}>
                <input 
                  type="radio" 
                  name="payment" 
                  checked={paymentMethod === 'MOMO'}
                  onChange={() => setPaymentMethod('MOMO')}
                  className="form-check-input mt-0"
                />
                <img 
                  src="https://cdn.haitrieu.com/wp-content/uploads/2022/10/Logo-MoMo-Square.png" 
                  width={40} 
                  height={40}
                  alt="Momo" 
                  className="rounded shadow-sm"
                />
                <div className="d-flex flex-column">
                    <span className="fw-medium">Momo</span>
                    <small className="text-warning">Giả lập</small>
                </div>
              </label>
            </div>
          </div>
        </div>

        <div className="col-lg-4 animate-fade-up" style={{ animationDelay: '0.1s' }}>
          <div className="glass-card p-4 sticky-top" style={{ top: '100px' }}>
            <h5 className="fw-bold mb-4">Mã khuyến mãi</h5>
            <div className="d-flex gap-2 mb-4">
              <input 
                type="text" 
                className="form-control bg-dark text-white border-secondary" 
                placeholder="Nhập mã voucher..."
                value={voucherCode}
                onChange={(e) => setVoucherCode(e.target.value)}
              />
              <button className="btn btn-outline-primary" onClick={handleApplyVoucher}>Áp dụng</button>
            </div>

            <h5 className="fw-bold mb-4">Tổng cộng</h5>
            <div className="d-flex justify-content-between mb-2 text-muted">
              <span>Tạm tính:</span>
              <span>{subtotal.toLocaleString('vi-VN')}đ</span>
            </div>
            {discountAmount > 0 && (
              <div className="d-flex justify-content-between mb-2 text-success">
                <span><Tag size={14} className="me-1"/> Giảm giá:</span>
                <span>-{discountAmount.toLocaleString('vi-VN')}đ</span>
              </div>
            )}
            <hr className="border-secondary" />
            <div className="d-flex justify-content-between mb-4">
              <span className="fw-bold fs-5">Thành tiền:</span>
              <span className="fw-bold fs-4 text-gradient">{total.toLocaleString('vi-VN')}đ</span>
            </div>

            <button 
              className="btn btn-gradient w-100 py-3 rounded-pill fs-5"
              onClick={handlePayment}
              disabled={loading || checkoutItems.length === 0}
            >
              {loading ? (
                <span className="spinner-border spinner-border-sm me-2"></span>
              ) : (
                'Thanh toán'
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;
