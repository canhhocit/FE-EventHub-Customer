import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Ticket, LogOut, ShoppingCart, User } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';

const Navbar = () => {
  const { getCartCount } = useCart();
  const cartCount = getCartCount();
  const { token, user, logout } = useAuth();
  const navigate = useNavigate();
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const handleLogout = () => {
    logout();
    setDropdownOpen(false);
    navigate('/login');
  };

  return (
    <nav className="navbar navbar-expand-lg navbar-dark navbar-glass fixed-top">
      <div className="container">
        <Link className="navbar-brand fw-bold d-flex align-items-center gap-2" to="/">
          <span className="text-gradient fs-4">Event</span> Ticket
        </Link>
        <button 
          className="navbar-toggler border-0 shadow-none" 
          type="button" 
          data-bs-toggle="collapse" 
          data-bs-target="#navbarNav"
        >
          <span className="navbar-toggler-icon"></span>
        </button>
        <div className="collapse navbar-collapse" id="navbarNav">
          <ul className="navbar-nav ms-auto align-items-center gap-3">
            <li className="nav-item">
              <Link className="nav-link" to="/">Trang chủ</Link>
            </li>
            <li className="nav-item">
              <Link className="nav-link d-flex align-items-center gap-2" to="/my-tickets">
                <Ticket size={18} />
                Vé của tôi
              </Link>
            </li>
            <li className="nav-item me-2">
              <Link className="nav-link position-relative d-flex align-items-center" to="/cart">
                <ShoppingCart size={22} />
                {cartCount > 0 && (
                  <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger" style={{ fontSize: '0.65rem' }}>
                    {cartCount}
                  </span>
                )}
              </Link>
            </li>
            
            {!token ? (
              <li className="nav-item">
                <Link className="btn btn-gradient rounded-pill px-4" to="/login">
                  Đăng nhập
                </Link>
              </li>
            ) : (
              <li className="nav-item position-relative">
                <a 
                  className="nav-link d-flex align-items-center gap-2 cursor-pointer" 
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                >
                  <User size={18} />
                  {user?.fullName || 'Khách hàng'}
                </a>
                {dropdownOpen && (
                  <ul className="dropdown-menu dropdown-menu-end dropdown-menu-dark glass-card border-secondary show position-absolute" style={{ right: 0, top: '100%' }}>
                    <li><Link className="dropdown-item" to="/profile" onClick={() => setDropdownOpen(false)}>Hồ sơ của tôi</Link></li>
                    <li><hr className="dropdown-divider border-secondary" /></li>
                    <li>
                      <button className="dropdown-item text-danger d-flex align-items-center gap-2" onClick={handleLogout}>
                        <LogOut size={16} /> Đăng xuất
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
