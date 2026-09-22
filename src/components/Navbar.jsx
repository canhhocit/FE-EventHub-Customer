import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import {
  Ticket,
  LogOut,
  ShoppingCart,
  User,
  Newspaper,
  HelpCircle,
  Menu,
  X,
  Megaphone,
  ChevronDown,
} from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';

const NAV_LINKS = [
  { to: '/', label: 'Trang chủ', match: (p) => p === '/' },
  {
    to: '/blog',
    label: 'Tin tức',
    icon: Newspaper,
    match: (p) => p.startsWith('/blog'),
  },
  {
    to: '/help',
    label: 'Trợ giúp',
    icon: HelpCircle,
    match: (p) => ['/help', '/guide', '/security', '/organizer-handbook'].includes(p),
  },
];

const Navbar = () => {
  const { getCartCount } = useCart();
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [menuOpen, setMenuOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const menuRef = useRef(null);

  const cartCount = getCartCount();

  // Any navigation closes both menus — they used to stay stuck open.
  useEffect(() => {
    setMenuOpen(false);
    setMobileOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    if (!menuOpen) return undefined;
    const onDocClick = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setMenuOpen(false);
      }
    };
    const onEsc = (e) => e.key === 'Escape' && setMenuOpen(false);
    document.addEventListener('mousedown', onDocClick);
    document.addEventListener('keydown', onEsc);
    return () => {
      document.removeEventListener('mousedown', onDocClick);
      document.removeEventListener('keydown', onEsc);
    };
  }, [menuOpen]);

  const handleLogout = () => {
    logout();
    setMenuOpen(false);
    navigate('/');
  };

  const displayName = user?.fullName || user?.username || 'Tài khoản';

  return (
    <header className="app-nav fixed-top">
      <div className="container h-100 d-flex align-items-center gap-3">
        <Link
          to="/"
          className="d-flex align-items-center gap-2 fw-bold text-decoration-none flex-shrink-0"
          style={{ color: 'var(--text)' }}
        >
          <span
            className="d-grid place-items-center rounded"
            style={{
              width: 30,
              height: 30,
              background: 'var(--accent)',
              display: 'grid',
              placeItems: 'center',
            }}
          >
            <Ticket size={17} color="#fff" />
          </span>
          <span style={{ fontSize: '1.05rem', letterSpacing: '-0.02em' }}>
            EventTicket
          </span>
        </Link>

        {/* Primary links — desktop */}
        <nav className="d-none d-lg-flex align-items-center gap-1 ms-2">
          {NAV_LINKS.map(({ to, label, icon: Icon, match }) => (
            <Link
              key={to}
              to={to}
              className={`nav-item-link d-inline-flex align-items-center gap-2${
                match(location.pathname) ? ' is-active' : ''
              }`}
            >
              {Icon && <Icon size={15} />}
              {label}
            </Link>
          ))}
        </nav>

        <div className="ms-auto d-flex align-items-center gap-2">
          {/* Organizer entry point */}
          <Link
            to="/for-organizers"
            className="d-none d-md-inline-flex align-items-center gap-2 nav-item-link"
            style={{
              border: '1px solid var(--accent-line)',
              color: 'var(--accent)',
            }}
          >
            <Megaphone size={15} />
            Bạn là ban tổ chức?
          </Link>

          {isAuthenticated && (
            <>
              <Link
                to="/my-tickets"
                className="nav-item-link d-none d-sm-inline-flex align-items-center gap-2"
                title="Vé của tôi"
              >
                <Ticket size={16} />
                <span className="d-none d-xl-inline">Vé của tôi</span>
              </Link>

              <Link
                to="/cart"
                className="nav-item-link position-relative d-inline-flex"
                aria-label={`Giỏ hàng, ${cartCount} vé`}
              >
                <ShoppingCart size={18} />
                {cartCount > 0 && (
                  <span
                    className="position-absolute badge rounded-pill"
                    style={{
                      top: 1,
                      right: 1,
                      background: 'var(--accent)',
                      fontSize: '0.625rem',
                      padding: '2px 5px',
                    }}
                  >
                    {cartCount > 99 ? '99+' : cartCount}
                  </span>
                )}
              </Link>
            </>
          )}

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
                className="nav-item-link d-inline-flex align-items-center gap-2 border-0 bg-transparent"
                onClick={() => setMenuOpen((v) => !v)}
                aria-expanded={menuOpen}
                aria-haspopup="menu"
              >
                <span
                  className="rounded-circle d-grid flex-shrink-0"
                  style={{
                    width: 26,
                    height: 26,
                    background: 'var(--surface-3)',
                    placeItems: 'center',
                    fontSize: '0.75rem',
                    fontWeight: 700,
                    color: 'var(--text)',
                  }}
                >
                  {displayName.charAt(0).toUpperCase()}
                </span>
                <span className="d-none d-lg-inline text-truncate" style={{ maxWidth: 130 }}>
                  {displayName}
                </span>
                <ChevronDown size={14} />
              </button>

              {menuOpen && (
                <div className="menu-panel" role="menu">
                  <Link to="/profile" className="menu-item" role="menuitem">
                    <User size={16} /> Thông tin cá nhân
                  </Link>
                  <Link to="/my-tickets" className="menu-item" role="menuitem">
                    <Ticket size={16} /> Vé của tôi
                  </Link>
                  <hr className="divider my-1" />
                  <button
                    type="button"
                    className="menu-item"
                    style={{ color: 'var(--danger)' }}
                    onClick={handleLogout}
                    role="menuitem"
                  >
                    <LogOut size={16} /> Đăng xuất
                  </button>
                </div>
              )}
            </div>
          )}

          <button
            type="button"
            className="btn btn-ghost btn-sm d-lg-none px-2 py-2"
            onClick={() => setMobileOpen((v) => !v)}
            aria-expanded={mobileOpen}
            aria-label="Mở menu"
          >
            {mobileOpen ? <X size={18} /> : <Menu size={18} />}
          </button>
        </div>
      </div>

      {/* Mobile drawer */}
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
            {NAV_LINKS.map(({ to, label, icon: Icon, match }) => (
              <Link
                key={to}
                to={to}
                className={`nav-item-link d-flex align-items-center gap-2${
                  match(location.pathname) ? ' is-active' : ''
                }`}
              >
                {Icon && <Icon size={16} />}
                {label}
              </Link>
            ))}
            <Link
              to="/for-organizers"
              className="nav-item-link d-flex align-items-center gap-2"
              style={{ color: 'var(--accent)' }}
            >
              <Megaphone size={16} /> Bạn là ban tổ chức?
            </Link>
            {isAuthenticated && (
              <Link to="/my-tickets" className="nav-item-link d-flex align-items-center gap-2">
                <Ticket size={16} /> Vé của tôi
              </Link>
            )}
            {!isAuthenticated && (
              <Link to="/register" className="nav-item-link d-flex align-items-center gap-2">
                <User size={16} /> Đăng ký tài khoản
              </Link>
            )}
          </div>
        </div>
      )}
    </header>
  );
};

export default Navbar;
