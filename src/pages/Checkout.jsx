import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { CreditCard, Tag, CheckCircle } from 'lucide-react';
import { useCart } from '../context/CartContext';

const Checkout = () => {
  const navigate = useNavigate();
  const { cart, getCartTotal, clearCart } = useCart();
  
  const [voucherCode, setVoucherCode] = useState('');
  const [discountAmount, setDiscountAmount] = useState(0);
  const [paymentMethod, setPaymentMethod] = useState('CREDIT_CARD');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      alert("Vui lòng đăng nhập để thanh toán!");
      navigate('/login');
      return;
    }
    if (cart.length === 0 && !success) {
      navigate('/cart');
    }
  }, [cart, navigate, success]);

  const subtotal = getCartTotal();

  const handleApplyVoucher = async () => {
    if (!voucherCode) return;
    try {
      const token = localStorage.getItem('token');
      const eventId = cart[0]?.eventId;
      const response = await fetch(`http://localhost:8080/vouchers/validate?code=${voucherCode}&amount=${subtotal}&eventId=${eventId || ''}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await response.json();
      
      if (data.result !== undefined) {
        setDiscountAmount(data.result);
        alert(`Áp dụng mã giảm giá thành công! Giảm: ${data.result.toLocaleString('vi-VN')}đ`);
      } else {
        alert(data.message || "Mã giảm giá không hợp lệ hoặc đã hết hạn");
      }
    } catch (error) {
      console.error(error);
      alert("Lỗi khi kiểm tra mã giảm giá");
    }
  };

  const handlePayment = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:8080/bookings/checkout?paymentMethod=${paymentMethod}&voucherCode=${voucherCode}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      const data = await response.json();
      
      if (data.code === 1000) {
        clearCart();
        setSuccess(true);
        setTimeout(() => {
          navigate('/my-tickets');
        }, 3000);
      } else {
        alert("Lỗi: " + (data.message || "Thanh toán thất bại!"));
      }
    } catch (error) {
      console.error('Checkout error:', error);
      alert("Không thể kết nối đến máy chủ thanh toán!");
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
        {/* Cột trái: Thông tin đơn hàng */}
        <div className="col-lg-8 animate-fade-up">
          <div className="glass-card p-4 mb-4">
            <h5 className="fw-bold mb-4">Chi tiết vé</h5>
            {cart.map((item, idx) => (
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
              <label className="d-flex align-items-center gap-3 p-3 border border-secondary rounded cursor-pointer bg-dark">
                <input 
                  type="radio" 
                  name="payment" 
                  checked={paymentMethod === 'CREDIT_CARD'}
                  onChange={() => setPaymentMethod('CREDIT_CARD')}
                />
                <CreditCard className="text-primary" />
                <span>Thẻ tín dụng / Thẻ ghi nợ</span>
              </label>
              <label className="d-flex align-items-center gap-3 p-3 border border-secondary rounded cursor-pointer bg-dark">
                <input 
                  type="radio" 
                  name="payment" 
                  checked={paymentMethod === 'MOMO'}
                  onChange={() => setPaymentMethod('MOMO')}
                />
                <img src="https://upload.wikimedia.org/wikipedia/vi/f/fe/MoMo_Logo.png" width={24} alt="Momo" />
                <span>Ví MoMo</span>
              </label>
              <label className="d-flex align-items-center gap-3 p-3 border border-secondary rounded cursor-pointer bg-dark">
                <input 
                  type="radio" 
                  name="payment" 
                  checked={paymentMethod === 'VNPAY'}
                  onChange={() => setPaymentMethod('VNPAY')}
                />
                <img src="https://vnpay.vn/s1/statics.vnpay.vn/2023/9/06ncktiwd6dc1694418189687.png" width={24} alt="VNPay" />
                <span>Cổng thanh toán VNPAY</span>
              </label>
            </div>
          </div>
        </div>

        {/* Cột phải: Tổng tiền & Voucher */}
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
              disabled={loading || cart.length === 0}
            >
              {loading ? (
                <span className="spinner-border spinner-border-sm me-2"></span>
              ) : (
                'Thanh toán'
              )}
            </button>
            <p className="text-muted text-center small mt-3">
              Bằng việc thanh toán, bạn đồng ý với Điều khoản và dịch vụ của chúng tôi.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;
