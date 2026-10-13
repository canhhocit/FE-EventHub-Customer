import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import {
  SlidersHorizontal,
  ChevronLeft,
  ChevronRight,
  RotateCcw,
  Flame,
  MapPin,
  Calendar,
} from 'lucide-react';
import {
  getCategories,
  getEvents,
  getBlogPosts,
  getTopFeaturedEvents,
} from '../utils/api';
import {
  getImageUrl,
  handleImageError,
  formatDate,
  formatCurrency,
  getEventStatus,
} from '../utils/constants';

import EventCard from '../components/EventCard';
import BlogCard from '../components/BlogCard';
import NewsSlider, { buildSlides } from '../components/NewsSlider';

// Mặc định 20 vé mỗi trang theo yêu cầu
const DEFAULT_PAGE_SIZE = 20;
const PAGE_SIZE_OPTIONS = [10, 20, 40, 60];

const EMPTY_FILTERS = {
  keyword: '',
  categoryId: '',
  province: '',
  minPrice: '',
  maxPrice: '',
};

/* Khoảng giá dựng sẵn — người mua nghĩ theo mức tiền, không theo ô nhập số. */
const PRICE_RANGES = [
  { key: 'u200', label: 'Dưới 200.000đ', minPrice: '', maxPrice: '200000' },
  { key: '200-500', label: '200.000đ - 500.000đ', minPrice: '200000', maxPrice: '500000' },
  { key: '500-1m', label: '500.000đ - 1 triệu', minPrice: '500000', maxPrice: '1000000' },
  { key: 'o1m', label: 'Trên 1 triệu', minPrice: '1000000', maxPrice: '' },
];

const matchRange = ({ minPrice, maxPrice }) =>
  PRICE_RANGES.find((r) => r.minPrice === minPrice && r.maxPrice === maxPrice) || null;

const EventSkeleton = () => (
  <div className="tile">
    <div className="skeleton" style={{ aspectRatio: '16 / 10', borderRadius: 0 }} />
    <div className="tile-body">
      <div className="skeleton" style={{ height: 16, width: '85%' }} />
      <div className="skeleton" style={{ height: 13, width: '60%' }} />
      <div className="skeleton" style={{ height: 13, width: '75%' }} />
    </div>
  </div>
);

