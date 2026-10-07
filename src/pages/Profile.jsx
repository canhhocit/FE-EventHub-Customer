import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { User, Mail, Phone, MapPin, Save, ShieldCheck, Loader2 } from 'lucide-react';
import { updateProfile } from '../utils/api';
import { formatDate } from '../utils/constants';

const Profile = () => {
  const { user, refreshUser } = useAuth();
  const toast = useToast();

  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    address: '',
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  // Seed the form from the session's profile — no second request needed.
  useEffect(() => {
    if (!user) return;
    setFormData({
      fullName: user.fullName || '',
      email: user.email || '',
      phone: user.phone || '',
      address: user.address || '',
    });
  }, [user]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => (prev[name] ? { ...prev, [name]: undefined } : prev));
  };

  const validate = () => {
    const next = {};
    if (!formData.fullName.trim()) next.fullName = 'Vui lòng nhập họ và tên.';
    else if (formData.fullName.trim().length > 100)
      next.fullName = 'Họ tên tối đa 100 ký tự.';
    if (formData.phone && !/^[0-9]{10,11}$/.test(formData.phone.trim()))
      next.phone = 'Số điện thoại phải gồm 10–11 chữ số.';
    if (formData.address.length > 255) next.address = 'Địa chỉ tối đa 255 ký tự.';
    return next;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (loading || !user) return;

    const found = validate();
    if (Object.keys(found).length) {
      setErrors(found);
      return;
    }

    setLoading(true);
    try {
      const data = await updateProfile(user.username, {
        fullName: formData.fullName.trim(),
        phone: formData.phone.trim(),
        address: formData.address.trim(),
      });
      if (data?.code !== 1000) {
        throw new Error(data?.message || 'Cập nhật thất bại.');
      }
      await refreshUser().catch(() => {});
      toast?.success('Đã cập nhật thông tin cá nhân.');
    } catch (err) {
      toast?.error(err.message || 'Cập nhật thất bại.');
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return (
      <div className="container py-5 text-center text-muted">
        <Loader2 size={28} className="spin mb-3" />
        <p className="small mb-0">Đang tải thông tin…</p>
      </div>
    );
  }

  const roleName = user.roles?.[0]?.name || 'CUSTOMER';
  const initial = (formData.fullName || user.username || '?').charAt(0).toUpperCase();

  return (
    <div className="container py-4">
      <div className="mx-auto" style={{ maxWidth: 760 }}>
        <h1 className="h4 fw-bold mb-4">Thông tin cá nhân</h1>

        <div className="panel p-4 mb-4">
          <div className="d-flex align-items-center gap-3">
            <div
              className="rounded-circle flex-shrink-0 place-items-center fw-bold"
              style={{
                width: 60,
                height: 60,
                background: 'var(--surface-3)',
                fontSize: '1.5rem',
              }}
            >
              {initial}
            </div>
            <div className="min-w-0">
              <div className="fw-bold text-truncate">
                {formData.fullName || user.username}
              </div>
              <div className="text-muted small text-truncate">{user.email}</div>
              <div className="d-flex flex-wrap align-items-center gap-2 mt-2">
                <span className="pill pill-soon d-inline-flex align-items-center gap-1">
                  <ShieldCheck size={12} /> {roleName}
                </span>
                {user.createdAt && (
                  <span className="text-muted" style={{ fontSize: '0.75rem' }}>
                    Tham gia {formatDate(user.createdAt)}
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="panel p-4" noValidate>
          <div className="row g-3">
            <div className="col-md-6">
              <label className="form-label">Họ và tên</label>
              <div className="field">
                <User size={16} />
                <input
                  type="text"
                  name="fullName"
                  className="form-control"
                  value={formData.fullName}
                  onChange={handleChange}
                  required
                />
              </div>
              {errors.fullName && (
                <div className="small mt-1" style={{ color: 'var(--danger)' }}>
                  {errors.fullName}
                </div>
              )}
            </div>

            <div className="col-md-6">
              <label className="form-label">Email</label>
              <div className="field">
                <Mail size={16} />
                <input
                  type="email"
                  className="form-control"
                  value={formData.email}
                  disabled
                />
              </div>
              <div className="text-muted mt-1" style={{ fontSize: '0.75rem' }}>
                Email dùng để nhận vé, không thể thay đổi.
              </div>
            </div>

            <div className="col-md-6">
              <label className="form-label">Số điện thoại</label>
              <div className="field">
                <Phone size={16} />
                <input
                  type="tel"
                  name="phone"
                  className="form-control"
                  inputMode="numeric"
                  placeholder="0912345678"
                  value={formData.phone}
                  onChange={handleChange}
                />
              </div>
              {errors.phone && (
                <div className="small mt-1" style={{ color: 'var(--danger)' }}>
                  {errors.phone}
                </div>
              )}
            </div>

            <div className="col-md-6">
              <label className="form-label">Địa chỉ</label>
              <div className="field">
                <MapPin size={16} />
                <input
                  type="text"
                  name="address"
                  className="form-control"
                  value={formData.address}
                  onChange={handleChange}
                />
              </div>
              {errors.address && (
                <div className="small mt-1" style={{ color: 'var(--danger)' }}>
                  {errors.address}
                </div>
              )}
            </div>

            <div className="col-12 pt-2">
              <button
                type="submit"
                className="btn btn-accent px-4 py-2 d-inline-flex align-items-center gap-2"
                disabled={loading}
              >
                {loading ? <Loader2 size={16} className="spin" /> : <Save size={16} />}
                Lưu thay đổi
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Profile;
