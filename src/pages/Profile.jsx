import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { User, Mail, Phone, MapPin, Save, ShieldCheck, Loader2 } from 'lucide-react';
import { getProfile, updateProfile } from '../api/api';

const Profile = () => {
  const { user: authUser, token } = useAuth();
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    address: ''
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', content: '' });

  useEffect(() => {
    const fetchUserData = async () => {
      if (authUser) {
        try {
          const data = await getProfile();
          if (data.code === 1000) {
            const u = data.result;
            setFormData({
              fullName: u.fullName || u.firstName + ' ' + u.lastName || '',
              email: u.email || '',
              phone: u.phone || '',
              address: u.address || ''
            });
          }
        } catch (error) {
          console.error("Fetch profile failed:", error);
        }
      }
    };
    fetchUserData();
  }, [authUser]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ type: '', content: '' });

    try {
      // Tận dụng updateProfile service
      const data = await updateProfile(authUser.username, formData);
      if (data.code === 1000) {
        setMessage({ type: 'success', content: 'Cập nhật thông tin thành công!' });
      } else {
        setMessage({ type: 'danger', content: data.message || 'Cập nhật thất bại' });
      }
    } catch (error) {
      setMessage({ type: 'danger', content: 'Lỗi kết nối máy chủ' });
    } finally {
      setLoading(false);
    }
  };

  if (!authUser) return <div className="container py-5 text-center">Đang tải...</div>;

  return (
    <div className="container py-5">
      <div className="row justify-content-center">
        <div className="col-lg-8 animate-fade-up">
          <div className="glass-card p-5">
            <div className="d-flex align-items-center gap-4 mb-5 pb-4 border-bottom border-secondary">
              <div className="avatar-large bg-gradient d-flex align-items-center justify-content-center text-white fs-1 fw-bold rounded-circle shadow-lg" style={{ width: '100px', height: '100px', background: 'linear-gradient(135deg, #6366f1 0%, #a855f7 100%)' }}>
                {formData.fullName ? formData.fullName.charAt(0) : authUser.username.charAt(0)}
              </div>
              <div>
                <h2 className="fw-bold mb-1">{formData.fullName || authUser.username}</h2>
                <div className="badge bg-primary-subtle text-primary rounded-pill px-3 py-2">
                  <ShieldCheck size={14} className="me-1" /> {authUser.roles?.[0]?.name || 'KHÁCH HÀNG'}
                </div>
              </div>
            </div>

            {message.content && (
              <div className={`alert alert-${message.type} alert-dismissible fade show rounded-4 mb-4`} role="alert">
                {message.content}
                <button type="button" className="btn-close" onClick={() => setMessage({ type: '', content: '' })}></button>
              </div>
            )}

            <form onSubmit={handleSubmit} className="row g-4">
              <div className="col-md-6">
                <label className="form-label text-muted small fw-bold text-uppercase">
                  <User size={14} className="me-1" /> Họ và Tên
                </label>
                <input 
                  type="text" 
                  name="fullName"
                  className="form-control bg-dark text-white border-secondary py-2" 
                  value={formData.fullName}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="col-md-6">
                <label className="form-label text-muted small fw-bold text-uppercase">
                  <Mail size={14} className="me-1" /> Email
                </label>
                <input 
                  type="email" 
                  name="email"
                  className="form-control bg-dark text-white border-secondary py-2" 
                  value={formData.email}
                  onChange={handleChange}
                  required
                  disabled
                  style={{opacity: 0.5, cursor: "not-allowed"}}
                />
              </div>
              <div className="col-md-6">
                <label className="form-label text-muted small fw-bold text-uppercase">
                  <Phone size={14} className="me-1" /> Số điện thoại
                </label>
                <input 
                  type="text" 
                  name="phone"
                  className="form-control bg-dark text-white border-secondary py-2" 
                  value={formData.phone}
                  onChange={handleChange}
                />
              </div>
              <div className="col-md-6">
                <label className="form-label text-muted small fw-bold text-uppercase">
                  <MapPin size={14} className="me-1" /> Địa chỉ
                </label>
                <input 
                  type="text" 
                  name="address"
                  className="form-control bg-dark text-white border-secondary py-2" 
                  value={formData.address}
                  onChange={handleChange}
                />
              </div>

              <div className="col-12 pt-4">
                <button type="submit" className="btn btn-gradient w-100 py-3 rounded-pill fw-bold shadow-lg d-flex align-items-center justify-content-center gap-2" disabled={loading}>
                  {loading ? (
                    <Loader2 className="spinner-border spinner-border-sm animate-spin" />
                  ) : (
                    <>
                      <Save size={18} /> LƯU THAY ĐỔI
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
