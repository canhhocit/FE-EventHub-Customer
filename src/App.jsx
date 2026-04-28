import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import EventDetail from './pages/EventDetail';
import Checkout from './pages/Checkout';
import MyTickets from './pages/MyTickets';
import Cart from './pages/Cart';
import Login from './pages/Login';
import Register from './pages/Register';
import Profile from './pages/Profile';
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
          </Routes>
        </main>
        
        <footer className="text-center py-4 mt-auto text-muted border-top border-secondary">
          <p className="mb-0">© 2026 FiveTickets</p>
        </footer>
      </div>
    </Router>
  );
}

export default App;
