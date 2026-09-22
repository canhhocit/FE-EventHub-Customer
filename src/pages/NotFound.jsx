import { Link } from 'react-router-dom';
import { Compass } from 'lucide-react';

const NotFound = () => (
  <div className="container py-5">
    <div
      className="panel p-5 text-center mx-auto animate-fade-up"
      style={{ maxWidth: 520 }}
    >
      <Compass size={40} className="text-muted mb-3" />
      <h1 className="h4 fw-bold mb-2">Không tìm thấy trang</h1>
      <p className="text-muted mb-4">
        Đường dẫn bạn truy cập không tồn tại hoặc đã được thay đổi.
      </p>
      <Link to="/" className="btn btn-accent px-4 py-2">
        Về trang chủ
      </Link>
    </div>
  </div>
);

export default NotFound;
