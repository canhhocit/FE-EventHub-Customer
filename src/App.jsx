import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import Navbar from './components/Navbar';
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

// Blog & Support Pages
import BlogList from './pages/BlogList';
import BlogDetail from './pages/BlogDetail';
import HelpPage from './pages/HelpPage';
import GuidePage from './pages/GuidePage';
import SecurityPage from './pages/SecurityPage';
import OrganizerHandbook from './pages/OrganizerHandbook';

import './index.css';

function App() {
  return (
    <Router>
      <div className="d-flex flex-column min-vh-100">
        <Navbar />
        <main className="flex-grow-1 pt-5 mt-4">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/events/:id" element={<EventDetail />} />
            <Route path="/cart" element={<Cart />} />
            <Route path="/checkout" element={<Checkout />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/my-tickets" element={<MyTickets />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/payment/success" element={<PaymentSuccess />} />
            <Route path="/payment/cancel" element={<PaymentCancel />} />

            {/* Blog & Support Routes */}
            <Route path="/blog" element={<BlogList />} />
            <Route path="/blog/:slug" element={<BlogDetail />} />
            <Route path="/help" element={<HelpPage />} />
            <Route path="/guide" element={<GuidePage />} />
            <Route path="/security" element={<SecurityPage />} />
            <Route path="/organizer-handbook" element={<OrganizerHandbook />} />
          </Routes>
        </main>

        <footer className="py-4 mt-auto border-top border-secondary border-opacity-25 bg-dark bg-opacity-75">
          <div className="container">
            <div className="row gy-3 align-items-center justify-content-between">
              <div className="col-md-4 text-center text-md-start">
                <span className="fw-bold text-gradient fs-5">Event Ticket</span>
                <p className="mb-0 small text-muted">Nền tảng đặt vé sự kiện & tin tức trực tuyến hàng đầu.</p>
              </div>
              <div className="col-md-8">
                <ul className="list-unstyled d-flex flex-wrap justify-content-center justify-content-md-end gap-3 gap-md-4 mb-0 small">
                  <li><Link to="/" className="text-muted text-decoration-none hover-primary">Trang chủ</Link></li>
                  <li><Link to="/blog" className="text-muted text-decoration-none hover-primary">Tin tức & Blog</Link></li>
                  <li><Link to="/guide" className="text-muted text-decoration-none hover-primary">Hướng dẫn mua vé</Link></li>
                  <li><Link to="/security" className="text-muted text-decoration-none hover-primary">An toàn & Bảo mật</Link></li>
                  <li><Link to="/organizer-handbook" className="text-muted text-decoration-none hover-primary">Cẩm nang BTC</Link></li>
                  <li><Link to="/help" className="text-muted text-decoration-none hover-primary">Trợ giúp</Link></li>
                </ul>
              </div>
            </div>
            <div className="text-center pt-3 mt-3 border-top border-secondary border-opacity-25">
              <p className="mb-0 small text-muted">© 2026 FiveTickets Team. All rights reserved.</p>
            </div>
          </div>
        </footer>
      </div>
    </Router>
  );
}

export default App;
