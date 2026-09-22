import { useState, useEffect, useCallback, useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
  Search,
  MapPin,
  SlidersHorizontal,
  X,
  ArrowRight,
  CalendarX2,
  AlertCircle,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { getCategories, getEvents, getBlogPosts } from '../utils/api';
import { VIETNAM_PROVINCES } from '../utils/constants';

import EventCard from '../components/EventCard';
import BlogCard from '../components/BlogCard';
import NewsSlider, { buildSlides } from '../components/NewsSlider';

const PAGE_SIZE = 12;
const EMPTY_FILTERS = { keyword: '', categoryId: '', province: '', minPrice: '' };

const EventSkeleton = () => (
  <div className="tile">
    <div className="skeleton" style={{ aspectRatio: '16 / 10', borderRadius: 0 }} />
    <div className="tile-body">
      <div className="skeleton" style={{ height: 15, width: '85%' }} />
      <div className="skeleton" style={{ height: 12, width: '60%' }} />
      <div className="skeleton" style={{ height: 12, width: '70%' }} />
    </div>
  </div>
);

const Home = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalElements, setTotalElements] = useState(0);

  const [categories, setCategories] = useState([]);
  const [featuredBlogs, setFeaturedBlogs] = useState([]);
  const [slides, setSlides] = useState([]);

  // `filters` is what the user typed; `applied` is what we actually query with,
  // so typing in the keyword box doesn't fire a request per keystroke.
  const [filters, setFilters] = useState(EMPTY_FILTERS);
  const [applied, setApplied] = useState(EMPTY_FILTERS);

  const setFilter = (key, value) =>
    setFilters((prev) => ({ ...prev, [key]: value }));

  // Debounce the free-text/number inputs, apply selects immediately.
  useEffect(() => {
    const timer = setTimeout(() => {
      setApplied((prev) => {
        const next = { ...filters };
        const changed = Object.keys(next).some((k) => next[k] !== prev[k]);
        return changed ? next : prev;
      });
    }, 350);
    return () => clearTimeout(timer);
  }, [filters]);

  // Any filter change goes back to page 1.
  useEffect(() => {
    setPage(1);
  }, [applied]);

  const fetchEvents = useCallback(async (signal) => {
    setLoading(true);
    setError('');
    try {
      const data = await getEvents(
        { page, size: PAGE_SIZE, ...applied },
        { signal },
      );
      if (data?.code === 1000 && data.result) {
        setEvents(data.result.content || []);
        setTotalPages(Math.max(data.result.totalPages || 1, 1));
        setTotalElements(data.result.totalElements ?? 0);
      } else {
        setEvents([]);
        setError(data?.message || 'Không tải được danh sách sự kiện.');
      }
    } catch (err) {
      if (err.name === 'CanceledError' || err.code === 'ERR_CANCELED') return;
      setEvents([]);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [page, applied]);

  useEffect(() => {
    const controller = new AbortController();
    fetchEvents(controller.signal);
    return () => controller.abort();
  }, [fetchEvents]);

  useEffect(() => {
    getCategories()
      .then((data) => setCategories(data?.code === 1000 ? data.result || [] : []))
      .catch(() => setCategories([]));
  }, []);

  // News strip + "latest news" section. Sourced from published posts; when
  // there is no news yet we fall back to the newest events. If neither exists
  // buildSlides returns [] and the strip renders nothing — no placeholder.
  useEffect(() => {
    let cancelled = false;
    (async () => {
      let posts;
      try {
        const res = await getBlogPosts({ page: 0, size: 6 });
        posts = res?.result?.content || [];
      } catch {
        posts = [];
      }
      if (cancelled) return;
      setFeaturedBlogs(posts);

      if (posts.length) {
        setSlides(buildSlides({ posts }));
        return;
      }
      try {
        const res = await getEvents({ page: 1, size: 5 });
        if (!cancelled) {
          setSlides(buildSlides({ events: res?.result?.content || [] }));
        }
      } catch {
        if (!cancelled) setSlides([]);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const activeFilterCount = useMemo(
    () => Object.values(applied).filter((v) => v !== '').length,
    [applied],
  );

  const clearFilters = () => {
    setFilters(EMPTY_FILTERS);
    setApplied(EMPTY_FILTERS);
  };

  const goToPage = (next) => {
    setPage(next);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <>
      <NewsSlider slides={slides} />

      <div className="container py-5">
        {/* ---- Search & filters, centred ---- */}
        <section className="mx-auto" style={{ maxWidth: 940 }}>
          <div className="text-center mb-4">
            <h1 className="fw-bold mb-2" style={{ fontSize: 'clamp(1.75rem, 4vw, 2.5rem)' }}>
              Khám phá sự kiện
            </h1>
            <p className="text-muted mb-0">
              Tìm concert, hội thảo, workshop và đặt vé chỉ trong vài bước.
            </p>
          </div>

          <div className="panel p-3 p-md-4">
            <div className="field mb-3">
              <Search size={17} />
              <input
                type="text"
                className="form-control form-control-lg"
                style={{ fontSize: '1rem' }}
                placeholder="Tìm theo tên sự kiện…"
                value={filters.keyword}
                onChange={(e) => setFilter('keyword', e.target.value)}
                aria-label="Từ khóa tìm kiếm"
              />
            </div>

            <div className="row g-2 g-md-3">
              <div className="col-12 col-sm-6 col-lg-4">
                <label className="form-label d-flex align-items-center gap-1">
                  <SlidersHorizontal size={13} /> Danh mục
                </label>
                <select
                  className="form-select"
                  value={filters.categoryId}
                  onChange={(e) => {
                    setFilter('categoryId', e.target.value);
                    setApplied((p) => ({ ...p, categoryId: e.target.value }));
                  }}
                >
                  <option value="">Tất cả danh mục</option>
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="col-12 col-sm-6 col-lg-4">
                <label className="form-label d-flex align-items-center gap-1">
                  <MapPin size={13} /> Tỉnh / Thành phố
                </label>
                <select
                  className="form-select"
                  value={filters.province}
                  onChange={(e) => {
                    setFilter('province', e.target.value);
                    setApplied((p) => ({ ...p, province: e.target.value }));
                  }}
                >
                  <option value="">Toàn quốc</option>
                  {VIETNAM_PROVINCES.map((p) => (
                    <option key={p} value={p}>
                      {p}
                    </option>
                  ))}
                </select>
              </div>

              <div className="col-12 col-lg-4">
                <label className="form-label">Giá vé từ (VNĐ)</label>
                <input
                  type="number"
                  min="0"
                  step="10000"
                  className="form-control"
                  placeholder="0"
                  value={filters.minPrice}
                  onChange={(e) => setFilter('minPrice', e.target.value)}
                />
              </div>
            </div>

            {activeFilterCount > 0 && (
              <div className="d-flex align-items-center justify-content-between gap-3 mt-3 pt-3 border-top">
                <span className="small text-muted">
                  {loading
                    ? 'Đang lọc…'
                    : `${totalElements} sự kiện khớp với bộ lọc`}
                </span>
                <button
                  type="button"
                  className="btn btn-ghost btn-sm d-inline-flex align-items-center gap-1 px-3"
                  onClick={clearFilters}
                >
                  <X size={14} /> Xóa bộ lọc
                </button>
              </div>
            )}
          </div>
        </section>

        {/* ---- Results ---- */}
        <section className="mt-5">
          <div className="d-flex align-items-baseline justify-content-between mb-3">
            <h2 className="section-title">
              {activeFilterCount > 0 ? 'Kết quả tìm kiếm' : 'Sự kiện đang diễn ra'}
            </h2>
            {!loading && totalElements > 0 && (
              <span className="small text-muted">{totalElements} sự kiện</span>
            )}
          </div>

          {error ? (
            <div className="panel p-5 text-center">
              <AlertCircle size={34} className="mb-3" style={{ color: 'var(--danger)' }} />
              <h3 className="h6 fw-bold mb-2">Không tải được sự kiện</h3>
              <p className="text-muted small mb-4">{error}</p>
              <button className="btn btn-accent px-4 py-2" onClick={() => fetchEvents()}>
                Thử lại
              </button>
            </div>
          ) : loading ? (
            <div className="row g-3 row-cols-1 row-cols-sm-2 row-cols-lg-3 row-cols-xl-4">
              {Array.from({ length: 8 }).map((_, i) => (
                <div className="col" key={i}>
                  <EventSkeleton />
                </div>
              ))}
            </div>
          ) : events.length === 0 ? (
            <div className="panel p-5 text-center">
              <CalendarX2 size={34} className="text-muted mb-3" />
              <h3 className="h6 fw-bold mb-2">Không tìm thấy sự kiện phù hợp</h3>
              <p className="text-muted small mb-4">
                Thử bỏ bớt bộ lọc hoặc tìm với từ khóa khác.
              </p>
              {activeFilterCount > 0 && (
                <button className="btn btn-ghost px-4 py-2" onClick={clearFilters}>
                  Xóa bộ lọc
                </button>
              )}
            </div>
          ) : (
            <div className="row g-3 row-cols-1 row-cols-sm-2 row-cols-lg-3 row-cols-xl-4">
              {events.map((event) => (
                <div className="col" key={event.id}>
                  <EventCard event={event} />
                </div>
              ))}
            </div>
          )}

          {!loading && !error && totalPages > 1 && (
            <nav className="d-flex justify-content-center align-items-center gap-2 mt-4">
              <button
                className="btn btn-ghost btn-sm px-3 py-2 d-inline-flex align-items-center gap-1"
                disabled={page <= 1}
                onClick={() => goToPage(page - 1)}
              >
                <ChevronLeft size={15} /> Trước
              </button>
              <span className="small text-muted px-2">
                Trang <strong style={{ color: 'var(--text)' }}>{page}</strong> / {totalPages}
              </span>
              <button
                className="btn btn-ghost btn-sm px-3 py-2 d-inline-flex align-items-center gap-1"
                disabled={page >= totalPages}
                onClick={() => goToPage(page + 1)}
              >
                Sau <ChevronRight size={15} />
              </button>
            </nav>
          )}
        </section>

        {/* ---- Latest news ---- */}
        {featuredBlogs.length > 0 && (
          <section className="mt-5 pt-5 border-top">
            <div className="d-flex flex-wrap align-items-baseline justify-content-between gap-2 mb-3">
              <h2 className="section-title">Tin tức &amp; cẩm nang</h2>
              <Link
                to="/blog"
                className="small fw-semibold d-inline-flex align-items-center gap-1"
              >
                Xem tất cả <ArrowRight size={14} />
              </Link>
            </div>
            <div className="row g-3 row-cols-1 row-cols-sm-2 row-cols-lg-3">
              {featuredBlogs.slice(0, 3).map((blog) => (
                <div className="col" key={blog.id}>
                  <BlogCard blog={blog} />
                </div>
              ))}
            </div>
          </section>
        )}
      </div>
    </>
  );
};

export default Home;
