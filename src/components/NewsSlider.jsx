import { useEffect, useRef, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { ChevronLeft, ChevronRight, Calendar, MapPin } from 'lucide-react';
import {
  getImageUrl,
  handleImageError,
  formatDate,
  getEventLocation,
} from '../utils/constants';

const AUTOPLAY_MS = 6000;
const SWIPE_THRESHOLD = 60; // px of drag before the slide actually changes

/**
 * Full-bleed news strip that sits directly under the navbar.
 * Renders nothing at all when there is no content — no placeholder.
 */
const NewsSlider = ({ slides = [] }) => {
  const [index, setIndex] = useState(0);
  const [drag, setDrag] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [paused, setPaused] = useState(false);
  const startX = useRef(0);
  const startY = useRef(0);
  const axis = useRef(null);
  const stripRef = useRef(null);
  const dragged = useRef(false);
  const dragging = useRef(false);
  const dragRef = useRef(0);

  const count = slides.length;

  const goTo = useCallback(
    (next) => {
      if (count === 0) return;
      setIndex(((next % count) + count) % count);
    },
    [count],
  );

  // Autoplay, paused while hovering or dragging.
  useEffect(() => {
    if (count <= 1 || paused || isDragging) return undefined;
    const timer = setInterval(() => setIndex((i) => (i + 1) % count), AUTOPLAY_MS);
    return () => clearInterval(timer);
  }, [count, paused, isDragging]);

  useEffect(() => {
    if (index > count - 1) setIndex(0);
  }, [count, index]);

  /**
   * Touch events rather than pointer events: Chrome cancels the pointer
   * stream as soon as it suspects a scroll, so pointermove/pointerup stop
   * arriving mid-swipe. Touch (plus mouse for desktop drag) is delivered
   * reliably on real devices.
   */
  const beginDrag = (x, y) => {
    if (count <= 1) return;
    startX.current = x;
    startY.current = y;
    axis.current = null;
    dragging.current = true;
    setIsDragging(true);
  };

  const moveDrag = (x, y) => {
    if (!dragging.current) return;
    const dx = x - startX.current;
    const dy = y - startY.current;

    // Lock to one axis on the first real movement so a vertical page scroll
    // never turns into a half-dragged slide.
    if (axis.current === null) {
      if (Math.abs(dx) < 6 && Math.abs(dy) < 6) return;
      axis.current = Math.abs(dx) > Math.abs(dy) ? 'x' : 'y';
      if (axis.current === 'y') {
        dragging.current = false;
        setIsDragging(false);
        setDrag(0);
        return;
      }
    }
    if (axis.current !== 'x') return;

    // Rubber-band at the ends instead of dragging into empty space.
    const atEdge = (index === 0 && dx > 0) || (index === count - 1 && dx < 0);
    dragRef.current = atEdge ? dx * 0.35 : dx;
    setDrag(dragRef.current);
  };

  const endDrag = () => {
    if (!dragging.current) return;
    dragging.current = false;
    setIsDragging(false);

    const distance = dragRef.current;
    // A drag must not also count as a click on the slide's link.
    dragged.current = Math.abs(distance) > 4;
    dragRef.current = 0;
    setDrag(0);

    if (Math.abs(distance) > SWIPE_THRESHOLD) {
      goTo(index + (distance < 0 ? 1 : -1));
    }
  };

  const onTouchStart = (e) => beginDrag(e.touches[0].clientX, e.touches[0].clientY);
  const onTouchMove = (e) => moveDrag(e.touches[0].clientX, e.touches[0].clientY);

  const onMouseDown = (e) => {
    if (e.button !== 0) return;
    beginDrag(e.clientX, e.clientY);
  };

  // Track the mouse on the window so a drag survives leaving the strip.
  useEffect(() => {
    if (!isDragging) return undefined;
    const onMove = (e) => moveDrag(e.clientX, e.clientY);
    const onUp = () => endDrag();
    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);
    return () => {
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseup', onUp);
    };
  });

  const onCaptureClick = (e) => {
    if (dragged.current) {
      e.preventDefault();
      e.stopPropagation();
      dragged.current = false;
    }
  };

  if (count === 0) return null;

  const offset = -index * 100;
  const dragPx = isDragging ? drag : 0;

  return (
    <section
      className="news-strip"
      ref={stripRef}
      aria-roledescription="carousel"
      aria-label="Tin tức nổi bật"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      <div
        className={`news-track${isDragging ? '' : ' is-animating'}`}
        style={{
          transform: `translate3d(calc(${offset}% + ${dragPx}px), 0, 0)`,
          touchAction: 'pan-y',
          cursor: count > 1 ? (isDragging ? 'grabbing' : 'grab') : undefined,
        }}
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={endDrag}
        onTouchCancel={endDrag}
        onMouseDown={onMouseDown}
        onDragStart={(e) => e.preventDefault()}
        onClickCapture={onCaptureClick}
      >
        {slides.map((slide, i) => (
          <article
            className="news-slide"
            key={slide.key}
            aria-label={`${i + 1} / ${count}`}
          >
            <img
              src={getImageUrl(slide.image)}
              onError={handleImageError}
              alt=""
              draggable={false}
              loading={i === 0 ? 'eager' : 'lazy'}
            />
            <div className="news-caption">
              <div className="container">
                <div className="news-meta">
                  {slide.tag && <span className="news-tag">{slide.tag}</span>}
                  {slide.date && (
                    <span className="d-inline-flex align-items-center gap-1">
                      <Calendar size={13} /> {formatDate(slide.date)}
                    </span>
                  )}
                  {slide.location && (
                    <span className="d-inline-flex align-items-center gap-1">
                      <MapPin size={13} /> {slide.location}
                    </span>
                  )}
                </div>
                <h2 className="news-title">
                  <Link
                    to={slide.href}
                    className="text-white stretched-link"
                    tabIndex={i === index ? 0 : -1}
                  >
                    {slide.title}
                  </Link>
                </h2>
                {slide.summary && <p className="news-summary">{slide.summary}</p>}
              </div>
            </div>
          </article>
        ))}
      </div>

      {count > 1 && (
        <>
          <button
            type="button"
            className="news-arrow prev"
            onClick={() => goTo(index - 1)}
            aria-label="Tin trước"
          >
            <ChevronLeft size={20} />
          </button>
          <button
            type="button"
            className="news-arrow next"
            onClick={() => goTo(index + 1)}
            aria-label="Tin tiếp theo"
          >
            <ChevronRight size={20} />
          </button>
          <div className="news-dots">
            {slides.map((slide, i) => (
              <button
                key={slide.key}
                type="button"
                className={`news-dot${i === index ? ' is-active' : ''}`}
                onClick={() => goTo(i)}
                aria-label={`Tin ${i + 1}`}
                aria-current={i === index}
              />
            ))}
          </div>
        </>
      )}
    </section>
  );
};

/** Turns blog posts into slides; falls back to events when there is no news. */
export const buildSlides = ({ posts = [], events = [] }) => {
  if (posts.length) {
    return posts.slice(0, 6).map((post) => ({
      key: `post-${post.id}`,
      href: `/blog/${post.slug || post.id}`,
      image: post.thumbnail,
      title: post.title,
      summary: post.summary,
      date: post.publishedAt || post.createdAt,
      tag: [...(post.tags || [])][0]?.name || 'Tin tức',
    }));
  }

  return events.slice(0, 6).map((event) => ({
    key: `event-${event.id}`,
    href: `/events/${event.id}`,
    image: event.imageUrls?.[0],
    title: event.name,
    summary: event.category?.name ? `Sự kiện ${event.category.name}` : '',
    date: event.startTime,
    location: getEventLocation(event),
    tag: 'Sự kiện',
  }));
};

export default NewsSlider;
