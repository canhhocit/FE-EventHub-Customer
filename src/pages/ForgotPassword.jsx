import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, ShieldCheck, ArrowLeft } from 'lucide-react';

const ForgotPassword = () => {
  const [step, setStep] = useState(1); // 1: Email, 2: Reset
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  const navigate = useNavigate();

  const handleRequestOtp = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');
    setLoading(true);
    try {
      const response = await fetch('http://localhost:8080/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });
      const data = await response.json();
      if (data.code === 1000) {
        setMessage('Mã OTP đã được gửi về email của bạn.');
        setStep(2);
      } else {
        setError(data.message || 'Lỗi khi gửi yêu cầu.');
      }
    } catch (err) {
      setError('Lỗi kết nối máy chủ.');
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');

    if (newPassword !== confirmPassword) {
      setError('Mật khẩu xác nhận không khớp.');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('http://localhost:8080/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, otp, newPassword })
      });
      const data = await response.json();
      if (data.code === 1000) {
        setMessage('Đổi mật khẩu thành công! Đang chuyển hướng...');
        setTimeout(() => navigate('/login'), 2000);
      } else {
        setError(data.message || 'Lỗi khi đặt lại mật khẩu.');
      }
    } catch (err) {
      setError('Lỗi kết nối máy chủ.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container py-5 d-flex justify-content-center align-items-center animate-fade-up">
      <div className="glass-card p-5 w-100" style={{ maxWidth: '450px' }}>
        <div className="mb-4">
           <Link to="/login" className="text-muted text-decoration-none small d-flex align-items-center gap-1 hover-primary mb-3">
             <ArrowLeft size={14} /> Quay lại đăng nhập
           </Link>
           <h2 className="fw-bold mb-1">Quên mật khẩu?</h2>
           <p className="text-muted small">
             {step === 1 ? 'Nhập email để nhận mã khôi phục mật khẩu.' : 'Nhập mã OTP và mật khẩu mới của bạn.'}
           </p>
        </div>

        {error && <div className="alert alert-danger p-2 text-center small">{error}</div>}
        {message && <div className="alert alert-success p-2 text-center small">{message}</div>}

        {step === 1 ? (
          <form onSubmit={handleRequestOtp}>
            <div className="mb-4 position-relative">
              <Mail size={18} className="position-absolute top-50 start-0 translate-middle-y ms-3 text-muted" />
              <input 
                type="email" 
                className="form-control bg-dark border-secondary text-white ps-5 py-2" 
                placeholder="Email cá nhân" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <button type="submit" className="btn btn-gradient w-100 py-2 rounded-pill fs-5 shadow-lg" disabled={loading}>
              {loading ? <span className="spinner-border spinner-border-sm"></span> : 'Gửi mã OTP'}
            </button>
          </form>
        ) : (
          <form onSubmit={handleResetPassword}>
            <div className="mb-3 position-relative">
              <ShieldCheck size={18} className="position-absolute top-50 start-0 translate-middle-y ms-3 text-muted" />
              <input 
                type="text" 
                className="form-control bg-dark border-secondary text-white ps-5 py-2" 
                placeholder="Mã OTP" 
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                required
              />
            </div>
            <div className="mb-3 position-relative">
              <Lock size={18} className="position-absolute top-50 start-0 translate-middle-y ms-3 text-muted" />
              <input 
                type="password" 
                className="form-control bg-dark border-secondary text-white ps-5 py-2" 
                placeholder="Mật khẩu mới" 
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
              />
            </div>
            <div className="mb-4 position-relative">
              <Lock size={18} className="position-absolute top-50 start-0 translate-middle-y ms-3 text-muted" />
              <input 
                type="password" 
                className="form-control bg-dark border-secondary text-white ps-5 py-2" 
                placeholder="Xác nhận mật khẩu mới" 
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
              />
            </div>
            <button type="submit" className="btn btn-gradient w-100 py-2 rounded-pill fs-5 shadow-lg" disabled={loading}>
              {loading ? <span className="spinner-border spinner-border-sm"></span> : 'Đặt lại mật khẩu'}
            </button>
            <div className="text-center mt-3">
              <button type="button" className="btn btn-link text-muted small text-decoration-none" onClick={() => setStep(1)}>
                Gửi lại mã OTP khác?
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default ForgotPassword;
