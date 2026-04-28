import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Lock, User, Mail, Phone, MapPin } from 'lucide-react';

const Register = () => {
  const [formData, setFormData] = useState({
    username: '', email: '', password: '', fullName: '', phone: '', address: ''
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);
    try {
      await register(formData);
      setSuccess('Đăng ký thành công! Đang chuyển hướng...');
      setTimeout(() => navigate('/login'), 2000);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container py-5 d-flex justify-content-center align-items-center animate-fade-up">
      <div className="glass-card p-5 w-100" style={{ maxWidth: '600px' }}>
        <h2 className="text-center fw-bold mb-4">Tạo Tài Khoản</h2>
        {error && <div className="alert alert-danger p-2 text-center">{error}</div>}
        {success && <div className="alert alert-success p-2 text-center">{success}</div>}
        
        <form onSubmit={handleRegister} className="row g-3">
          <div className="col-md-6 position-relative">
            <User size={18} className="position-absolute top-50 start-0 translate-middle-y ms-3 text-muted" />
            <input type="text" name="username" className="form-control bg-dark border-secondary text-white ps-5 py-2" placeholder="Tên đăng nhập" onChange={handleChange} required />
          </div>
          <div className="col-md-6 position-relative">
            <User size={18} className="position-absolute top-50 start-0 translate-middle-y ms-3 text-muted" />
            <input type="text" name="fullName" className="form-control bg-dark border-secondary text-white ps-5 py-2" placeholder="Họ và tên" onChange={handleChange} required />
          </div>
          <div className="col-md-12 position-relative">
            <Mail size={18} className="position-absolute top-50 start-0 translate-middle-y ms-3 text-muted" />
            <input type="email" name="email" className="form-control bg-dark border-secondary text-white ps-5 py-2" placeholder="Email" onChange={handleChange} required />
          </div>
          <div className="col-md-6 position-relative">
            <Phone size={18} className="position-absolute top-50 start-0 translate-middle-y ms-3 text-muted" />
            <input type="text" name="phone" className="form-control bg-dark border-secondary text-white ps-5 py-2" placeholder="Số điện thoại" onChange={handleChange} required />
          </div>
          <div className="col-md-6 position-relative">
            <Lock size={18} className="position-absolute top-50 start-0 translate-middle-y ms-3 text-muted" />
            <input type="password" name="password" className="form-control bg-dark border-secondary text-white ps-5 py-2" placeholder="Mật khẩu" onChange={handleChange} required />
          </div>
          <div className="col-md-12 position-relative mb-2">
            <MapPin size={18} className="position-absolute top-50 start-0 translate-middle-y ms-3 text-muted" />
            <input type="text" name="address" className="form-control bg-dark border-secondary text-white ps-5 py-2" placeholder="Địa chỉ" onChange={handleChange} required />
          </div>
          <div className="col-12 mt-4">
            <button type="submit" className="btn btn-gradient w-100 py-2 rounded-pill fs-5 shadow-lg" disabled={loading}>
              {loading ? <span className="spinner-border spinner-border-sm"></span> : 'Đăng ký ngay'}
            </button>
          </div>
        </form>
        <p className="text-center mt-4 mb-0 text-muted">
          Đã có tài khoản? <Link to="/login" className="text-primary text-decoration-none">Đăng nhập</Link>
        </p>
      </div>
    </div>
  );
};

export default Register;
