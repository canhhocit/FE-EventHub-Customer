import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Ticket, QrCode, Download, Loader2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { getMyBookings } from '../api/api';
import { API_BASE_URL } from '../utils/constants';

const MyTickets = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const { token } = useAuth();

  useEffect(() => {
    const fetchMyOrders = async () => {
      try {
        const data = await getMyBookings();
        if (data.code === 1000) {
          // Lấy .content từ Page response của Backend
          setOrders(data.result.content || []);
        }
      } catch (error) {
        console.error("Failed to fetch tickets:", error);
      } finally {
        setLoading(false);
      }
    };

    if (token) {
      fetchMyOrders();
    } else {
      setLoading(false);
    }
  }, [token]);

  const handleDownloadInvoice = async (orderId) => {
    try {
      const response = await fetch(`${API_BASE_URL}/bookings/${orderId}/invoice`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `Invoice_${orderId}.pdf`;
        document.body.appendChild(a);
        a.click();
        a.remove();
        window.URL.revokeObjectURL(url);
      } else {
        alert("Không thể tải hóa đơn. Vui lòng thử lại sau.");
      }
    } catch (error) {
      console.error("Download invoice failed:", error);
      alert("Lỗi kết nối máy chủ.");
    }
  };

  return (
    <div className="container py-4">
      <div className="d-flex justify-content-between align-items-center mb-5 animate-fade-up">
        <h2 className="fw-bold mb-0">Vé của tôi</h2>
      </div>

      <div className="row g-4">
        {loading ? (
          <div className="text-center py-5">
            <Loader2 className="spinner-border text-primary animate-spin mx-auto" />
          </div>
        ) : !token ? (
           <div className="text-center py-5 text-muted glass-card mx-auto" style={{ maxWidth: '600px' }}>
            <Ticket size={48} className="mb-3 opacity-50" />
            <h4>Vui lòng đăng nhập để xem vé.</h4>
            <Link to="/login" className="btn btn-gradient px-4 py-2 rounded-pill mt-3">Đăng nhập ngay</Link>
          </div>
        ) : orders.length === 0 ? (
          <div className="text-center py-5 text-muted glass-card mx-auto" style={{ maxWidth: '600px' }}>
            <Ticket size={48} className="mb-3 opacity-50" />
            <h4>Bạn chưa mua vé nào.</h4>
            <p>Hãy khám phá các sự kiện và đặt vé</p>
            <Link to="/" className="btn btn-gradient px-4 py-2 rounded-pill mt-3">Khám phá sự kiện</Link>
          </div>
        ) : (
          orders.map((order, idx) => (
            <div key={idx} className="col-12 animate-fade-up" style={{ animationDelay: `${0.1 * idx}s` }}>
              <div className="glass-card overflow-hidden">
                <div className="row g-0">
                  {/* Left: Thông tin Order */}
                  <div className="col-md-4 bg-dark bg-opacity-50 p-4 border-end border-secondary">
                    <span className="badge bg-success mb-3">{order.paymentStatus || order.status}</span>
                    <h5 className="fw-bold mb-1">Mã đơn: {order.id}</h5>
                    <p className="text-muted small mb-4">Ngày đặt: {new Date(order.orderDate).toLocaleString('vi-VN')}</p>
                    
                    <div className="d-flex justify-content-between text-muted small mb-4">
                      <span>Tổng tiền:</span>
                      <span className="text-gradient fw-bold fs-5">{order.totalAmount?.toLocaleString('vi-VN')}đ</span>
                    </div>

                    <button 
                      className="btn btn-outline-light btn-sm w-100 d-flex align-items-center justify-content-center gap-2"
                      onClick={() => handleDownloadInvoice(order.id)}
                    >
                      <Download size={16} /> Tải lại Hóa đơn PDF
                    </button>
                  </div>

                  {/* Right: Danh sách Ticket */}
                  <div className="col-md-8 p-4">
                    <h6 className="fw-bold text-muted mb-4 d-flex align-items-center gap-2">
                      <QrCode size={18} /> Danh sách vé điện tử
                    </h6>
                    <p className="small text-muted mb-3">Hóa đơn và mã vé đã được gửi vào Email của bạn</p>
                    <div className="alert alert-info bg-dark border-info text-info small">
                        Hệ thống đã xuất hóa đơn điện tử cho đơn hàng này. Vui lòng kiểm tra Email.
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default MyTickets;
