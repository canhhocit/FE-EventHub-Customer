import { Link } from 'react-router-dom';
import { Calendar, User } from 'lucide-react';
import { getImageUrl, handleImageError, formatDate } from '../utils/constants';

/**
 * Renders the card only. The parent decides the grid column, so the same card
 * works in any layout.
 */
const BlogCard = ({ blog }) => {
  if (!blog) return null;

  const firstTag = [...(blog.tags || [])][0];

  return (
    <article className="tile">
      <div className="tile-media">
        <img
          src={getImageUrl(blog.thumbnail)}
          onError={handleImageError}
          alt=""
          loading="lazy"
        />
        {firstTag?.name && (
          <span className="pill pill-on-media pill-soon">{firstTag.name}</span>
        )}
      </div>

      <div className="tile-body">
        <div className="tile-meta" style={{ gap: 14 }}>
          <span className="d-inline-flex align-items-center gap-1">
            <Calendar size={13} />
            {formatDate(blog.publishedAt || blog.createdAt)}
          </span>
          <span className="d-inline-flex align-items-center gap-1 text-truncate">
            <User size={13} />
            {blog.authorName || 'Ban tổ chức'}
          </span>
        </div>

        <h3 className="tile-title clamp-2">
          <Link
            to={`/blog/${blog.slug || blog.id}`}
            className="stretched-link text-decoration-none"
            style={{ color: 'inherit' }}
          >
            {blog.title}
          </Link>
        </h3>

        {blog.summary && (
          <p className="text-muted small clamp-2 mb-0">{blog.summary}</p>
        )}
      </div>
    </article>
  );
};

export default BlogCard;
