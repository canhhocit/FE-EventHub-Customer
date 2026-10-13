import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation, useSearchParams } from 'react-router-dom';
import {
  Ticket,
  LogOut,
  ShoppingCart,
  User,
  Search,
  Menu,
  X,
  ChevronDown,
  MapPin,
} from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { VIETNAM_PROVINCES } from '../utils/constants';

/* Only the secondary pages live in the bar now — browsing happens through the
   category tabs on the home page, so "Trang chủ" and "Sự kiện" are gone. */
const NAV_ITEMS = [
  { to: '/blog', label: 'Tin tức', match: (p) => p.startsWith('/blog') },
  {
    to: '/help',
    label: 'Hỗ trợ',
    match: (p) => ['/help', '/guide', '/security', '/organizer-handbook'].includes(p),
  },
];

const ALL_LOCATIONS = 'Tất cả địa điểm';
const LOCATION_KEY = 'preferredProvince';

const readStoredProvince = () => {
  try {
    return localStorage.getItem(LOCATION_KEY) || '';
  } catch {
    return '';
  }
};

const Navbar = () => {
  const { getCartCount } = useCart();
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();

  const [menuOpen, setMenuOpen] = useState(false);
  const [locOpen, setLocOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [keyword, setKeyword] = useState(searchParams.get('keyword') || '');
  const [province, setProvince] = useState(
    () => searchParams.get('province') || readStoredProvince(),
  );
  const menuRef = useRef(null);
  const locRef = useRef(null);

  const cartCount = getCartCount();

  // Sync keyword input if URL changes
  useEffect(() => {
    setKeyword(searchParams.get('keyword') || '');
  }, [searchParams]);

  // The URL is the source of truth for the province while on the home page.
  useEffect(() => {
    const fromUrl = searchParams.get('province');
    if (fromUrl !== null) setProvince(fromUrl);
  }, [searchParams]);

  // Close menus on page navigation
  useEffect(() => {
    setMenuOpen(false);
    setLocOpen(false);
    setMobileOpen(false);
  }, [location.pathname]);

  // Click outside to close the open dropdown
  useEffect(() => {
    if (!menuOpen && !locOpen) return undefined;
    const onDocClick = (e) => {
      if (menuOpen && menuRef.current && !menuRef.current.contains(e.target)) {
        setMenuOpen(false);
      }
      if (locOpen && locRef.current && !locRef.current.contains(e.target)) {
        setLocOpen(false);
      }
    };
    const onEsc = (e) => {
      if (e.key !== 'Escape') return;
      setMenuOpen(false);
      setLocOpen(false);
    };
    document.addEventListener('mousedown', onDocClick);
    document.addEventListener('keydown', onEsc);
    return () => {
      document.removeEventListener('mousedown', onDocClick);
      document.removeEventListener('keydown', onEsc);
    };
  }, [menuOpen, locOpen]);

  const handleLogout = () => {
    logout();
    setMenuOpen(false);
    navigate('/');
  };

  /* Search and location both funnel into the home page's query string, which
     is what the event grid reads its filters from. */
  const goToEvents = (next = {}) => {
    const params = new URLSearchParams();
    const nextKeyword = next.keyword !== undefined ? next.keyword : keyword.trim();
    const nextProvince = next.province !== undefined ? next.province : province;
    if (nextKeyword) params.set('keyword', nextKeyword);
    if (nextProvince) params.set('province', nextProvince);
    const query = params.toString();
    navigate(`/${query ? `?${query}` : ''}`);
    const el = document.getElementById('events-section');
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    goToEvents();
  };

  const pickProvince = (value) => {
    setProvince(value);
    setLocOpen(false);
    try {
      if (value) localStorage.setItem(LOCATION_KEY, value);
      else localStorage.removeItem(LOCATION_KEY);
    } catch {
      /* private mode — the URL still carries the choice */
    }
    goToEvents({ province: value });
  };

  const displayName = user?.fullName || user?.username || 'Tài khoản';

  return (
    <header className="app-nav fixed-top">
      <div className="container-fluid px-3 px-lg-4 h-100 d-flex align-items-center gap-2 gap-lg-3">
        {/* Logo */}
        <Link to="/" className="brand-logo-group flex-shrink-0" title="EventTicket Trang chủ">
          <img
            src="/iconcustomer.png"
            alt="EventTicket Logo"
            className="brand-logo-img"
          />
          <span className="brand-logo-text d-none d-sm-inline">EventTicket</span>
        </Link>

        {/* Chọn địa điểm — ngay cạnh logo */}
        <div className="loc-picker d-none d-md-block" ref={locRef}>
          <button
            type="button"
            className="loc-trigger"
            onClick={() => setLocOpen((v) => !v)}
            aria-expanded={locOpen}
            aria-haspopup="listbox"
          >
            <MapPin size={16} className="text-muted" />
            <span className="text-truncate" style={{ maxWidth: 130 }}>
              {province || ALL_LOCATIONS}
            </span>
            <ChevronDown size={14} className="text-muted" />
          </button>

          {locOpen && (
            <div className="loc-panel" role="listbox">
              <button
                type="button"
                className={`loc-option${province ? '' : ' is-active'}`}
                onClick={() => pickProvince('')}
              >
                {ALL_LOCATIONS}
              </button>
              {VIETNAM_PROVINCES.map((p) => (
                <button
                  key={p}
                  type="button"
                  className={`loc-option${p === province ? ' is-active' : ''}`}
                  onClick={() => pickProvince(p)}
                >
                  {p}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Ô tìm kiếm — rộng hơn, chiếm phần giữa */}
        <div className="nav-search-bar flex-grow-1 d-none d-md-block">
          <form onSubmit={handleSearchSubmit} className="position-relative">
            <Search
              size={16}
              className="position-absolute top-50 start-0 translate-middle-y ms-3 text-muted"
              style={{ pointerEvents: 'none' }}
            />
            <input
              type="text"
              className="form-control nav-search-input"
              placeholder="Tìm kiếm sự kiện, nghệ sĩ, địa điểm..."
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              aria-label="Tìm kiếm sự kiện"
            />
          </form>
        </div>

        {/* Tin tức · Hỗ trợ · Bán vé — dồn về phía nút đăng nhập */}
        <nav className="d-none d-lg-flex align-items-center gap-1 flex-shrink-0 ms-auto">
          {NAV_ITEMS.map(({ to, label, match }) => (
            <Link
              key={to}
              to={to}
              className={`nav-item-link${match(location.pathname) ? ' is-active' : ''}`}
            >
              {label}
            </Link>
          ))}
          <Link to="/for-organizers" className="nav-sell-link d-none d-xl-inline-flex">
            Bán vé cùng EventTicket
          </Link>
        </nav>

        {/* Tài khoản */}
        <div className="d-flex align-items-center gap-2 flex-shrink-0">
          {!isAuthenticated ? (
            <div className="d-flex align-items-center gap-2">
              <Link to="/login" className="btn btn-ghost btn-sm px-3 py-2">
                Đăng nhập
              </Link>
              <Link
                to="/register"
                className="btn btn-accent btn-sm px-3 py-2 d-none d-sm-inline-block"
              >
                Đăng ký
              </Link>
            </div>
          ) : (
            <div className="position-relative" ref={menuRef}>
              <button
                type="button"
                className="nav-item-link d-inline-flex align-items-center gap-2 border-0 bg-transparent px-2 py-1"
                onClick={() => setMenuOpen((v) => !v)}
                aria-expanded={menuOpen}
                aria-haspopup="menu"
              >
                <span
                  className="rounded-circle d-grid flex-shrink-0"
                  style={{
                    width: 30,
                    height: 30,
                    background: 'var(--surface-3)',
                    placeItems: 'center',
                    fontSize: '0.8rem',
                    fontWeight: 700,
                    color: 'var(--text)',
                  }}
                >
                  {displayName.charAt(0).toUpperCase()}
                </span>
                <span className="d-none d-sm-inline text-truncate" style={{ maxWidth: 120 }}>
                  {displayName}
                </span>
                <ChevronDown size={14} className="text-muted" />
              </button>

              {menuOpen && (
                <div className="menu-panel" style={{ minWidth: 240, right: 0 }} role="menu">
                  <div
                    className="px-3 py-2 border-bottom mb-1"
                    style={{ borderColor: 'var(--border)' }}
                  >
                    <div className="fw-bold small text-truncate">{displayName}</div>
                    <div className="text-muted" style={{ fontSize: '0.75rem' }}>
                      {user?.email || user?.username}
                    </div>
                  </div>

                  <Link to="/profile" className="menu-item" role="menuitem">
                    <User size={15} />
                    <span>Quản lý tài khoản</span>
                  </Link>

                  <Link
                    to="/cart"
                    className="menu-item d-flex align-items-center justify-content-between"
                    role="menuitem"
                  >
                    <div className="d-flex align-items-center gap-2">
                      <ShoppingCart size={15} />
                      <span>Giỏ hàng</span>
                    </div>
                    {cartCount > 0 && (
                      <span
                        className="badge bg-primary rounded-pill px-2 py-1"
                        style={{ fontSize: '0.7rem' }}
                      >
                        {cartCount}
                      </span>
                    )}
                  </Link>

                  <Link to="/my-tickets" className="menu-item" role="menuitem">
                    <Ticket size={15} />
                    <span>Vé của tôi</span>
                  </Link>

                  <hr className="divider my-1" />

                  <button
                    type="button"
                    className="menu-item text-danger"
                    onClick={handleLogout}
                    role="menuitem"
                  >
                    <LogOut size={15} />
                    <span>Đăng xuất</span>
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Nút menu cho mobile */}
          <button
            type="button"
            className="btn btn-ghost btn-sm d-lg-none px-2 py-2"
            onClick={() => setMobileOpen((v) => !v)}
            aria-expanded={mobileOpen}
            aria-label="Mở menu điều hướng"
          >
            {mobileOpen ? <X size={18} /> : <Menu size={18} />}
          </button>
        </div>
      </div>

      {/* Tìm kiếm trên mobile */}
      <div
        className="d-md-none px-3 py-2 border-top"
        style={{ borderColor: 'var(--border)', background: 'var(--surface-1)' }}
      >
        <form onSubmit={handleSearchSubmit} className="position-relative">
          <Search
            size={15}
            className="position-absolute top-50 start-0 translate-middle-y ms-3 text-muted"
          />
          <input
            type="text"
            className="form-control nav-search-input"
            placeholder="Tìm kiếm sự kiện, nghệ sĩ, địa điểm..."
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
          />
        </form>
      </div>

      {/* Mobile Drawer */}
      {mobileOpen && (
        <div
          className="d-lg-none border-top"
          style={{
            background: 'var(--surface-1)',
            borderColor: 'var(--border)',
            boxShadow: 'var(--shadow-2)',
          }}
        >
          <div className="container py-3 d-flex flex-column gap-1">
            <div className="d-md-none mb-2">
              <label className="filter-group-label">Địa điểm</label>
              <select
                className="form-select form-select-sm"
                value={province}
                onChange={(e) => pickProvince(e.target.value)}
              >
                <option value="">{ALL_LOCATIONS}</option>
                {VIETNAM_PROVINCES.map((p) => (
                  <option key={p} value={p}>
                    {p}
                  </option>
                ))}
              </select>
            </div>

            {NAV_ITEMS.map(({ to, label, match }) => (
              <Link
                key={to}
                to={to}
                className={`nav-item-link${match(location.pathname) ? ' is-active' : ''}`}
              >
                {label}
              </Link>
            ))}
            <Link to="/for-organizers" className="nav-item-link">
              Bán vé cùng EventTicket
            </Link>

            {isAuthenticated ? (
              <>
                <hr className="divider my-2" />
                <Link to="/profile" className="nav-item-link d-flex align-items-center gap-2">
                  <User size={16} /> Quản lý tài khoản
                </Link>
                <Link
                  to="/cart"
                  className="nav-item-link d-flex align-items-center justify-content-between"
                >
                  <span className="d-flex align-items-center gap-2">
                    <ShoppingCart size={16} /> Giỏ hàng
                  </span>
                  {cartCount > 0 && (
                    <span className="badge bg-primary rounded-pill">{cartCount}</span>
                  )}
                </Link>
                <Link to="/my-tickets" className="nav-item-link d-flex align-items-center gap-2">
                  <Ticket size={16} /> Vé của tôi
                </Link>
                <button
                  type="button"
                  className="nav-item-link d-flex align-items-center gap-2 text-danger border-0 bg-transparent text-start w-100"
                  onClick={handleLogout}
                >
                  <LogOut size={16} /> Đăng xuất
                </button>
              </>
            ) : (
              <>
                <hr className="divider my-2" />
                <Link to="/login" className="nav-item-link">
                  Đăng nhập
                </Link>
                <Link to="/register" className="nav-item-link text-primary">
                  Đăng ký tài khoản
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
};

export default Navbar;
