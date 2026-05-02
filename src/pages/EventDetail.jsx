import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Calendar, MapPin, Ticket, Info, ShoppingCart, PlusCircle } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { getEventDetail } from '../api/api';
import { getImageUrl } from '../utils/constants';

const EventDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedTickets, setSelectedTickets] = useState({});

  useEffect(() => {
    const fetchEvent = async () => {
      try {
        const data = await getEventDetail(id);
        if (data.code === 1000) {
          setEvent(data.result);
        }
      } catch (error) {
        console.error('Error fetching event details:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchEvent();
  }, [id]);

  const handleTicketChange = (ticketTypeId, quantity) => {
    setSelectedTickets(prev => ({
      ...prev,
      [ticketTypeId]: quantity
    }));
  };

  const getItemsToBuy = () => {
    return Object.entries(selectedTickets)
      .filter(([_, qty]) => qty > 0)
      .map(([typeId, qty]) => {
        const tt = event.ticketTypes.find(t => t.id == typeId);
        return { typeId, typeName: tt.name, price: tt.price, qty };
      });
  };

  const handleAddToCart = async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      alert("Vui lòng đăng nhập để thực hiện chức năng này!");
      navigate('/login');
      return;
    }

    const itemsToBuy = getItemsToBuy();
    if (itemsToBuy.length === 0) {
      alert("Vui lòng chọn ít nhất 1 vé!");
      return;
    }
    await addToCart(event, itemsToBuy);
    alert("Đã thêm vào giỏ hàng thành công!");
    setSelectedTickets({}); // Reset form
  };

  const handleBuyNow = async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      alert("Vui lòng đăng nhập để thực hiện chức năng này!");
      navigate('/login');
      return;
    }

    const itemsToBuy = getItemsToBuy();
    if (itemsToBuy.length === 0) {
      alert("Vui lòng chọn ít nhất 1 vé!");
      return;
    }
    await addToCart(event, itemsToBuy);
    navigate('/checkout');
  };

  if (loading) {
    return (
      <div className="container py-5 text-center">
        <div className="spinner-border text-primary" role="status"></div>
      </div>
    );
  }

  if (!event) {
    return <div className="container py-5 text-center"><h3>Không tìm thấy sự kiện.</h3></div>;
  }

  return (
    <div className="container py-4">
      <div className="row g-4">
        {/* Cột trái: Ảnh và Mô tả */}
        <div className="col-lg-8 animate-fade-up">
          <div className="glass-card overflow-hidden mb-4">
            <img 
              src={getImageUrl(event.imageUrls?.[0])} 
              className="w-100" 
              alt={event.name}
              style={{ maxHeight: '400px', objectFit: 'cover' }}
            />
            <div className="p-4">
              <span className="badge bg-primary mb-2">{event.category?.name || 'Sự kiện'}</span>
              <h2 className="fw-bold mb-3">{event.name}</h2>
              <div className="d-flex flex-wrap gap-4 text-muted mb-4">
                <div className="d-flex align-items-center gap-2">
                  <Calendar size={18} className="text-primary"/>
                  <span>{new Date(event.startTime).toLocaleString('vi-VN')}</span>
                </div>
                <div className="d-flex align-items-center gap-2">
                  <MapPin size={18} className="text-primary"/>
                  <span>{event.address} {event.provinceName ? `, ${event.provinceName}` : ''}</span>
                </div>
              </div>
              
              <h5 className="fw-bold d-flex align-items-center gap-2 mb-3">
                <Info size={20} className="text-primary"/> Giới thiệu
              </h5>
              <div className="text-muted" dangerouslySetInnerHTML={{ __html: event.description || 'Chưa có mô tả chi tiết.' }}></div>
            </div>
          </div>
        </div>

        {/* Cột phải: Chọn vé */}
        <div className="col-lg-4 animate-fade-up" style={{ animationDelay: '0.1s' }}>
          <div className="glass-card p-4 sticky-top" style={{ top: '100px' }}>
            <h4 className="fw-bold d-flex align-items-center gap-2 mb-4">
              <Ticket size={24} className="text-primary"/> Thông tin Vé
            </h4>

            {(() => {
              const now = new Date();
              const saleStart = event.saleStartDate ? new Date(event.saleStartDate) : null;
              const saleEnd = event.saleEndDate ? new Date(event.saleEndDate) : null;
              
              let isSaleStarted = !saleStart || now >= saleStart;
              let isSaleEnded = saleEnd && now > saleEnd;
              let canBuy = isSaleStarted && !isSaleEnded && event.ticketTypes?.length > 0;

              return (
                <>
                  {event.ticketTypes && event.ticketTypes.length > 0 ? (
                    <div className="d-flex flex-column gap-3 mb-4">
                      {event.ticketTypes.map(tt => (
                        <div key={tt.id} className="p-3 border border-secondary rounded bg-dark">
                          <div className="d-flex justify-content-between align-items-start mb-2">
                            <div>
                              <h6 className="fw-bold mb-1">{tt.name}</h6>
                              <small className="text-muted">{tt.description || 'Vé tiêu chuẩn'}</small>
                            </div>
                            <span className="text-primary fw-bold fs-5">
                              {tt.price.toLocaleString('vi-VN')}đ
                            </span>
                          </div>
                          <div className="d-flex justify-content-between align-items-center mt-3">
                            <span className="small text-muted">Còn lại: {tt.remainingQuantity}</span>
                            <div className="d-flex align-items-center gap-2">
                              <button 
                                className="btn btn-sm btn-outline-secondary rounded-circle"
                                onClick={() => handleTicketChange(tt.id, Math.max(0, (selectedTickets[tt.id] || 0) - 1))}
                                disabled={!canBuy}
                              >-</button>
                              <span className="px-2">{selectedTickets[tt.id] || 0}</span>
                              <button 
                                className="btn btn-sm btn-outline-secondary rounded-circle"
                                onClick={() => handleTicketChange(tt.id, Math.min(tt.remainingQuantity, (selectedTickets[tt.id] || 0) + 1))}
                                disabled={!canBuy}
                              >+</button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-muted">Sự kiện chưa có thông tin vé.</p>
                  )}

                  {!isSaleStarted && (
                    <div className="alert alert-info py-2 mb-3">
                      <small>Sắp mở bán: {saleStart.toLocaleString('vi-VN')}</small>
                    </div>
                  )}
                  {isSaleEnded && (
                    <div className="alert alert-danger py-2 mb-3">
                      <small>Đã kết thúc thời gian bán vé</small>
                    </div>
                  )}

                  <div className="d-flex flex-column gap-2 mt-2">
                    <button 
                      className="btn btn-outline-light py-2 rounded-pill shadow-sm"
                      onClick={handleAddToCart}
                      disabled={!canBuy}
                    >
                      <PlusCircle size={20} className="me-2" />
                      Thêm vào giỏ
                    </button>
                    
                    <button 
                      className="btn btn-gradient py-3 rounded-pill fs-5 shadow-lg"
                      onClick={handleBuyNow}
                      disabled={!canBuy}
                    >
                      <ShoppingCart size={20} className="me-2" />
                      {isSaleEnded ? 'Đã kết thúc' : !isSaleStarted ? 'Chưa mở bán' : 'Mua ngay'}
                    </button>
                  </div>
                </>
              );
            })()}
          </div>
        </div>
      </div>
    </div>
  );
};

export default EventDetail;
