import { Link, useNavigate } from 'react-router-dom';
import { ShoppingCart, Trash2, ArrowRight } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { getImageUrl } from '../utils/constants';

const Cart = () => {
  const { cart, removeFromCart, getCartTotal, clearCart } = useCart();
  const navigate = useNavigate();

  const handleCheckout = () => {
    navigate('/checkout');
  };

  return (
    <div className="container py-4">
      <div className="d-flex justify-content-between align-items-center mb-4 animate-fade-up">
        <h2 className="fw-bold mb-0 d-flex align-items-center gap-2">
          <ShoppingCart size={28} className="text-primary" /> Giỏ hàng của bạn
        </h2>
        {cart.length > 0 && (
          <button className="btn btn-outline-danger btn-sm rounded-pill px-3" onClick={clearCart}>
            Xóa tất cả
          </button>
        )}
      </div>

      <div className="row g-4">
        {cart.length === 0 ? (
          <div className="col-12 text-center py-5 animate-fade-up">
            <div className="glass-card p-5 mx-auto" style={{ maxWidth: '600px' }}>
              <ShoppingCart size={48} className="mb-3 text-muted" />
              <h4 className="fw-bold">Giỏ hàng trống</h4>
              <p className="text-muted">Bạn chưa chọn vé sự kiện nào. Hãy quay lại trang chủ để khám phá</p>
              <Link to="/" className="btn btn-gradient rounded-pill px-4 mt-2">
                Khám phá Sự kiện
              </Link>
            </div>
          </div>
        ) : (
          <>
            <div className="col-lg-8 animate-fade-up">
              <div className="glass-card p-4">
                <div className="table-responsive">
                  <table className="table table-dark table-borderless table-hover align-middle mb-0">
                    <thead>
                      <tr className="border-bottom border-secondary">
                        <th scope="col">Sự kiện / Loại vé</th>
                        <th scope="col" className="text-center">Đơn giá</th>
                        <th scope="col" className="text-center">Số lượng</th>
                        <th scope="col" className="text-end">Tạm tính</th>
                        <th scope="col"></th>
                      </tr>
                    </thead>
                    <tbody>
                      {cart.map((item, idx) => (
                        <tr key={idx} className="border-bottom border-secondary">
                          <td>
                            <div className="d-flex align-items-center gap-3 py-2">
                              {item.eventImage && (
                                <img src={getImageUrl(item.eventImage)} alt="Event" className="rounded" style={{ width: '60px', height: '60px', objectFit: 'cover' }} />
                              )}
                              <div>
                                <h6 className="mb-1 fw-bold text-truncate" style={{ maxWidth: '200px' }}>{item.eventName}</h6>
                                <span className="badge bg-secondary">{item.ticketTypeName}</span>
                              </div>
                            </div>
                          </td>
                          <td className="text-center">{item.price.toLocaleString('vi-VN')}đ</td>
                          <td className="text-center">
                            <span className="fw-bold">{item.quantity}</span>
                          </td>
                          <td className="text-end fw-bold text-primary">
                            {(item.price * item.quantity).toLocaleString('vi-VN')}đ
                          </td>
                          <td className="text-end">
                            <button 
                              className="btn btn-sm btn-outline-danger border-0"
                              onClick={() => removeFromCart(item.ticketTypeId)}
                            >
                              <Trash2 size={18} />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            {/* Khung Tóm tắt Đơn hàng */}
            <div className="col-lg-4 animate-fade-up" style={{ animationDelay: '0.1s' }}>
              <div className="glass-card p-4 sticky-top" style={{ top: '100px' }}>
                <h5 className="fw-bold mb-4">Tóm tắt đơn hàng</h5>
                
                <div className="d-flex justify-content-between mb-3 text-muted">
                  <span>Tổng số vé:</span>
                  <span className="fw-bold">{cart.reduce((total, i) => total + i.quantity, 0)}</span>
                </div>
                
                <hr className="border-secondary" />
                
                <div className="d-flex justify-content-between mb-4">
                  <span className="fw-bold fs-5">Tổng tiền:</span>
                  <span className="fw-bold fs-4 text-gradient">{getCartTotal().toLocaleString('vi-VN')}đ</span>
                </div>

                <button 
                  className="btn btn-gradient w-100 py-3 rounded-pill fs-5 shadow-lg d-flex align-items-center justify-content-center gap-2"
                  onClick={handleCheckout}
                >
                  Thanh toán ngay <ArrowRight size={20} />
                </button>
                <Link to="/" className="btn btn-outline-light w-100 py-2 rounded-pill mt-3">
                  Tiếp tục chọn vé
                </Link>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default Cart;
