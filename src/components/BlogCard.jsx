import React from 'react';
import { Link } from 'react-router-dom';
import { Calendar, User, ChevronRight } from 'lucide-react';
import { getImageUrl } from '../utils/constants';

const BlogCard = ({ blog }) => {
  if (!blog) return null;

  const defaultThumbnail = "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?q=80&w=800&auto=format&fit=crop";
  const thumbnailSrc = blog.thumbnail ? getImageUrl(blog.thumbnail) : defaultThumbnail;
  const targetLink = `/blog/${blog.slug || blog.id}`;

  return (
    <div className="col-md-6 col-lg-4 d-flex">
      <Link to={targetLink} className="text-decoration-none w-100 d-flex flex-column">
        <div className="glass-card flex-grow-1 overflow-hidden d-flex flex-column border border-secondary border-opacity-25 transition-all">
          {/* Thumbnail Container */}
          <div className="position-relative overflow-hidden" style={{ height: '220px' }}>
            <img
              src={thumbnailSrc}
              className="w-100 h-100 object-fit-cover blog-card-img"
              alt={blog.title}
            />
            {blog.tags && blog.tags.length > 0 && (
              <div className="position-absolute top-0 start-0 m-3">
                <span className="badge btn-gradient rounded-pill px-3 py-2 shadow-sm small">
                  {blog.tags[0].name}
                </span>
              </div>
            )}
          </div>

          {/* Body Content */}
          <div className="p-4 d-flex flex-column flex-grow-1">
            <div className="d-flex align-items-center gap-3 text-muted small mb-2">
              <span className="d-flex align-items-center gap-1">
                <Calendar size={14} className="text-primary" />
                {blog.publishedAt
                  ? new Date(blog.publishedAt).toLocaleDateString('vi-VN')
                  : "Mới đăng"}
              </span>
              <span className="d-flex align-items-center gap-1">
                <User size={14} className="text-primary" />
                {blog.authorName || "Ban tổ chức"}
              </span>
            </div>

            <h5 className="fw-bold text-white mb-2 lh-base text-truncate-2">
              {blog.title}
            </h5>

            <p className="text-muted small text-truncate-3 mb-4 flex-grow-1">
              {blog.summary || "Đọc bài viết chi tiết để cập nhật thông tin sự kiện mới nhất..."}
            </p>

            <div className="mt-auto pt-2 border-top border-secondary border-opacity-25 d-flex align-items-center justify-content-between text-primary fw-semibold small">
              <span>Đọc tiếp</span>
              <ChevronRight size={16} className="arrow-icon" />
            </div>
          </div>
        </div>
      </Link>

      <style dangerouslySetInnerHTML={{ __html: `
        .text-truncate-2 {
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
        .text-truncate-3 {
          display: -webkit-box;
          -webkit-line-clamp: 3;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
        .blog-card-img {
          transition: transform 0.5s ease;
        }
        .glass-card:hover .blog-card-img {
          transform: scale(1.06);
        }
        .glass-card:hover .arrow-icon {
          transform: translateX(4px);
          transition: transform 0.2s ease;
        }
      `}} />
    </div>
  );
};

export default BlogCard;
