import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Search, MapPin, Calendar, Filter } from 'lucide-react';
import { VIETNAM_PROVINCES, getImageUrl } from '../utils/constants';

const Home = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // States cho bộ lọc
  const [search, setSearch] = useState('');
  const [province, setProvince] = useState('');
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');

  const fetchEvents = async () => {
    setLoading(true);
    try {
      // Build query string
      const params = new URLSearchParams();
      if (search) params.append('name', search);
      if (province) params.append('provinceCode', province);
      if (minPrice) params.append('minPrice', minPrice);
      if (maxPrice) params.append('maxPrice', maxPrice);

      const response = await fetch(`http://localhost:8080/events/search?${params.toString()}`);
      const data = await response.json();
      if (data.code === 1000) {
        setEvents(data.result.content || []);
      }
    } catch (error) {
      console.error('Error fetching events:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  const handleFilter = (e) => {
    e.preventDefault();
    fetchEvents();
  };

  return (
    <div className="container py-4">
      {/* Hero Section */}
      <div className="text-center mb-5 animate-fade-up">
        <h1 className="display-4 fw-bold mb-3">Khám phá <span className="text-gradient">Sự kiện</span></h1>
        <p className="text-muted fs-5">Tìm kiếm và đặt vé sự kiện</p>
      </div>

      {/* Filter Section */}
      <div className="glass-card p-4 mb-5 animate-fade-up" style={{ animationDelay: '0.1s' }}>
        <form onSubmit={handleFilter} className="row g-3 align-items-end">
          <div className="col-md-3">
            <label className="form-label text-muted small"><Search size={14} className="me-1"/> Từ khóa</label>
            <input 
              type="text" 
              className="form-control bg-dark text-white border-secondary" 
              placeholder="Tên sự kiện..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div className="col-md-3">
            <label className="form-label text-muted small"><MapPin size={14} className="me-1"/> Tỉnh/Thành phố</label>
            <select 
              className="form-select bg-dark text-white border-secondary"
              value={province}
              onChange={(e) => setProvince(e.target.value)}
            >
              <option value="">Tất cả tỉnh/thành</option>
              {VIETNAM_PROVINCES.map((p) => (
                <option key={p} value={p}>{p}</option>
              ))}
            </select>
          </div>
          <div className="col-md-2">
            <label className="form-label text-muted small">Giá từ (VNĐ)</label>
            <input 
              type="number" 
              className="form-control bg-dark text-white border-secondary" 
              placeholder="0"
              value={minPrice}
              onChange={(e) => setMinPrice(e.target.value)}
            />
          </div>
          <div className="col-md-2">
            <label className="form-label text-muted small">Đến giá (VNĐ)</label>
            <input 
              type="number" 
              className="form-control bg-dark text-white border-secondary" 
              placeholder="Max"
              value={maxPrice}
              onChange={(e) => setMaxPrice(e.target.value)}
            />
          </div>
          <div className="col-md-2">
            <button type="submit" className="btn btn-gradient w-100">
              <Filter size={18} className="me-2" /> Lọc
            </button>
          </div>
        </form>
      </div>

      {/* Events Grid */}
      <div className="row g-4">
        {loading ? (
          <div className="text-center py-5">
            <div className="spinner-border text-primary" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
          </div>
        ) : events.length === 0 ? (
          <div className="text-center py-5 text-muted">
            <h4>Không tìm thấy sự kiện nào phù hợp.</h4>
          </div>
        ) : (
          events.map((event, index) => (
            <div key={event.id} className="col-12 col-md-6 col-lg-4 animate-fade-up" style={{ animationDelay: `${0.1 * (index + 2)}s` }}>
              <div className="card glass-card h-100 border-0 overflow-hidden">
                <img 
                  src={getImageUrl(event.imageUrls?.[0])} 
                  className="card-img-top" 
                  alt={event.name}
                  style={{ height: '200px', objectFit: 'cover' }}
                />
                <div className="card-body d-flex flex-column">
                  <span className={`badge align-self-start mb-2 ${
                    event.status === 'OPENING' ? 'bg-success' : 
                    event.status === 'UPCOMING' ? 'bg-info' : 
                    event.status === 'CLOSED' ? 'bg-secondary' : 'bg-warning'
                  }`}>
                    {event.status === 'OPENING' ? 'Đang mở bán' : 
                     event.status === 'UPCOMING' ? 'Sắp mở bán' : 
                     event.status === 'CLOSED' ? 'Hết hạn bán vé' : event.status}
                  </span>
                  <h5 className="card-title fw-bold text-info">{event.name}</h5>
                  <p className="card-text text-muted small mb-3 flex-grow-1">
                    <Calendar size={14} className="me-2" />
                    {new Date(event.startTime).toLocaleDateString('vi-VN')}
                    <br/>
                    <MapPin size={14} className="me-2" />
                    {event.address} {event.provinceName ? `, ${event.provinceName}` : ''}
                  </p>
                  <Link to={`/events/${event.id}`} className="btn btn-outline-light w-100 rounded-pill mt-auto">
                    Xem chi tiết
                  </Link>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default Home;
