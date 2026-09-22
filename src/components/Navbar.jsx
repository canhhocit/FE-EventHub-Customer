import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Ticket, LogOut, ShoppingCart, User, Newspaper, HelpCircle } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';

const Navbar = () => {
  const { getCartCount } = useCart();
  const cartCount = getCartCount();

  const { token, user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [dropdownOpen, setDropdownOpen] = useState(false);

  const isLoggedIn = !!token; // kiểm tra đăng nhập

  const handleLogout = () => {
    logout();
    setDropdownOpen(false);
    navigate('/login');
  };

  return (
    <nav className="navbar navbar-expand-lg navbar-dark navbar-glass fixed-top">
      <div className="container">
        {/* Logo */}
        <Link
          className="navbar-brand fw-bold d-flex align-items-center gap-2"
          to="/"
        >
          <span className="text-gradient fs-4">Event</span> Ticket
        </Link>

        {/* Mobile button */}
        <button
          className="navbar-toggler border-0 shadow-none"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#navbarNav"
        >
          <span className="navbar-toggler-icon"></span>
        </button>

        {/* Menu */}
        <div className="collapse navbar-collapse" id="navbarNav">
          <ul className="navbar-nav ms-auto align-items-center gap-3">
            {/* home */}
            <li className="nav-item">
              <Link
                className={`nav-link ${location.pathname === '/' ? 'active text-primary fw-bold' : ''}`}
                to="/"
              >
                Trang chủ
              </Link>
            </li>

            {/* blog */}
            <li className="nav-item">
              <Link
                className={`nav-link d-flex align-items-center gap-1 ${location.pathname.startsWith('/blog') ? 'active text-primary fw-bold' : ''}`}
                to="/blog"
              >
                <Newspaper size={16} />
                Tin tức & Blog
              </Link>
            </li>

            {/* help */}
            <li className="nav-item">
              <Link
                className={`nav-link d-flex align-items-center gap-1 ${['/help', '/guide', '/security', '/organizer-handbook'].includes(location.pathname) ? 'active text-primary fw-bold' : ''}`}
                to="/help"
              >
                <HelpCircle size={16} />
                Trợ giúp
              </Link>
            </li>
            {/* show khi đã login */}
            {isLoggedIn && (
              <>
                {/* my tickets */}
                <li className="nav-item">
                  <Link
                    className="nav-link d-flex align-items-center gap-2"
                    to="/my-tickets"
                  >
                    <Ticket size={18} />
                    Vé của tôi
                  </Link>
                </li>

                {/* cart */}
                <li className="nav-item me-2">
                  <Link
                    className="nav-link position-relative d-flex align-items-center"
                    to="/cart"
                  >
                    <ShoppingCart size={22} />

                    {cartCount > 0 && (
                      <span
                        className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger"
                        style={{ fontSize: '0.65rem' }}
                      >
                        {cartCount}
                      </span>
                    )}
                  </Link>
                </li>
              </>
            )}
            {/* chưa login */}
            {!isLoggedIn ? (
              <li className="nav-item">
                <Link
                  className="btn btn-gradient rounded-pill px-4"
                  to="/login"
                >
                  Đăng nhập
                </Link>
              </li>
            ) : (
              /* đã login */
              <li className="nav-item position-relative">
                <button
                  type="button"
                  className="nav-link border-0 bg-transparent d-flex align-items-center gap-2"
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                >
                  <User size={18} />
                  {user?.fullName || 'Khách hàng'}
                </button>

                {dropdownOpen && (
                  <ul
                    className="dropdown-menu dropdown-menu-end dropdown-menu-dark glass-card border-secondary show position-absolute"
                    style={{ right: 0, top: '100%' }}
                  >
                    <li>
                      <Link
                        className="dropdown-item"
                        to="/profile"
                        onClick={() => setDropdownOpen(false)}
                      >
                        Thông tin cá nhân
                      </Link>
                    </li>

                    <li>
                      <hr className="dropdown-divider border-secondary" />
                    </li>

                    <li>
                      <button
                        className="dropdown-item text-danger d-flex align-items-center gap-2"
                        onClick={handleLogout}
                      >
                        <LogOut size={16} />
                        Đăng xuất
                      </button>
                    </li>
                  </ul>
                )}
              </li>
            )}

          </ul>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;