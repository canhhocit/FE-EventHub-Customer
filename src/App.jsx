import { BrowserRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom';
import { useEffect } from 'react';
import { Ticket } from 'lucide-react';

import Navbar from './components/Navbar';
import RequireAuth from './components/RequireAuth';
import { ToastProvider } from './context/ToastContext';

import Home from './pages/Home';
import EventDetail from './pages/EventDetail';
import Checkout from './pages/Checkout';
import MyTickets from './pages/MyTickets';
import Cart from './pages/Cart';
import Login from './pages/Login';
import Register from './pages/Register';
import Profile from './pages/Profile';
import ForgotPassword from './pages/ForgotPassword';
import PaymentSuccess from './pages/PaymentSuccess';
import PaymentCancel from './pages/PaymentCancel';
import NotFound from './pages/NotFound';

// Blog & support
import BlogList from './pages/BlogList';
import BlogDetail from './pages/BlogDetail';
import HelpPage from './pages/HelpPage';
import GuidePage from './pages/GuidePage';
import SecurityPage from './pages/SecurityPage';
import OrganizerHandbook from './pages/OrganizerHandbook';
import ForOrganizers from './pages/ForOrganizers';

import './index.css';

/** The home page owns a full-bleed hero, so only the other pages get padding. */
const PageArea = ({ children }) => {
  const { pathname } = useLocation();
  const isFullBleed = pathname === '/';
  return (
    <main
      className="flex-grow-1"
      style={{ paddingTop: isFullBleed ? 'var(--nav-h)' : 'calc(var(--nav-h) + 8px)' }}
    >
      {children}
    </main>
  );
};

const ScrollToTop = () => {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
};

const FOOTER_LINKS = [
  { to: '/', label: 'Trang chủ' },
  { to: '/blog', label: 'Tin tức' },
  { to: '/guide', label: 'Hướng dẫn mua vé' },
  { to: '/security', label: 'An toàn & Bảo mật' },
  { to: '/for-organizers', label: 'Dành cho ban tổ chức' },
  { to: '/help', label: 'Trợ giúp' },
];

const Footer = () => (
  <footer
    className="mt-auto border-top"
    style={{ borderColor: 'var(--border)', background: 'var(--bg-elevated)' }}
  >
    <div className="container py-4">
      <div className="row gy-3 align-items-center">
        <div className="col-md-5">
          <div className="d-flex align-items-center gap-2 mb-1">
            <span
              style={{
                width: 24,
                height: 24,
                background: 'var(--accent)',
                borderRadius: 6,
                display: 'grid',
                placeItems: 'center',
              }}
            >
              <Ticket size={14} color="#fff" />
            </span>
            <span className="fw-bold">EventTicket</span>
          </div>
          <p className="mb-0 small text-muted">
            Nền tảng đặt vé sự kiện và tin tức trực tuyến.
          </p>
        </div>
        <div className="col-md-7">
          <ul className="list-unstyled d-flex flex-wrap justify-content-md-end gap-3 mb-0 small">
            {FOOTER_LINKS.map(({ to, label }) => (
              <li key={to}>
                <Link to={to} className="text-muted text-decoration-none hover-primary">
                  {label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>
      <div
        className="pt-3 mt-3 border-top small text-muted"
        style={{ borderColor: 'var(--border)' }}
      >
        © {new Date().getFullYear()} FiveTickets Team.
      </div>
    </div>
  </footer>
);

function App() {
  return (
    <Router>
      <ToastProvider>
        <ScrollToTop />
        <div className="d-flex flex-column min-vh-100">
          <Navbar />
          <PageArea>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/events/:id" element={<EventDetail />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/forgot-password" element={<ForgotPassword />} />

              <Route
                path="/cart"
                element={
                  <RequireAuth>
                    <Cart />
                  </RequireAuth>
                }
              />
              <Route
                path="/checkout"
                element={
                  <RequireAuth>
                    <Checkout />
                  </RequireAuth>
                }
              />
              <Route
                path="/profile"
                element={
                  <RequireAuth>
                    <Profile />
                  </RequireAuth>
                }
              />
              <Route
                path="/my-tickets"
                element={
                  <RequireAuth>
                    <MyTickets />
                  </RequireAuth>
                }
              />

              <Route path="/payment/success" element={<PaymentSuccess />} />
              <Route path="/payment/cancel" element={<PaymentCancel />} />

              <Route path="/blog" element={<BlogList />} />
              <Route path="/blog/:slug" element={<BlogDetail />} />
              <Route path="/help" element={<HelpPage />} />
              <Route path="/guide" element={<GuidePage />} />
              <Route path="/security" element={<SecurityPage />} />
              <Route path="/organizer-handbook" element={<OrganizerHandbook />} />
              <Route path="/for-organizers" element={<ForOrganizers />} />

              <Route path="*" element={<NotFound />} />
            </Routes>
          </PageArea>
          <Footer />
        </div>
      </ToastProvider>
    </Router>
  );
}

export default App;
