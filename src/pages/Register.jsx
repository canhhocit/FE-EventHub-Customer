import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Lock,
  User,
  Mail,
  Phone,
  MapPin,
  Loader2,
  AlertCircle,
  CheckCircle2,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const INITIAL = {
  username: '',
  fullName: '',
  email: '',
  phone: '',
  password: '',
  address: '',
};

/** Mirrors the backend's bean validation so users see problems before submitting. */
const validate = ({ username, fullName, email, phone, password }) => {
  const errors = {};
  if (username.trim().length < 3 || username.trim().length > 50)
    errors.username = 'Tên đăng nhập phải từ 3 đến 50 ký tự.';
  if (!fullName.trim()) errors.fullName = 'Vui lòng nhập họ và tên.';
  else if (fullName.trim().length > 50) errors.fullName = 'Họ tên tối đa 50 ký tự.';
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim()))
    errors.email = 'Email không hợp lệ.';
  if (phone && !/^[0-9]{10,11}$/.test(phone.trim()))
    errors.phone = 'Số điện thoại phải gồm 10–11 chữ số.';
  if (password.length < 6 || password.length > 50)
    errors.password = 'Mật khẩu phải từ 6 đến 50 ký tự.';
  return errors;
};

const Field = ({ label, icon: Icon, error, children, className = 'col-md-6' }) => (
  <div className={className}>
    <label className="form-label">{label}</label>
    <div className="field">
      <Icon size={16} />
      {children}
    </div>
    {error && (
      <div className="small mt-1" style={{ color: 'var(--danger)' }}>
        {error}
      </div>
    )}
  </div>
);

const Register = () => {
  const [formData, setFormData] = useState(INITIAL);
  const [fieldErrors, setFieldErrors] = useState({});
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const { register } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setFieldErrors((prev) => (prev[name] ? { ...prev, [name]: undefined } : prev));
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    if (loading) return;
    setError('');
    setSuccess('');

    const errors = validate(formData);
    if (Object.keys(errors).length) {
      setFieldErrors(errors);
      return;
    }

    setLoading(true);
    try {
      await register({
        ...formData,
        username: formData.username.trim(),
        fullName: formData.fullName.trim(),
        email: formData.email.trim(),
        phone: formData.phone.trim(),
        address: formData.address.trim(),
      });
      setSuccess(
        'Đăng ký thành công! Vui lòng kiểm tra email để xác thực tài khoản trước khi đăng nhập.',
      );
      setTimeout(() => navigate('/login'), 2500);
    } catch (err) {
      setError(err.message || 'Đăng ký thất bại.');
    } finally {
      setLoading(false);
    }
  };

  const inputProps = (name, placeholder, type = 'text') => ({
    type,
    name,
    className: 'form-control',
    placeholder,
    value: formData[name],
    onChange: handleChange,
  });

  return (
    <div className="container py-5">
      <div className="mx-auto animate-fade-up" style={{ maxWidth: 620 }}>
        <div className="text-center mb-4">
          <h1 className="h3 fw-bold mb-2">Tạo tài khoản</h1>
          <p className="text-muted small mb-0">
            Đăng ký để đặt vé và quản lý sự kiện bạn tham gia.
          </p>
        </div>

        <div className="panel p-4">
          {error && (
            <div className="alert alert-danger d-flex align-items-start gap-2 py-2 px-3">
              <AlertCircle size={17} className="flex-shrink-0 mt-1" />
              <span>{error}</span>
            </div>
          )}
          {success && (
            <div className="alert alert-success d-flex align-items-start gap-2 py-2 px-3">
              <CheckCircle2 size={17} className="flex-shrink-0 mt-1" />
              <span>{success}</span>
            </div>
          )}

          <form onSubmit={handleRegister} className="row g-3" noValidate>
            <Field label="Tên đăng nhập" icon={User} error={fieldErrors.username}>
              <input {...inputProps('username', 'vd: nguyenvana')} autoComplete="username" />
            </Field>

            <Field label="Họ và tên" icon={User} error={fieldErrors.fullName}>
              <input {...inputProps('fullName', 'Nguyễn Văn A')} autoComplete="name" />
            </Field>

            <Field
              label="Email"
              icon={Mail}
              error={fieldErrors.email}
              className="col-12"
            >
              <input
                {...inputProps('email', 'email@example.com', 'email')}
                autoComplete="email"
              />
            </Field>

            <Field label="Số điện thoại" icon={Phone} error={fieldErrors.phone}>
              <input
                {...inputProps('phone', '0912345678', 'tel')}
                autoComplete="tel"
                inputMode="numeric"
              />
            </Field>

            <Field label="Mật khẩu" icon={Lock} error={fieldErrors.password}>
              <input
                {...inputProps('password', 'Tối thiểu 6 ký tự', 'password')}
                autoComplete="new-password"
              />
            </Field>

            <Field
              label="Địa chỉ"
              icon={MapPin}
              error={fieldErrors.address}
              className="col-12"
            >
              <input {...inputProps('address', 'Số nhà, đường, phường/xã…')} />
            </Field>

            <div className="col-12 pt-2">
              <button
                type="submit"
                className="btn btn-accent w-100 py-2 d-flex align-items-center justify-content-center gap-2"
                disabled={loading || !!success}
              >
                {loading && <Loader2 size={17} className="spin" />}
                {loading ? 'Đang xử lý…' : 'Đăng ký'}
              </button>
            </div>
          </form>
        </div>

        <p className="text-center text-muted small mt-4 mb-0">
          Đã có tài khoản? <Link to="/login">Đăng nhập</Link>
        </p>
      </div>
    </div>
  );
};

export default Register;
