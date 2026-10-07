import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Mail,
  Lock,
  KeyRound,
  CheckCircle2,
  ChevronLeft,
  Loader2,
  AlertCircle,
} from 'lucide-react';
import { forgotPassword, resetPassword } from '../utils/api';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const run = async (fn) => {
    if (loading) return;
    setError('');
    setLoading(true);
    try {
      await fn();
    } catch (err) {
      setError(err.message || 'Đã có lỗi xảy ra.');
    } finally {
      setLoading(false);
    }
  };

  const handleSendOtp = (e) => {
    e.preventDefault();
    run(async () => {
      const data = await forgotPassword(email.trim());
      if (data?.code !== 1000) throw new Error(data?.message || 'Không gửi được mã OTP.');
      setMessage('Mã OTP đã được gửi tới email của bạn. Mã có hiệu lực trong ít phút.');
      setStep(2);
    });
  };

  const handleReset = (e) => {
    e.preventDefault();
    if (newPassword.length < 6) {
      setError('Mật khẩu mới phải có ít nhất 6 ký tự.');
      return;
    }
    run(async () => {
      const data = await resetPassword({
        email: email.trim(),
        otp: otp.trim(),
        newPassword,
      });
      if (data?.code !== 1000)
        throw new Error(data?.message || 'Mã OTP không đúng hoặc đã hết hạn.');
      setMessage('');
      setStep(3);
    });
  };

  return (
    <div className="container py-5">
      <div className="mx-auto animate-fade-up" style={{ maxWidth: 420 }}>
        <Link
          to="/login"
          className="d-inline-flex align-items-center gap-1 small text-muted hover-primary mb-3"
        >
          <ChevronLeft size={15} /> Quay lại đăng nhập
        </Link>

        <div className="panel p-4">
          {step === 3 ? (
            <div className="text-center py-3">
              <CheckCircle2 size={40} className="mb-3" style={{ color: 'var(--success)' }} />
              <h1 className="h5 fw-bold mb-2">Đổi mật khẩu thành công</h1>
              <p className="text-muted small mb-4">
                Bạn có thể đăng nhập bằng mật khẩu mới ngay bây giờ.
              </p>
              <button
                className="btn btn-accent px-4 py-2"
                onClick={() => navigate('/login')}
              >
                Đăng nhập
              </button>
            </div>
          ) : (
            <>
              <h1 className="h5 fw-bold mb-1">Quên mật khẩu</h1>
              <p className="text-muted small mb-4">
                {step === 1
                  ? 'Nhập email đã đăng ký để nhận mã xác thực.'
                  : 'Nhập mã OTP trong email và mật khẩu mới.'}
              </p>

              {message && (
                <div className="alert alert-success py-2 px-3">{message}</div>
              )}
              {error && (
                <div className="alert alert-danger d-flex align-items-start gap-2 py-2 px-3">
                  <AlertCircle size={16} className="flex-shrink-0 mt-1" />
                  <span>{error}</span>
                </div>
              )}

              {step === 1 ? (
                <form onSubmit={handleSendOtp} noValidate>
                  <label className="form-label">Email</label>
                  <div className="field mb-4">
                    <Mail size={16} />
                    <input
                      type="email"
                      className="form-control"
                      placeholder="email@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      autoComplete="email"
                      required
                    />
                  </div>
                  <button
                    type="submit"
                    className="btn btn-accent w-100 py-2 d-flex align-items-center justify-content-center gap-2"
                    disabled={loading || !email.trim()}
                  >
                    {loading && <Loader2 size={16} className="spin" />}
                    Gửi mã OTP
                  </button>
                </form>
              ) : (
                <form onSubmit={handleReset} noValidate>
                  <label className="form-label">Mã OTP</label>
                  <div className="field mb-3">
                    <KeyRound size={16} />
                    <input
                      type="text"
                      className="form-control"
                      placeholder="Nhập mã 6 số"
                      value={otp}
                      onChange={(e) => setOtp(e.target.value)}
                      inputMode="numeric"
                      required
                    />
                  </div>

                  <label className="form-label">Mật khẩu mới</label>
                  <div className="field mb-4">
                    <Lock size={16} />
                    <input
                      type="password"
                      className="form-control"
                      placeholder="Tối thiểu 6 ký tự"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      autoComplete="new-password"
                      required
                    />
                  </div>

                  <button
                    type="submit"
                    className="btn btn-accent w-100 py-2 d-flex align-items-center justify-content-center gap-2"
                    disabled={loading || !otp.trim() || !newPassword}
                  >
                    {loading && <Loader2 size={16} className="spin" />}
                    Đặt lại mật khẩu
                  </button>

                  <button
                    type="button"
                    className="btn btn-ghost w-100 py-2 mt-2"
                    onClick={() => {
                      setStep(1);
                      setError('');
                      setMessage('');
                    }}
                    disabled={loading}
                  >
                    Gửi lại mã khác
                  </button>
                </form>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
