import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { CreditCard, Tag, CheckCircle, Loader2 } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { validateVoucher, checkoutSelected } from '../api/api';

const Checkout = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { cart, fetchBackendCart } = useCart();
  
  const [paymentMethod, setPaymentMethod] = useState('PAYOS');
  const [voucherCode, setVoucherCode] = useState('');
  const [voucherInfo, setVoucherInfo] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Calculate totals
  const subtotal = cart?.items?.reduce((sum, item) => sum + (item.price * item.quantity), 0) || 0;
  const discount = voucherInfo ? (voucherInfo.discountType === 'PERCENTAGE' ? (subtotal * voucherInfo.discountValue / 100) : voucherInfo.discountValue) : 0;
  const total = subtotal - discount;

  const handleApplyVoucher = async () => {
    if (!voucherCode) return;
    setLoading(true);
    setError('');
    try {
      const eventAmounts = {};
      cart.items.forEach(item => {
        eventAmounts[item.eventId] = (eventAmounts[item.eventId] || 0) + (item.price * item.quantity);
      });

      const data = await validateVoucher({ code: voucherCode, eventAmounts });
      if (data.code === 1000) {
        setVoucherInfo(data.result);
      } else {
        setError(data.message || 'Voucher không hợp lệ');
        setVoucherInfo(null);
      }
    } catch (err) {
      setError(err.message || 'Lỗi áp dụng voucher');
    } finally {
      setLoading(false);
    }
  };

  const handleCheckout = async () => {
    setLoading(true);
    setError('');
    try {
      const itemIds = cart.items.map(item => item.cartItemId);
      const data = await checkoutSelected(itemIds, paymentMethod, voucherCode);
      if (data.code === 1000) {
        if (data.result.paymentUrl) {
          window.location.href = data.result.paymentUrl;
        } else {
          navigate('/my-tickets');
        }
      } else {
        setError(data.message || 'Thanh toán thất bại');
      }
    } catch (err) {
      setError(err.message || 'Lỗi kết nối server');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container py-5">
      <div className="row g-4">
        <div className="col-lg-8">
          <div className="glass-card p-4 mb-4">
            <h4 className="fw-bold mb-4">Thông tin thanh toán</h4>
            {error && <div className="alert alert-danger">{error}</div>}
            
            <div className="mb-4">
              <label className="form-label text-muted small">Phương thức thanh toán</label>
              <div className="d-flex gap-3">
                <div 
                  className={`p-3 border rounded cursor-pointer flex-grow-1 d-flex align-items-center gap-3 ${paymentMethod === 'PAYOS' ? 'border-primary bg-primary bg-opacity-10' : 'border-secondary'}`}
                  onClick={() => setPaymentMethod('PAYOS')}
                >
                  <CreditCard className="text-primary" />
                  <div>
                    <div className="fw-bold">Chuyển khoản (PayOS)</div>
                    <small className="text-muted text-xs">An toàn & Nhanh chóng</small>
                  </div>
                </div>
              </div>
            </div>

            <div className="mb-4">
              <label className="form-label text-muted small">Mã giảm giá</label>
              <div className="input-group">
                <span className="input-group-text bg-dark border-secondary"><Tag size={18} className="text-primary"/></span>
                <input 
                  type="text" 
                  className="form-control bg-dark text-white border-secondary" 
                  placeholder="Nhập mã ưu đãi..."
                  value={voucherCode}
                  onChange={(e) => setVoucherCode(e.target.value)}
                />
                <button 
                  className="btn btn-outline-primary px-4" 
                  onClick={handleApplyVoucher}
                  disabled={loading || !voucherCode}
                >
                  Áp dụng
                </button>
              </div>
              {voucherInfo && <div className="text-success small mt-2">✓ Đã áp dụng: Giảm {voucherInfo.discountValue.toLocaleString()}đ</div>}
            </div>
          </div>
        </div>

        <div className="col-lg-4">
          <div className="glass-card p-4 sticky-top" style={{ top: '100px' }}>
            <h5 className="fw-bold mb-4">Tóm tắt đơn hàng</h5>
            <div className="d-flex justify-content-between mb-2">
              <span className="text-muted">Tạm tính:</span>
              <span>{subtotal.toLocaleString()}đ</span>
            </div>
            <div className="d-flex justify-content-between mb-2">
              <span className="text-muted">Giảm giá:</span>
              <span className="text-danger">-{discount.toLocaleString()}đ</span>
            </div>
            <hr className="border-secondary"/>
            <div className="d-flex justify-content-between mb-4">
              <span className="fw-bold">Tổng cộng:</span>
              <span className="fw-bold text-primary fs-4">{total.toLocaleString()}đ</span>
            </div>
            
            <button 
              className="btn btn-gradient w-100 py-3 rounded-pill fw-bold fs-5"
              onClick={handleCheckout}
              disabled={loading || !cart?.items?.length}
            >
              {loading ? <Loader2 className="animate-spin mx-auto" /> : <><CheckCircle className="me-2" /> Thanh toán</>}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;
