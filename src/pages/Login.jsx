import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Lock, User } from 'lucide-react';

const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(username, password);
      navigate('/');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container py-5 d-flex justify-content-center align-items-center animate-fade-up">
      <div className="glass-card p-5 w-100" style={{ maxWidth: '450px' }}>
        <h2 className="text-center fw-bold mb-4">Đăng Nhập</h2>
        {error && <div className="alert alert-danger p-2 text-center">{error}</div>}
        
        <form onSubmit={handleLogin}>
          <div className="mb-3 position-relative">
            <User size={18} className="position-absolute top-50 start-0 translate-middle-y ms-3 text-muted" />
            <input 
              type="text" 
              className="form-control bg-dark border-secondary text-white ps-5 py-2" 
              placeholder="Tên đăng nhập" 
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
          </div>
          <div className="mb-4 position-relative">
            <Lock size={18} className="position-absolute top-50 start-0 translate-middle-y ms-3 text-muted" />
            <input 
              type="password" 
              className="form-control bg-dark border-secondary text-white ps-5 py-2" 
              placeholder="Mật khẩu" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <button type="submit" className="btn btn-gradient w-100 py-2 rounded-pill fs-5 shadow-lg mb-3" disabled={loading}>
            {loading ? <span className="spinner-border spinner-border-sm"></span> : 'Đăng nhập'}
          </button>

          <button
            type="button"
            className="btn btn-outline-info w-100 py-2 rounded-pill fw-semibold shadow-sm d-flex align-items-center justify-content-center gap-2"
            onClick={async () => {
              setLoading(true);
              try {
                await login("khachhang_demo", "123456");
                navigate('/');
              } catch (e) {
                setError(e.message);
              } finally {
                setLoading(false);
              }
            }}
            disabled={loading}
          >
            ⚡ Đăng nhập nhanh tài khoản Test (Chế độ Demo)
          </button>

          <div className="text-center mt-3">
            <Link to="/forgot-password" size={14} className="text-muted text-decoration-none small hover-primary">
              Quên mật khẩu?
            </Link>
          </div>
        </form>
        <p className="text-center mt-4 mb-0 text-muted">
          Chưa có tài khoản? <Link to="/register" className="text-primary text-decoration-none">Đăng ký ngay</Link>
        </p>
      </div>
    </div>
  );
};

export default Login;
