import { useState, useEffect } from 'react';
import { User, Mail, Phone, MapPin, Save, Loader2, Calendar } from 'lucide-react';
import { getProfile, updateProfile } from '../api/api';

const Profile = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    dob: '',
    address: ''
  });

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const storedUser = JSON.parse(localStorage.getItem('user'));
        if (!storedUser) return;

        const data = await getProfile(storedUser.username);
        if (data.code === 1000) {
          setUser(data.result);
          setFormData({
            firstName: data.result.firstName || '',
            lastName: data.result.lastName || '',
            email: data.result.email || '',
            phone: data.result.phone || '',
            dob: data.result.dob || '',
            address: data.result.address || ''
          });
        }
      } catch (error) {
        console.error('Error fetching profile:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMessage({ type: '', text: '' });
    try {
      const data = await updateProfile(user.username, formData);
      if (data.code === 1000) {
        setMessage({ type: 'success', text: 'Cập nhật thông tin thành công!' });
        setUser(data.result);
      } else {
        setMessage({ type: 'danger', text: data.message || 'Cập nhật thất bại.' });
      }
    } catch (error) {
      setMessage({ type: 'danger', text: error.message || 'Lỗi kết nối server.' });
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="text-center py-5"><Loader2 className="animate-spin mx-auto text-primary" /></div>;

  return (
    <div className="container py-5">
      <div className="row justify-content-center">
        <div className="col-lg-8">
          <div className="glass-card p-4 p-md-5 animate-fade-up">
            <h2 className="fw-bold mb-4 d-flex align-items-center gap-3">
              <User size={32} className="text-primary" /> Thông tin cá nhân
            </h2>

            {message.text && (
              <div className={`alert alert-${message.type} alert-dismissible fade show`} role="alert">
                {message.text}
                <button type="button" className="btn-close" onClick={() => setMessage({type:'', text:''})}></button>
              </div>
            )}

            <form onSubmit={handleSubmit}>
              <div className="row g-4">
                <div className="col-md-6">
                  <label className="form-label text-muted small">Họ</label>
                  <input 
                    type="text" 
                    className="form-control bg-dark text-white border-secondary"
                    value={formData.firstName}
                    onChange={(e) => setFormData({...formData, firstName: e.target.value})}
                  />
                </div>
                <div className="col-md-6">
                  <label className="form-label text-muted small">Tên</label>
                  <input 
                    type="text" 
                    className="form-control bg-dark text-white border-secondary"
                    value={formData.lastName}
                    onChange={(e) => setFormData({...formData, lastName: e.target.value})}
                  />
                </div>
                <div className="col-md-12">
                  <label className="form-label text-muted small">Email</label>
                  <div className="input-group">
                    <span className="input-group-text bg-dark border-secondary"><Mail size={16} className="text-primary"/></span>
                    <input type="email" className="form-control bg-dark text-white border-secondary" value={formData.email} disabled />
                  </div>
                </div>
                <div className="col-md-6">
                  <label className="form-label text-muted small">Số điện thoại</label>
                  <div className="input-group">
                    <span className="input-group-text bg-dark border-secondary"><Phone size={16} className="text-primary"/></span>
                    <input 
                      type="text" 
                      className="form-control bg-dark text-white border-secondary"
                      value={formData.phone}
                      onChange={(e) => setFormData({...formData, phone: e.target.value})}
                    />
                  </div>
                </div>
                <div className="col-md-6">
                  <label className="form-label text-muted small">Ngày sinh</label>
                  <div className="input-group">
                    <span className="input-group-text bg-dark border-secondary"><Calendar size={16} className="text-primary"/></span>
                    <input 
                      type="date" 
                      className="form-control bg-dark text-white border-secondary"
                      value={formData.dob}
                      onChange={(e) => setFormData({...formData, dob: e.target.value})}
                    />
                  </div>
                </div>
                <div className="col-md-12">
                  <label className="form-label text-muted small">Địa chỉ</label>
                  <div className="input-group">
                    <span className="input-group-text bg-dark border-secondary"><MapPin size={16} className="text-primary"/></span>
                    <input 
                      type="text" 
                      className="form-control bg-dark text-white border-secondary"
                      value={formData.address}
                      onChange={(e) => setFormData({...formData, address: e.target.value})}
                    />
                  </div>
                </div>
              </div>

              <div className="mt-5">
                <button type="submit" className="btn btn-gradient px-5 py-2 rounded-pill fw-bold" disabled={saving}>
                  {saving ? <Loader2 size={20} className="animate-spin me-2" /> : <Save size={20} className="me-2" />}
                  Lưu thay đổi
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
