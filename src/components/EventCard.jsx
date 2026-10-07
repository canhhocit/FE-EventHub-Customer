import { Link } from 'react-router-dom';
import {
  getImageUrl,
  handleImageError,
  formatDate,
  formatCurrency,
  getEventStatus,
  getLowestPrice,
  getEventLocation,
} from '../utils/constants';

const EventCard = ({ event }) => {
  const status = getEventStatus(event.status);
  const lowestPrice = getLowestPrice(event);

  return (
    <article className="tile">
      <div className="tile-media">
        <img
          src={getImageUrl(event.imageUrls?.[0])}
          onError={handleImageError}
          alt=""
          loading="lazy"
        />
        <span className={`pill pill-on-media ${status.pill}`}>{status.label}</span>
      </div>

      <div className="tile-body">
        <h3 className="tile-title clamp-2">
          <Link
            to={`/events/${event.id}`}
            className="stretched-link text-decoration-none"
            style={{ color: 'inherit' }}
          >
            {event.name}
          </Link>
        </h3>

        <div className="tile-meta">
          <span>{formatDate(event.startTime)}</span>
        </div>
        <div className="tile-meta">
          <span>{getEventLocation(event)}</span>
        </div>

        <div className="tile-foot">
          {lowestPrice === null ? (
            <span className="price-from">Chưa mở bán vé</span>
          ) : lowestPrice === 0 ? (
            <span className="price">Miễn phí</span>
          ) : (
            <span>
              <span className="price-from">Từ </span>
              <span className="price">{formatCurrency(lowestPrice)}</span>
            </span>
          )}
          {event.category?.name && (
            <span className="price-from text-truncate" style={{ maxWidth: '50%' }}>
              {event.category.name}
            </span>
          )}
        </div>
      </div>
    </article>
  );
};

export default EventCard;
