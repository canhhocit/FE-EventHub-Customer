import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  Calendar,
  MapPin,
  Share2,
  Loader2,
  ChevronLeft,
  ChevronRight,
  Ticket,
  User,
  Check
} from 'lucide-react';
import { getBlogPostBySlug, getEventDetail } from '../utils/api';
import { getImageUrl, formatDate } from '../utils/constants';

const BlogDetail = () => {
  const { slug } = useParams();
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [eventsData, setEventsData] = useState([]);
  const [activeEventIndex, setActiveEventIndex] = useState(0);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const fetchPostData = async () => {
      setLoading(true);
      try {
        const data = await getBlogPostBySlug(slug);
        if (data && data.result) {
          const postData = data.result;
          setPost(postData);
          document.title = `${postData.title} | Event Ticket`;

          // Fetch linked events if exist
          if (postData.eventIds && postData.eventIds.length > 0) {
            fetchLinkedEvents(postData.eventIds);
          }
        }
      } catch (error) {
        console.error("Lỗi khi tải bài viết:", error);
      } finally {
        setLoading(false);
      }
    };

    const fetchLinkedEvents = async (eventIds) => {
      try {
        const promises = eventIds.map((id) => getEventDetail(id).catch(() => null));
        const results = await Promise.all(promises);
        const validEvents = results
          .filter((res) => res && res.result)
          .map((res) => res.result);
        setEventsData(validEvents);
      } catch (err) {
        console.error("Lỗi khi lấy sự kiện liên kết:", err);
      }
    };

    fetchPostData();
    window.scrollTo(0, 0);
  }, [slug]);

  // Tự động chuyển slide sự kiện liên quan nếu có nhiều hơn 1 sự kiện
  useEffect(() => {
    if (eventsData.length <= 1) return;
    const interval = setInterval(() => {
      setActiveEventIndex((prev) => (prev + 1) % eventsData.length);
    }, 6000);
    return () => clearInterval(interval);
  }, [eventsData]);

  const handleShare = async () => {
    const shareData = {
      title: post?.title || 'Bài viết sự kiện',
      text: post?.summary || '',
      url: window.location.href,
    };

    try {
      if (navigator.share) {
        await navigator.share(shareData);
      } else {
        await navigator.clipboard.writeText(window.location.href);
        setCopied(true);
        setTimeout(() => setCopied(false), 2500);
      }
    } catch (err) {
      console.error('Lỗi khi chia sẻ:', err);
    }
  };

  if (loading) {
    return (
      <div className="container py-5 text-center min-vh-50 d-flex flex-column align-items-center justify-content-center">
        <Loader2 className="animate-spin text-muted mb-3" size={48} />
        <p className="text-muted">Đang tải bài viết...</p>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="container py-5 text-center">
        <div className="panel p-5 mx-auto" style={{ maxWidth: '600px' }}>
          <h3 className="fw-bold mb-3" style={{ color: 'var(--text)' }}>Không tìm thấy bài viết</h3>
          <p className="text-muted mb-4">Bài viết có thể đã bị xóa hoặc đường dẫn không chính xác.</p>
          <Link to="/blog" className="btn btn-accent rounded-pill px-4">
            Quay lại danh sách Blog
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container py-4">
      {/* Breadcrumb */}
      <nav aria-label="breadcrumb" className="mb-4">
        <ol className="breadcrumb small text-muted">
          <li className="breadcrumb-item">
            <Link to="/" className="text-muted text-decoration-none hover-primary">Trang chủ</Link>
          </li>
          <li className="breadcrumb-item">
            <Link to="/blog" className="text-muted text-decoration-none hover-primary">Tin tức & Blog</Link>
          </li>
          <li className="breadcrumb-item active text-primary" aria-current="page">
            {post.title}
          </li>
        </ol>
      </nav>

      <div className="row justify-content-center">
        <div className="col-lg-9 col-xl-8">
          {/* Back button */}
          <Link to="/blog" className="text-muted text-decoration-none d-inline-flex align-items-center gap-1 mb-4 small fw-semibold hover-primary">
            <ChevronLeft size={16} /> Quay lại danh sách bài viết
          </Link>

          {/* Header */}
          <header className="mb-4">
            {post.tags && post.tags.length > 0 && (
              <div className="d-flex flex-wrap gap-2 mb-3">
                {post.tags.map((tag) => (
                  <span key={tag.id} className="badge bg-primary bg-opacity-10 text-primary border border-primary border-opacity-20 px-3 py-1.5 rounded-pill small fw-semibold">
                    #{tag.name}
                  </span>
                ))}
              </div>
            )}

            <h1 className="display-6 fw-bold mb-3 lh-sm" style={{ color: 'var(--text)' }}>
              {post.title}
            </h1>

            <div className="d-flex flex-wrap align-items-center justify-content-between gap-3 text-muted small border-bottom pb-3">
              <div className="d-flex align-items-center gap-4">
                <span className="d-flex align-items-center gap-2">
                  <Calendar size={16} className="text-muted" />
                  {formatDate(post.publishedAt || post.createdAt)}
                </span>
                <span className="d-flex align-items-center gap-2">
                  <User size={16} className="text-muted" />
                  {post.authorName || "Ban tổ chức"}
                </span>
              </div>

              <button
                type="button"
                className="btn btn-sm btn-subtle rounded-pill d-flex align-items-center gap-2 px-3"
                onClick={handleShare}
                title="Chia sẻ bài viết"
              >
                {copied ? <Check size={14} className="text-success" /> : <Share2 size={14} />}
                <span>{copied ? "Đã sao chép link" : "Chia sẻ"}</span>
              </button>
            </div>
          </header>

          {/* Thumbnail */}
          {post.thumbnail && (
            <div className="rounded-3 overflow-hidden mb-4 border shadow-xs" style={{ maxHeight: '440px' }}>
              <img
                src={getImageUrl(post.thumbnail)}
                alt={post.title}
                className="w-100 h-100 object-fit-cover"
              />
            </div>
          )}

          {/* Summary Lead */}
          {post.summary && (
            <div className="p-3 p-md-4 rounded-3 mb-4 panel border-start border-4 border-primary bg-light">
              <p className="fs-5 text-dark mb-0 fst-italic lh-base">
                "{post.summary}"
              </p>
            </div>
          )}

          {/* Article HTML Content */}
          <article className="blog-article-content mb-5" style={{ color: 'var(--text)' }}>
            <div
              className="article-html fs-5 lh-lg"
              dangerouslySetInnerHTML={{ __html: post.content || "<p>Nội dung đang được cập nhật...</p>" }}
            />
          </article>

          {/* Linked Events Promotion Box (Liên kết trực tiếp tới trang đặt vé) */}
          {eventsData.length > 0 && (
            <div className="my-5">
              <div className="panel p-4 overflow-hidden border position-relative shadow-sm">
                <div className="d-flex align-items-center justify-content-between mb-3">
                  <span className="badge bg-primary text-white rounded-pill px-3 py-1.5 small fw-semibold">
                    SỰ KIỆN LIÊN KẾT
                  </span>
                  {eventsData.length > 1 && (
                    <div className="d-flex gap-2">
                      <button
                        className="btn btn-sm btn-outline-secondary rounded-circle p-1"
                        onClick={() => setActiveEventIndex((prev) => (prev - 1 + eventsData.length) % eventsData.length)}
                      >
                        <ChevronLeft size={16} />
                      </button>
                      <button
                        className="btn btn-sm btn-outline-secondary rounded-circle p-1"
                        onClick={() => setActiveEventIndex((prev) => (prev + 1) % eventsData.length)}
                      >
                        <ChevronRight size={16} />
                      </button>
                    </div>
                  )}
                </div>

                <div className="row g-4 align-items-center">
                  <div className="col-md-5">
                    <div className="rounded-3 overflow-hidden border" style={{ height: '180px' }}>
                      <img
                        src={getImageUrl(eventsData[activeEventIndex].imageUrls?.[0])}
                        alt={eventsData[activeEventIndex].name}
                        className="w-100 h-100 object-fit-cover"
                      />
                    </div>
                  </div>
                  <div className="col-md-7">
                    <h4 className="fw-bold text-dark mb-2 text-truncate">
                      {eventsData[activeEventIndex].name}
                    </h4>
                    <div className="d-flex align-items-center gap-3 text-muted small mb-2">
                      <span className="d-flex align-items-center gap-1">
                        <Calendar size={14} className="text-muted" />
                        {new Date(eventsData[activeEventIndex].startTime).toLocaleDateString('vi-VN')}
                      </span>
                      <span className="d-flex align-items-center gap-1">
                        <MapPin size={14} className="text-muted" />
                        {eventsData[activeEventIndex].province || "Toàn quốc"}
                      </span>
                    </div>
                    <p className="text-muted small mb-3 text-truncate-2">
                      {eventsData[activeEventIndex].description?.replace(/<[^>]*>/g, '').substring(0, 120)}...
                    </p>

                    {/* SPA LINK: Chuyển thẳng sang trang đặt vé sự kiện nội bộ */}
                    <Link
                      to={`/events/${eventsData[activeEventIndex].id}`}
                      className="btn btn-accent rounded-pill px-4 py-2 fw-semibold d-inline-flex align-items-center gap-2"
                    >
                      <Ticket size={18} /> ĐẶT VÉ NGAY
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        .blog-article-content p {
          color: var(--text-dim);
          margin-bottom: 1.5rem;
        }
        .blog-article-content h2, 
        .blog-article-content h3, 
        .blog-article-content h4 {
          color: var(--text);
          font-weight: 700;
          margin-top: 2rem;
          margin-bottom: 1rem;
        }
        .blog-article-content ul, 
        .blog-article-content ol {
          color: var(--text-dim);
          margin-bottom: 1.5rem;
          padding-left: 1.5rem;
        }
        .blog-article-content li {
          margin-bottom: 0.5rem;
        }
        .blog-article-content strong {
          color: var(--text);
        }
        .hover-primary:hover {
          color: var(--accent) !important;
        }
      `}} />
    </div>
  );
};

export default BlogDetail;
