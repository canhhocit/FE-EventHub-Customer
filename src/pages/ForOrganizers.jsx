import { Link } from 'react-router-dom';
import {
  Megaphone,
  CalendarPlus,
  Ticket,
  BarChart3,
  QrCode,
  Wallet,
  ArrowRight,
  BookOpen,
  Mail,
} from 'lucide-react';
import { ORGANIZER_PORTAL_URL } from '../utils/constants';

const STEPS = [
  {
    icon: CalendarPlus,
    title: 'Tạo sự kiện',
    text: 'Khai báo thông tin, hình ảnh, địa điểm và thời gian diễn ra. Sự kiện được duyệt trước khi hiển thị công khai.',
  },
  {
    icon: Ticket,
    title: 'Thiết lập hạng vé',
    text: 'Tạo nhiều hạng vé với giá, số lượng và mô tả riêng. Đặt thời gian mở và đóng bán vé.',
  },
  {
    icon: Megaphone,
    title: 'Mở bán & truyền thông',
    text: 'Phát hành voucher giảm giá, đăng bài tin tức để tiếp cận khách hàng ngay trên nền tảng.',
  },
  {
    icon: QrCode,
    title: 'Soát vé tại cửa',
    text: 'Mỗi vé có mã QR riêng. Nhân sự của bạn quét mã để check-in nhanh và chống vé giả.',
  },
];

const BENEFITS = [
  {
    icon: Wallet,
    title: 'Thanh toán tự động',
    text: 'Khách hàng thanh toán qua VietQR/PayOS, hóa đơn điện tử gửi thẳng vào email.',
  },
  {
    icon: BarChart3,
    title: 'Báo cáo doanh thu',
    text: 'Theo dõi vé đã bán, doanh thu theo tháng và hiệu quả từng hạng vé.',
  },
  {
    icon: Ticket,
    title: 'Quản lý tồn kho vé',
    text: 'Số lượng vé còn lại cập nhật theo thời gian thực, tránh bán vượt.',
  },
];

const ForOrganizers = () => (
  <div className="container py-4">
    {/* Hero */}
    <section className="panel p-4 p-md-5 mb-4">
      <div className="row align-items-center g-4">
        <div className="col-lg-7">
          <span className="pill pill-soon d-inline-flex align-items-center gap-1 mb-3">
            <Megaphone size={12} /> Dành cho ban tổ chức
          </span>
          <h1 className="fw-bold mb-3" style={{ fontSize: 'clamp(1.6rem, 3.4vw, 2.25rem)' }}>
            Đăng sự kiện và mở bán vé tới hàng nghìn khách hàng
          </h1>
          <p className="text-muted mb-4">
            Tạo sự kiện, thiết lập hạng vé, mở bán và soát vé — tất cả trên một nền
            tảng. Bạn tập trung vào nội dung chương trình, phần bán vé để chúng tôi lo.
          </p>
          <div className="d-flex flex-wrap gap-2">
            {ORGANIZER_PORTAL_URL ? (
              <a
                href={ORGANIZER_PORTAL_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-accent px-4 py-2 d-inline-flex align-items-center gap-2"
              >
                Mở cổng ban tổ chức <ArrowRight size={16} />
              </a>
            ) : (
              <a
                href="mailto:btc@eventticket.vn?subject=Đăng ký trở thành ban tổ chức"
                className="btn btn-accent px-4 py-2 d-inline-flex align-items-center gap-2"
              >
                <Mail size={16} /> Đăng ký làm ban tổ chức
              </a>
            )}
            <Link
              to="/organizer-handbook"
              className="btn btn-ghost px-4 py-2 d-inline-flex align-items-center gap-2"
            >
              <BookOpen size={16} /> Xem cẩm nang
            </Link>
          </div>
        </div>

        <div className="col-lg-5">
          <div className="row g-2">
            {BENEFITS.map(({ icon: Icon, title, text }) => (
              <div className="col-12" key={title}>
                <div
                  className="d-flex align-items-start gap-3 p-3 rounded"
                  style={{
                    background: 'var(--surface-2)',
                    border: '1px solid var(--border)',
                  }}
                >
                  <Icon size={18} className="text-primary flex-shrink-0 mt-1" />
                  <div>
                    <div className="fw-semibold small">{title}</div>
                    <div className="text-muted" style={{ fontSize: '0.8125rem' }}>
                      {text}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>

    {/* Steps */}
    <section className="mb-4">
      <h2 className="section-title mb-3">Bắt đầu trong 4 bước</h2>
      <div className="row g-3 row-cols-1 row-cols-sm-2 row-cols-lg-4">
        {STEPS.map(({ icon: Icon, title, text }, index) => (
          <div className="col" key={title}>
            <div className="panel h-100 p-4">
              <div className="d-flex align-items-center gap-2 mb-3">
                <span
                  className="rounded place-items-center flex-shrink-0"
                  style={{
                    width: 32,
                    height: 32,
                    background: 'var(--accent-soft)',
                    border: '1px solid var(--accent-line)',
                  }}
                >
                  <Icon size={16} className="text-primary" />
                </span>
                <span className="section-eyebrow">Bước {index + 1}</span>
              </div>
              <h3 className="h6 fw-bold mb-2">{title}</h3>
              <p className="text-muted mb-0" style={{ fontSize: '0.8750rem', lineHeight: 1.6 }}>
                {text}
              </p>
            </div>
          </div>
        ))}
      </div>
    </section>

    {/* Contact */}
    <section className="panel p-4 p-md-5 text-center">
      <h2 className="h5 fw-bold mb-2">Cần tư vấn trước khi bắt đầu?</h2>
      <p className="text-muted mb-4">
        Đội ngũ hỗ trợ sẽ liên hệ để hướng dẫn quy trình đăng ký đối tác và duyệt sự kiện.
      </p>
      <div className="d-flex flex-wrap gap-2 justify-content-center">
        <a
          href="mailto:btc@eventticket.vn"
          className="btn btn-accent px-4 py-2 d-inline-flex align-items-center gap-2"
        >
          <Mail size={16} /> btc@eventticket.vn
        </a>
        <Link to="/help" className="btn btn-ghost px-4 py-2">
          Trung tâm trợ giúp
        </Link>
      </div>
    </section>
  </div>
);

export default ForOrganizers;
