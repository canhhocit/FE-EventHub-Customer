import { useState, useEffect } from 'react';
import { Ticket, Download, Loader2 } from 'lucide-react';
import { getMyBookings } from '../api/api';
import { API_BASE_URL } from '../utils/constants';

const MyTickets = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState(null);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const data = await getMyBookings();
        if (data.code === 1000) {
          setOrders(data.result || []);
        }
      } catch (error) {
        console.error('Error fetching orders:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, []);

  const handleDownloadInvoice = async (orderId) => {
    setDownloading(orderId);
    try {
      const token = localStorage.getItem('token');
      // Special case for binary file download, still using fetch but with central URL
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
      } else {
        alert('Không thể tải hóa đơn. Vui lòng thử lại sau.');
      }
    } catch (error) {
      console.error('Error downloading invoice:', error);
    } finally {
      setDownloading(null);
    }
  };

  if (loading) {
    return (
      <div className="container py-5 text-center">
        <Loader2 className="animate-spin text-primary mx-auto" size={40} />
      </div>
    );
  }

  return (
    <div className="container py-5">
      <h2 className="fw-bold mb-5 d-flex align-items-center gap-3">
        <Ticket size={32} className="text-primary" /> Vé của tôi
      </h2>

      {orders.length === 0 ? (
        <div className="text-center py-5 glass-card">
          <p className="text-muted">Bạn chưa có đơn hàng nào.</p>
        </div>
      ) : (
        <div className="row g-4">
          {orders.map((order) => (
            <div key={order.id} className="col-12 animate-fade-up">
              <div className="glass-card p-4">
                <div className="row align-items-center">
                  <div className="col-md-6">
                    <div className="d-flex align-items-center gap-2 mb-2">
                      <span className="badge bg-primary">#{order.id}</span>
                      <span className={`badge ${
                        order.status === 'PAID' ? 'bg-success' : 
                        order.status === 'PENDING' ? 'bg-warning' : 'bg-danger'
                      }`}>
                        {order.status}
                      </span>
                    </div>
                    <h5 className="fw-bold mb-1">Hóa đơn ngày {new Date(order.orderDate).toLocaleDateString('vi-VN')}</h5>
                    <p className="text-muted small mb-0">Tổng tiền: {order.totalAmount.toLocaleString('vi-VN')}đ</p>
                  </div>
                  <div className="col-md-6 text-md-end mt-3 mt-md-0">
                    <button 
                      className="btn btn-outline-primary rounded-pill px-4 d-flex align-items-center gap-2 ms-md-auto"
                      onClick={() => handleDownloadInvoice(order.id)}
                      disabled={downloading === order.id}
                    >
                      {downloading === order.id ? <Loader2 size={18} className="animate-spin" /> : <Download size={18} />}
                      Tải hóa đơn PDF
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MyTickets;
