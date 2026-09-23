import { Link } from 'react-router-dom';
import { Ticket } from 'lucide-react';

const FOOTER_NAV = [
  { to: '/', label: 'Trang chủ' },
  { to: '/blog', label: 'Tin tức & Cẩm nang' },
  { to: '/guide', label: 'Hướng dẫn mua vé' },
  { to: '/security', label: 'An toàn & Bảo mật' },
  { to: '/for-organizers', label: 'Dành cho ban tổ chức' },
  { to: '/help', label: 'Trung tâm trợ giúp' },
];

const Footer = () => {
  return (
    <footer
      className="mt-auto border-top"
      style={{ borderColor: 'var(--border)', background: 'var(--bg-elevated)' }}
    >
      <div className="container py-5">
        <div className="row g-4 justify-content-between">
          {/* Cột 1: Thông tin thương hiệu & Công ty */}
          <div className="col-12 col-lg-5">
            <div className="d-flex align-items-center gap-2 mb-3">
              <span
                style={{
                  width: 28,
                  height: 28,
                  background: 'var(--accent)',
                  borderRadius: 'var(--r-sm)',
                  display: 'grid',
                  placeItems: 'center',
                }}
              >
                <Ticket size={16} color="#fff" />
              </span>
              <span className="fw-bold fs-5 tracking-tight">EventTicket</span>
            </div>
            <p className="text-muted small mb-3 lh-base">
              Nền tảng công nghệ phân phối và quản lý vé sự kiện hàng đầu. Đặt vé an toàn, nhanh chóng, minh bạch và tiện lợi.
            </p>
            <div className="small text-muted d-flex flex-column gap-2 mb-3">
              <div>Trụ sở chính: Tầng 12, Tòa nhà Landmark Tower, Đường Cầu Giấy, Hà Nội</div>
              <div>Hotline: <strong>1900 6868</strong> (8:00 - 22:00 hàng ngày)</div>
              <div>Email hỗ trợ: support@eventticket.vn</div>
            </div>
          </div>

          {/* Cột 2: Điều hướng nhanh */}
          <div className="col-6 col-sm-6 col-lg-3">
            <h6 className="fw-bold mb-3 small text-uppercase" style={{ letterSpacing: '0.05em' }}>
              Liên kết nhanh
            </h6>
            <ul className="list-unstyled d-flex flex-column gap-2 mb-0 small">
              {FOOTER_NAV.map(({ to, label }) => (
                <li key={to}>
                  <Link to={to} className="text-muted text-decoration-none hover-primary">
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Cột 3: Thanh toán */}
          <div className="col-12 col-sm-6 col-lg-4">
            <h6 className="fw-bold mb-3 small text-uppercase" style={{ letterSpacing: '0.05em' }}>
              Thanh toán
            </h6>
            <p className="text-muted small mb-2">
              Chấp nhận thanh toán qua thẻ nội địa Napas, thẻ quốc tế Visa, Mastercard và ví điện tử VNPay, MoMo.
            </p>
            <div className="small text-muted" style={{ fontSize: '0.78rem' }}>
              GPKD số: 0108999999 do Sở Kế hoạch và Đầu tư TP. Hà Nội cấp lần đầu ngày 15/03/2021.
            </div>
          </div>
        </div>

        {/* Dòng bản quyền & Made with love */}
        <div
          className="pt-4 mt-4 border-top d-flex flex-wrap justify-content-between align-items-center gap-2 small text-muted"
          style={{ borderColor: 'var(--border)' }}
        >
          <div>
            FiveTickets Team — đem âm nhạc và sự kiện đến từng góc phố.
          </div>
          <div>
            © {new Date().getFullYear()} EventTicket Inc. Tất cả quyền được bảo lưu.
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;

