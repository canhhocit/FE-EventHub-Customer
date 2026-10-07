import { useState, useEffect, useMemo } from 'react';
import {
  Loader2,
  Newspaper,
  AlertCircle,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { getBlogPosts, getBlogTags } from '../utils/api';
import BlogCard from '../components/BlogCard';

const PAGE_SIZE = 9;
/** The tag filter is applied client-side, so pull a wider slice when one is on. */
const TAG_FETCH_SIZE = 60;

const BlogList = () => {
  const [blogs, setBlogs] = useState([]);
  const [tags, setTags] = useState([]);
  const [selectedTag, setSelectedTag] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    getBlogTags()
      .then((res) => setTags(res?.result || []))
      .catch(() => setTags([]));
  }, []);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError('');

    const params = selectedTag
      ? { page: 0, size: TAG_FETCH_SIZE }
      : { page, size: PAGE_SIZE };

    getBlogPosts(params)
      .then((res) => {
        if (cancelled) return;
        setBlogs(res?.result?.content || []);
        setTotalPages(Math.max(res?.result?.totalPages || 1, 1));
      })
      .catch((err) => {
        if (cancelled) return;
        setBlogs([]);
        setError(err.message);
      })
      .finally(() => !cancelled && setLoading(false));

    return () => {
      cancelled = true;
    };
  }, [page, selectedTag]);

  const visibleBlogs = useMemo(() => {
    if (!selectedTag) return blogs;
    return blogs.filter((blog) =>
      [...(blog.tags || [])].some((tag) => tag.id === selectedTag),
    );
  }, [blogs, selectedTag]);

  const selectTag = (tagId) => {
    setSelectedTag(tagId);
    setPage(0);
  };

  const goToPage = (next) => {
    setPage(next);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="container py-4">
      <div className="text-center mb-4">
        <h1 className="fw-bold mb-2" style={{ fontSize: 'clamp(1.6rem, 3.6vw, 2.25rem)' }}>
          Tin tức &amp; bài viết
        </h1>
        <p className="text-muted mb-0 mx-auto" style={{ maxWidth: 560 }}>
          Thông tin mới nhất về sự kiện, hậu trường và cẩm nang tham gia từ ban tổ chức.
        </p>
      </div>

      {tags.length > 0 && (
        <div className="d-flex flex-wrap justify-content-center gap-2 mb-4">
          <button
            type="button"
            className={`btn btn-sm px-3 py-2 ${selectedTag === null ? 'btn-accent' : 'btn-ghost'}`}
            onClick={() => selectTag(null)}
          >
            Tất cả
          </button>
          {tags.map((tag) => (
            <button
              key={tag.id}
              type="button"
              className={`btn btn-sm px-3 py-2 ${
                selectedTag === tag.id ? 'btn-accent' : 'btn-ghost'
              }`}
              onClick={() => selectTag(tag.id)}
            >
              {tag.name}
            </button>
          ))}
        </div>
      )}

      {loading ? (
        <div className="text-center py-5 text-muted">
          <Loader2 size={28} className="spin mb-3" />
          <p className="small mb-0">Đang tải bài viết…</p>
        </div>
      ) : error ? (
        <div className="panel p-5 text-center mx-auto" style={{ maxWidth: 480 }}>
          <AlertCircle size={32} className="mb-3" style={{ color: 'var(--danger)' }} />
          <h2 className="h6 fw-bold mb-2">Không tải được bài viết</h2>
          <p className="text-muted small mb-0">{error}</p>
        </div>
      ) : visibleBlogs.length === 0 ? (
        <div className="panel p-5 text-center mx-auto" style={{ maxWidth: 480 }}>
          <Newspaper size={32} className="text-muted mb-3" />
          <h2 className="h6 fw-bold mb-2">Chưa có bài viết nào</h2>
          <p className="text-muted small mb-0">
            {selectedTag ? 'Không có bài viết trong chủ đề này.' : 'Hãy quay lại sau.'}
          </p>
        </div>
      ) : (
        <>
          <div className="row g-3 row-cols-1 row-cols-sm-2 row-cols-lg-3">
            {visibleBlogs.map((blog) => (
              <div className="col" key={blog.id}>
                <BlogCard blog={blog} />
              </div>
            ))}
          </div>

          {!selectedTag && totalPages > 1 && (
            <nav className="d-flex justify-content-center align-items-center gap-2 mt-4">
              <button
                className="btn btn-ghost btn-sm px-3 py-2 d-inline-flex align-items-center gap-1"
                disabled={page === 0}
                onClick={() => goToPage(page - 1)}
              >
                <ChevronLeft size={15} /> Trước
              </button>
              <span className="small text-muted px-2">
                Trang <strong style={{ color: 'var(--text)' }}>{page + 1}</strong> /{' '}
                {totalPages}
              </span>
              <button
                className="btn btn-ghost btn-sm px-3 py-2 d-inline-flex align-items-center gap-1"
                disabled={page >= totalPages - 1}
                onClick={() => goToPage(page + 1)}
              >
                Sau <ChevronRight size={15} />
              </button>
            </nav>
          )}
        </>
      )}
    </div>
  );
};

export default BlogList;
