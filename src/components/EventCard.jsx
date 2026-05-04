import { Link } from 'react-router-dom';
import { Calendar, MapPin } from 'lucide-react';
import { getImageUrl } from '../utils/constants';

const EventCard = ({ event, index }) => {
  return (
    <div className="col animate-fade-up" style={{ animationDelay: `${0.05 * index}s` }}>
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
  );
};

export default EventCard;
