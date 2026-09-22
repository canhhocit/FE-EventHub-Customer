import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Lock, User, Loader2, AlertCircle, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { login } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();
  const location = useLocation();

  // Come back to whatever page sent us here.
  const redirectTo = location.state?.from?.pathname || '/';

  const handleLogin = async (e) => {
    e.preventDefault();
    if (loading) return;
    setError('');
    setLoading(true);
    try {
      const profile = await login(username.trim(), password);
      toast?.success(`Xin chào ${profile?.fullName || profile?.username || ''}!`);
      navigate(redirectTo, { replace: true });
    } catch (err) {
      setError(err.message || 'Đăng nhập thất bại.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container py-5">
      <div className="mx-auto animate-fade-up" style={{ maxWidth: 420 }}>
        <div className="text-center mb-4">
          <h1 className="h3 fw-bold mb-2">Đăng nhập</h1>
          <p className="text-muted small mb-0">
            Truy cập vé điện tử và đơn hàng của bạn.
          </p>
        </div>

        <div className="panel p-4">
          {error && (
            <div className="alert alert-danger d-flex align-items-start gap-2 py-2 px-3">
              <AlertCircle size={17} className="flex-shrink-0 mt-1" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleLogin} noValidate>
            <div className="mb-3">
              <label className="form-label" htmlFor="login-username">
                Tên đăng nhập
              </label>
              <div className="field">
                <User size={16} />
                <input
                  id="login-username"
                  type="text"
                  className="form-control"
                  placeholder="Nhập tên đăng nhập"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  autoComplete="username"
                  required
                />
              </div>
            </div>

            <div className="mb-2">
              <label className="form-label" htmlFor="login-password">
                Mật khẩu
              </label>
              <div className="field">
                <Lock size={16} />
                <input
                  id="login-password"
                  type={showPassword ? 'text' : 'password'}
                  className="form-control"
                  style={{ paddingRight: 44 }}
                  placeholder="Nhập mật khẩu"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete="current-password"
                  required
                />
                <button
                  type="button"
                  className="btn border-0 p-0 position-absolute text-muted"
                  style={{ right: 12, top: '50%', transform: 'translateY(-50%)' }}
                  onClick={() => setShowPassword((v) => !v)}
                  aria-label={showPassword ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <div className="text-end mb-4">
              <Link to="/forgot-password" className="small text-muted hover-primary">
                Quên mật khẩu?
              </Link>
            </div>

            <button
              type="submit"
              className="btn btn-accent w-100 py-2 d-flex align-items-center justify-content-center gap-2"
              disabled={loading || !username.trim() || !password}
            >
              {loading && <Loader2 size={17} className="spin" />}
              {loading ? 'Đang đăng nhập…' : 'Đăng nhập'}
            </button>
          </form>
        </div>

        <p className="text-center text-muted small mt-4 mb-0">
          Chưa có tài khoản? <Link to="/register">Đăng ký ngay</Link>
        </p>
      </div>
    </div>
  );
};

export default Login;
