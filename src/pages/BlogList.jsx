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

const DEFAULT_PAGE_SIZE = 20;
const PAGE_SIZE_OPTIONS = [10, 20, 40];
/** The tag filter is applied client-side, so pull a wider slice when one is on. */
const TAG_FETCH_SIZE = 60;

const BlogList = () => {
  const [blogs, setBlogs] = useState([]);
  const [tags, setTags] = useState([]);
  const [selectedTag, setSelectedTag] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE);
  const [totalPages, setTotalPages] = useState(1);
  const [totalElements, setTotalElements] = useState(0);

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
      : { page, size: pageSize };

    getBlogPosts(params)
      .then((res) => {
        if (cancelled) return;
        setBlogs(res?.result?.content || []);
        setTotalPages(Math.max(res?.result?.totalPages || 1, 1));
        setTotalElements(res?.result?.totalElements ?? (res?.result?.content || []).length);
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
  }, [page, pageSize, selectedTag]);

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

  const renderPaginationButtons = () => {
    const currentDisplayPage = page + 1;
    const pages = [];
    const maxVisible = 5;
    let start = Math.max(1, currentDisplayPage - Math.floor(maxVisible / 2));
    const end = Math.min(totalPages, start + maxVisible - 1);

    if (end - start + 1 < maxVisible) {
      start = Math.max(1, end - maxVisible + 1);
    }

    for (let i = start; i <= end; i++) {
      pages.push(i);
    }

    return (
      <div className="pagination-clean m-0">
        <button
          type="button"
          className="page-btn"
          disabled={page <= 0}
          onClick={() => goToPage(page - 1)}
          aria-label="Trang trước"
        >
          <ChevronLeft size={16} />
          <span className="d-none d-sm-inline ms-1">Trước</span>
        </button>

        {start > 1 && (
          <>
            <button
              type="button"
              className={`page-btn ${currentDisplayPage === 1 ? 'is-active' : ''}`}
              onClick={() => goToPage(0)}
            >
              1
            </button>
            {start > 2 && <span className="text-muted px-1">…</span>}
          </>
        )}

        {pages.map((p) => (
          <button
            key={p}
            type="button"
            className={`page-btn ${p === currentDisplayPage ? 'is-active' : ''}`}
            onClick={() => goToPage(p - 1)}
          >
            {p}
          </button>
        ))}

        {end < totalPages && (
          <>
            {end < totalPages - 1 && <span className="text-muted px-1">…</span>}
            <button
              type="button"
              className={`page-btn ${currentDisplayPage === totalPages ? 'is-active' : ''}`}
              onClick={() => goToPage(totalPages - 1)}
            >
              {totalPages}
            </button>
          </>
        )}

        <button
          type="button"
          className="page-btn"
          disabled={page >= totalPages - 1}
          onClick={() => goToPage(page + 1)}
          aria-label="Trang sau"
        >
          <span className="d-none d-sm-inline me-1">Sau</span>
          <ChevronRight size={16} />
        </button>
      </div>
    );
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

      {!selectedTag && !loading && !error && visibleBlogs.length > 0 && (
        <div className="d-flex flex-wrap align-items-center justify-content-between gap-2 mb-3">
          <p className="text-muted small mb-0">
            {totalElements} bài viết · Trang {page + 1}/{totalPages}
          </p>
          <div className="d-flex align-items-center gap-1.5 small text-muted">
            <span>Mỗi trang:</span>
            <select
              className="form-select form-select-sm py-1 px-2 border rounded-pill"
              style={{ width: 'auto', fontSize: '0.8rem', background: 'var(--surface-1)' }}
              value={pageSize}
              onChange={(e) => {
                setPageSize(Number(e.target.value));
                setPage(0);
              }}
              aria-label="Chọn số bài viết mỗi trang"
            >
              {PAGE_SIZE_OPTIONS.map((size) => (
                <option key={size} value={size}>
                  {size} bài viết {size === DEFAULT_PAGE_SIZE ? '' : ''}
                </option>
              ))}
            </select>
          </div>
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

          {!selectedTag && totalElements > 0 && (
            <div className="d-flex flex-wrap align-items-center justify-content-between gap-3 mt-4 pt-4 border-top">
              <div className="text-muted small">
                Hiển thị <strong>{Math.min(page * pageSize + 1, totalElements)} - {Math.min((page + 1) * pageSize, totalElements)}</strong> trong tổng số <strong>{totalElements}</strong> bài viết
              </div>
              <div className="d-flex flex-wrap align-items-center gap-3">
                <div className="d-flex align-items-center gap-1.5 small text-muted">
                  <span>Mỗi trang:</span>
                  <select
                    className="form-select form-select-sm py-1 px-2 border rounded-pill"
                    style={{ width: 'auto', fontSize: '0.8rem', background: 'var(--surface-1)' }}
                    value={pageSize}
                    onChange={(e) => {
                      setPageSize(Number(e.target.value));
                      setPage(0);
                    }}
                    aria-label="Chọn số lượng hiển thị mỗi trang"
                  >
                    {PAGE_SIZE_OPTIONS.map((size) => (
                      <option key={size} value={size}>
                        {size} / trang {size === DEFAULT_PAGE_SIZE ? '' : ''}
                      </option>
                    ))}
                  </select>
                </div>
                {renderPaginationButtons()}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default BlogList;