const Home = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const urlKeyword = searchParams.get('keyword') || '';
  const urlProvince = searchParams.get('province') || '';

  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE);
  const [totalPages, setTotalPages] = useState(1);
  const [totalElements, setTotalElements] = useState(0);

  const [categories, setCategories] = useState([]);
  const [featuredBlogs, setFeaturedBlogs] = useState([]);
  const [slides, setSlides] = useState([]);
  const [topFeaturedEvents, setTopFeaturedEvents] = useState([]);
  const [loadingTopFeatured, setLoadingTopFeatured] = useState(true);

  // Bộ lọc giá nằm trong popover nhỏ, thay cho sidebar cũ
  const [priceOpen, setPriceOpen] = useState(false);
  const priceRef = useRef(null);

  /* Danh mục và khoảng giá là các lựa chọn rời rạc nên áp dụng ngay, không
     cần debounce như ô nhập tay trước đây. */
  const [applied, setApplied] = useState({
    ...EMPTY_FILTERS,
    keyword: urlKeyword,
    province: urlProvince,
  });

  useEffect(() => {
    setApplied((prev) => {
      if (prev.keyword === urlKeyword && prev.province === urlProvince) return prev;
      return { ...prev, keyword: urlKeyword, province: urlProvince };
    });
    setPage(1);
  }, [urlKeyword, urlProvince]);

  // Đóng popover giá khi bấm ra ngoài
  useEffect(() => {
    if (!priceOpen) return undefined;
    const onDocClick = (e) => {
      if (priceRef.current && !priceRef.current.contains(e.target)) setPriceOpen(false);
    };
    const onEsc = (e) => e.key === 'Escape' && setPriceOpen(false);
    document.addEventListener('mousedown', onDocClick);
    document.addEventListener('keydown', onEsc);
    return () => {
      document.removeEventListener('mousedown', onDocClick);
      document.removeEventListener('keydown', onEsc);
    };
  }, [priceOpen]);

  const fetchEvents = useCallback(
    async (signal) => {
      setLoading(true);
      setError('');
      try {
        const data = await getEvents({ page, size: pageSize, ...applied }, { signal });
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
    },
    [page, pageSize, applied],
  );

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

  useEffect(() => {
    let cancelled = false;
    getTopFeaturedEvents()
      .then((data) => {
        if (cancelled) return;
        const list = data?.code === 1000 ? data.result || [] : [];
        if (Array.isArray(list) && list.length > 0) {
          setTopFeaturedEvents(list);
        }
      })
      .catch((err) => {
        console.warn('Lỗi tải top sự kiện nổi bật:', err);
      })
      .finally(() => {
        if (!cancelled) setLoadingTopFeatured(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const displayTopEvents = useMemo(() => {
    if (topFeaturedEvents.length > 0) return topFeaturedEvents.slice(0, 5);
    if (!loadingTopFeatured && events.length > 0) {
      return events.slice(0, 5).map((ev) => ({
        eventId: ev.id,
        eventName: ev.name,
        status: ev.status,
        province: ev.province || ev.address,
        startTime: ev.startTime,
        eventImage: ev.imageUrls?.[0],
        minPrice: ev.ticketTypes?.length
          ? Math.min(...ev.ticketTypes.map((t) => Number(t.price)).filter(Number.isFinite))
          : null,
        ticketsSold: 0,
        occupancyRate: 0,
      }));
    }
    return [];
  }, [topFeaturedEvents, events, loadingTopFeatured]);

  const activeFilterCount = useMemo(
    () => Object.values(applied).filter((v) => v !== '').length,
    [applied],
  );
  const activeRange = matchRange(applied);
  const priceFilterOn = applied.minPrice !== '' || applied.maxPrice !== '';

  const selectPriceRange = (range) => {
    const patch = range
      ? { minPrice: range.minPrice, maxPrice: range.maxPrice }
      : { minPrice: '', maxPrice: '' };
    setApplied((p) => ({ ...p, ...patch }));
    setPage(1);
    setPriceOpen(false);
  };

  const clearFilters = () => {
    setApplied(EMPTY_FILTERS);
    setPage(1);
    setSearchParams({});
  };

  const selectCategory = (categoryId) => {
    setApplied((p) => ({ ...p, categoryId }));
    setPage(1);
  };

  const goToPage = (next) => {
    setPage(next);
    const el = document.getElementById('events-section');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    } else {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const renderPaginationButtons = () => {
    const pages = [];
    const maxVisible = 5;
    let start = Math.max(1, page - Math.floor(maxVisible / 2));
    const end = Math.min(totalPages, start + maxVisible - 1);

    if (end - start + 1 < maxVisible) {
      start = Math.max(1, end - maxVisible + 1);
    }

    for (let i = start; i <= end; i++) {
      pages.push(i);
    }

    return (
      <div className="pagination-clean">
        <button
          type="button"
          className="page-btn"
          disabled={page <= 1}
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
              className={`page-btn ${page === 1 ? 'is-active' : ''}`}
              onClick={() => goToPage(1)}
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
            className={`page-btn ${p === page ? 'is-active' : ''}`}
            onClick={() => goToPage(p)}
          >
            {p}
          </button>
        ))}

        {end < totalPages && (
          <>
            {end < totalPages - 1 && <span className="text-muted px-1">…</span>}
            <button
              type="button"
              className={`page-btn ${page === totalPages ? 'is-active' : ''}`}
              onClick={() => goToPage(totalPages)}
            >
              {totalPages}
            </button>
          </>
        )}

        <button
          type="button"
          className="page-btn"
          disabled={page >= totalPages}
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
    <>
      {/* 1. Banner tin tức cao gần hết màn hình */}
      <NewsSlider slides={slides} />

      {/* 1.5. Top sự kiện nổi bật & bán chạy nhất sàn */}
      {displayTopEvents.length > 0 && (
        <section className="top-featured-section py-4 py-lg-5">
          <div className="container">
            <div className="d-flex flex-wrap align-items-end justify-content-between gap-3 mb-4">
              <div>
                <div className="d-flex align-items-center gap-2 mb-1">
                  <span className="badge rounded-pill bg-danger-subtle text-danger px-2.5 py-1 d-inline-flex align-items-center gap-1.5" style={{ fontSize: '0.75rem', fontWeight: 700 }}>
                    <Flame size={14} className="text-danger" /> BÁN CHẠY NHẤT
                  </span>
                  <span className="text-muted small">Cập nhật theo thời gian thực</span>
                </div>
                <h2 className="section-title d-flex align-items-center gap-2">
                  Top Sự Kiện Nổi Bật &amp; Bán Chạy Nhất
                </h2>
                <p className="text-muted small mb-0 mt-1">
                  Những sự kiện hot nhất đang dẫn đầu về số vé bán ra và tỷ lệ lấp chỗ
                </p>
              </div>
              <a
                href="#events-section"
                className="btn btn-sm btn-ghost d-inline-flex align-items-center gap-1 text-primary fw-semibold"
              >
                <span>Xem tất cả sự kiện</span>
                <ChevronRight size={15} />
              </a>
            </div>

            <div className="top-featured-grid">
              {displayTopEvents.map((ev, index) => {
                const rank = index + 1;
                const rankClass = rank === 1 ? 'top-rank-1' : rank === 2 ? 'top-rank-2' : rank === 3 ? 'top-rank-3' : 'top-rank-other';
                const status = getEventStatus(ev.status);
                const minPrice = ev.minPrice;
                const occupancy = Number(ev.occupancyRate) || 0;
                const sold = Number(ev.ticketsSold) || 0;

                return (
                  <article className="top-card" key={ev.eventId || index}>
                    <div className="top-card-rank">
                      <span className={`top-card-rank ${rankClass}`}>
                        {rank === 1 && <Flame size={13} />}
                        #{rank}
                      </span>
                    </div>

                    <div className="top-card-media">
                      <img
                        src={getImageUrl(ev.eventImage)}
                        onError={handleImageError}
                        alt={ev.eventName}
                        loading="lazy"
                      />
                      <span className={`pill pill-on-media ${status.pill}`} style={{ left: 'auto', right: 10 }}>
                        {status.label}
                      </span>
                    </div>

                    <div className="top-card-body">
                      <h3 className="top-card-title clamp-2" title={ev.eventName}>
                        <Link
                          to={`/events/${ev.eventId}`}
                          className="stretched-link text-decoration-none"
                          style={{ color: 'inherit' }}
                        >
                          {ev.eventName}
                        </Link>
                      </h3>

                      <div className="top-card-meta">
                        <Calendar size={13} className="text-muted flex-shrink-0" />
                        <span className="text-truncate">{formatDate(ev.startTime)}</span>
                      </div>

                      <div className="top-card-meta">
                        <MapPin size={13} className="text-muted flex-shrink-0" />
                        <span className="text-truncate">{ev.province || 'Toàn quốc'}</span>
                      </div>

                      {sold > 0 && (
                        <div className="mt-2 pt-2 border-top" style={{ borderColor: 'var(--border)' }}>
                          <div className="d-flex align-items-center justify-content-between small text-muted mb-1" style={{ fontSize: '0.72rem' }}>
                            <span>Đã bán: <strong className="text-body">{sold.toLocaleString('vi-VN')} vé</strong></span>
                            {occupancy > 0 && <span className="text-primary fw-semibold">{Math.min(100, Math.round(occupancy))}%</span>}
                          </div>
                          {occupancy > 0 && (
                            <div className="progress" style={{ height: '4px', background: 'var(--surface-3)', borderRadius: '999px' }}>
                              <div
                                className="progress-bar"
                                style={{
                                  width: `${Math.min(100, Math.max(10, Math.round(occupancy)))}%`,
                                  background: rank === 1 ? 'linear-gradient(90deg, #f59e0b, #ef4444)' : 'var(--accent)',
                                  borderRadius: '999px',
                                }}
                              />
                            </div>
                          )}
                        </div>
                      )}

                      <div className="top-card-foot mt-auto">
                        {minPrice === null || minPrice === undefined ? (
                          <span className="price-from">Chưa mở bán</span>
                        ) : Number(minPrice) === 0 ? (
                          <span className="price text-success">Miễn phí</span>
                        ) : (
                          <span>
                            <span className="price-from">Từ </span>
                            <span className="price text-primary">{formatCurrency(minPrice)}</span>
                          </span>
                        )}
                        <span className="btn-book-hint small fw-semibold text-primary d-inline-flex align-items-center gap-0.5" style={{ fontSize: '0.75rem' }}>
                          Đặt vé <ChevronRight size={12} />
                        </span>
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          </div>
        </section>
      )}

      <div className="container py-4 py-lg-5" id="events-section">
        {/* 2. Tiêu đề + thanh chọn loại vé (thay cho sidebar bên trái) */}
        <h1 className="section-title mb-3">Sự kiện</h1>

        <div className="cat-tabs mb-3">
          <button
            type="button"
            className={`cat-tab${applied.categoryId === '' ? ' is-active' : ''}`}
            onClick={() => selectCategory('')}
          >
            Tất cả
          </button>
          {categories.map((c) => (
            <button
              key={c.id}
              type="button"
              className={`cat-tab${String(applied.categoryId) === String(c.id) ? ' is-active' : ''}`}
              onClick={() => selectCategory(String(c.id))}
            >
              {c.name}
            </button>
          ))}
        </div>

        {/* 3. Dòng công cụ: số kết quả + chọn số item/trang + lọc giá */}
        <div className="filter-bar justify-content-between mb-4">
          <div className="d-flex align-items-center gap-3 flex-wrap">
            <p className="text-muted small mb-0">
              {loading
                ? 'Đang tải danh sách vé…'
                : `${totalElements} sự kiện · trang ${page}/${totalPages}`}
            </p>
            <div className="d-flex align-items-center gap-1.5 small text-muted">
              <span>Mỗi trang:</span>
              <select
                className="form-select form-select-sm py-1 px-2 border rounded-pill"
                style={{ width: 'auto', fontSize: '0.8rem', background: 'var(--surface-1)' }}
                value={pageSize}
                onChange={(e) => {
                  setPageSize(Number(e.target.value));
                  setPage(1);
                }}
                aria-label="Chọn số sự kiện mỗi trang"
              >
                {PAGE_SIZE_OPTIONS.map((size) => (
                  <option key={size} value={size}>
                    {size} sự kiện {size === DEFAULT_PAGE_SIZE ? '' : ''}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="filter-bar">
            <div className="position-relative" ref={priceRef}>
              <button
                type="button"
                className={`filter-chip${priceFilterOn ? ' is-on' : ''}`}
                onClick={() => setPriceOpen((v) => !v)}
                aria-expanded={priceOpen}
              >
                <SlidersHorizontal size={15} />
                <span>{activeRange ? activeRange.label : 'Khoảng giá'}</span>
              </button>

              {priceOpen && (
                <div className="filter-pop" role="listbox">
                  <button
                    type="button"
                    className={`filter-pop-option${priceFilterOn ? '' : ' is-active'}`}
                    onClick={() => selectPriceRange(null)}
                  >
                    Tất cả mức giá
                  </button>
                  {PRICE_RANGES.map((range) => (
                    <button
                      key={range.key}
                      type="button"
                      className={`filter-pop-option${
                        activeRange?.key === range.key ? ' is-active' : ''
                      }`}
                      onClick={() => selectPriceRange(range)}
                    >
                      {range.label}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {activeFilterCount > 0 && (
              <button type="button" className="filter-chip" onClick={clearFilters}>
                <RotateCcw size={15} />
                <span>Xóa bộ lọc ({activeFilterCount})</span>
              </button>
            )}
          </div>
        </div>

        {/* 4. Lưới vé: 4 vé mỗi dòng */}
        {error ? (
          <div className="panel p-5 text-center">
            <h3 className="h6 fw-bold mb-2">Không tải được sự kiện</h3>
            <p className="text-muted small mb-3">{error}</p>
            <button className="btn btn-accent btn-sm px-4" onClick={() => fetchEvents()}>
              Thử lại
            </button>
          </div>
        ) : loading ? (
          <div className="row g-4 row-cols-1 row-cols-sm-2 row-cols-lg-3 row-cols-xl-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <div className="col" key={i}>
                <EventSkeleton />
              </div>
            ))}
          </div>
        ) : events.length === 0 ? (
          <div className="panel p-5 text-center">
            <h3 className="h6 fw-bold mb-2">Không tìm thấy sự kiện phù hợp</h3>
            <p className="text-muted small mb-3">
              Thử thay đổi từ khóa hoặc loại bỏ bớt các bộ lọc để có thêm kết quả.
            </p>
            {activeFilterCount > 0 && (
              <button className="btn btn-ghost btn-sm px-3" onClick={clearFilters}>
                Xóa tất cả bộ lọc
              </button>
            )}
          </div>
        ) : (
          <>
            <div className="row g-4 row-cols-1 row-cols-sm-2 row-cols-lg-3 row-cols-xl-4">
              {events.map((event) => (
                <div className="col" key={event.id}>
                  <EventCard event={event} />
                </div>
              ))}
            </div>

            {totalElements > 0 && (
              <div className="d-flex flex-wrap align-items-center justify-content-between gap-3 mt-4 pt-4 border-top">
                <div className="text-muted small">
                  Hiển thị <strong>{Math.min((page - 1) * pageSize + 1, totalElements)} - {Math.min(page * pageSize, totalElements)}</strong> trong tổng số <strong>{totalElements}</strong> sự kiện
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
                        setPage(1);
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

        {/* 5. Tin tức & cẩm nang */}
        {featuredBlogs.length > 0 && (
          <section className="mt-5 pt-5 border-top" style={{ borderColor: 'var(--border)' }}>
            <div className="d-flex flex-wrap align-items-baseline justify-content-between gap-2 mb-4">
              <div>
                <h2 className="section-title">Tin tức &amp; Cẩm nang sự kiện</h2>
                <p className="text-muted small mb-0">
                  Cập nhật tin tức biểu diễn và hướng dẫn mua vé
                </p>
              </div>
              <Link to="/blog" className="small fw-semibold hover-primary">
                Xem tất cả tin
              </Link>
            </div>
            <div className="row g-4 row-cols-1 row-cols-sm-2 row-cols-lg-3">
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
