import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { useEffect } from 'react';

import Navbar from './components/Navbar';
import Footer from './components/Footer';
import QuickContact from './components/QuickContact';
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

/** The home page owns a full-bleed hero, so only the other pages get extra padding. */
const PageArea = ({ children }) => {
  const { pathname } = useLocation();
  const isFullBleed = pathname === '/';
  return (
    <main
      className="flex-grow-1"
      style={{ paddingTop: isFullBleed ? 'var(--nav-h)' : 'calc(var(--nav-h) + 16px)' }}
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
          <QuickContact />
        </div>
      </ToastProvider>
    </Router>
  );
}

export default App;
