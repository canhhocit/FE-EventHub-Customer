import { useState } from 'react';
import { Mail, Lock, CheckCircle, ArrowLeft, Loader2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { forgotPassword, resetPassword } from '../api/api';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const handleSendOtp = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const data = await forgotPassword(email);
      if (data.code === 1000) {
        setMessage('Mã OTP đã được gửi về email của bạn.');
        setStep(2);
      } else {
        setError(data.message || 'Có lỗi xảy ra.');
      }
    } catch (err) {
      setError(err.message || 'Lỗi kết nối server.');
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const data = await resetPassword({ email, otp, newPassword });
      if (data.code === 1000) {
        setMessage('Mật khẩu đã được cập nhật thành công!');
        setStep(3);
      } else {
        setError(data.message || 'Mã OTP không đúng hoặc đã hết hạn.');
      }
    } catch (err) {
      setError(err.message || 'Lỗi kết nối server.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container py-5">
      <div className="row justify-content-center">
        <div className="col-md-5">
          <div className="glass-card p-4 animate-fade-up">
            <Link to="/login" className="text-muted text-decoration-none small d-flex align-items-center mb-4">
              <ArrowLeft size={14} className="me-1"/> Quay lại đăng nhập
            </Link>
            
            <h3 className="fw-bold mb-4">Quên mật khẩu?</h3>
            
            {message && <div className="alert alert-success">{message}</div>}
            {error && <div className="alert alert-danger">{error}</div>}

            {step === 1 && (
              <form onSubmit={handleSendOtp}>
                <p className="text-muted small mb-4">Nhập email của bạn để nhận mã xác thực OTP đặt lại mật khẩu.</p>
                <div className="mb-4">
                  <label className="form-label text-muted small">Email</label>
                  <div className="input-group border border-secondary rounded overflow-hidden">
                    <span className="input-group-text bg-dark border-0"><Mail size={18} className="text-primary"/></span>
                    <input 
                      type="email" 
                      className="form-control bg-dark text-white border-0 shadow-none" 
                      placeholder="example@gmail.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                  </div>
                </div>
                <button type="submit" className="btn btn-gradient w-100 py-2 rounded-pill fw-bold" disabled={loading}>
                  {loading ? <Loader2 className="animate-spin mx-auto" size={20} /> : 'Gửi mã OTP'}
                </button>
              </form>
            )}

            {step === 2 && (
              <form onSubmit={handleResetPassword}>
                <p className="text-muted small mb-4">Nhập mã OTP đã nhận và mật khẩu mới của bạn.</p>
                <div className="mb-3">
                  <label className="form-label text-muted small">Mã OTP</label>
                  <input 
                    type="text" 
                    className="form-control bg-dark text-white border-secondary shadow-none" 
                    placeholder="Nhập 6 số"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                    required
                  />
                </div>
                <div className="mb-4">
                  <label className="form-label text-muted small">Mật khẩu mới</label>
                  <div className="input-group border border-secondary rounded overflow-hidden">
                    <span className="input-group-text bg-dark border-0"><Lock size={18} className="text-primary"/></span>
                    <input 
                      type="password" 
                      className="form-control bg-dark text-white border-0 shadow-none" 
                      placeholder="********"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      required
                    />
                  </div>
                </div>
                <button type="submit" className="btn btn-gradient w-100 py-2 rounded-pill fw-bold" disabled={loading}>
                  {loading ? <Loader2 className="animate-spin mx-auto" size={20} /> : 'Cập nhật mật khẩu'}
                </button>
              </form>
            )}

            {step === 3 && (
              <div className="text-center py-4">
                <CheckCircle size={60} className="text-success mb-3 animate-bounce"/>
                <p className="mb-4">Bạn có thể đăng nhập bằng mật khẩu mới ngay bây giờ.</p>
                <Link to="/login" className="btn btn-primary rounded-pill px-5">Đăng nhập</Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
