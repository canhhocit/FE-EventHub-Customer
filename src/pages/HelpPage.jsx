import { Link } from 'react-router-dom';
import { HelpCircle, Ticket, ShieldCheck, Rocket, Mail, Phone, ChevronRight } from 'lucide-react';

const HelpPage = () => {
  const helpCategories = [
    {
      id: "ticket-guide",
      title: "Hành trình Mua & Soát vé",
      excerpt: "Mọi thứ bạn cần biết để sở hữu tấm vé sự kiện trong tầm tay và vào cửa thuận lợi với mã QR.",
      icon: <Ticket size={36} className="text-primary" />,
      link: "/guide"
    },
    {
      id: "security-tips",
      title: "An toàn & Bảo mật",
      excerpt: "Mẹo bảo vệ quyền sở hữu vé điện tử, cảnh báo lừa đảo vé chuyển nhượng và bảo mật tài khoản.",
      icon: <ShieldCheck size={36} className="text-danger" />,
      link: "/security"
    },
    {
      id: "organizer-handbook",
      title: "Cẩm nang Ban tổ chức",
      excerpt: "Quy trình đăng ký đối tác, khởi tạo sự kiện, mở bán vé và vận hành soát vé tại cửa.",
      icon: <Rocket size={36} className="text-success" />,
      link: "/organizer-handbook"
    }
  ];

  return (
    <div className="container py-4 animate-fade-up">
      {/* Header Banner */}
      <div className="text-center mb-5">
        <div className="d-inline-flex align-items-center gap-2 px-3 py-1 rounded-pill bg-primary bg-opacity-10 border border-primary border-opacity-25 text-primary mb-3 small fw-semibold">
          <HelpCircle size={16} /> Trung tâm trợ giúp
        </div>
        <h1 className="display-4 fw-bold mb-3">
          Chúng tôi có thể <span className="text-gradient">giúp gì cho bạn?</span>
        </h1>
        <p className="text-muted mx-auto" style={{ maxWidth: '600px' }}>
          Tra cứu nhanh các thông tin hướng dẫn mua vé, quy định bảo mật hoặc tìm hiểu cách tổ chức sự kiện chuyên nghiệp.
        </p>
      </div>

      {/* 3 Categories Cards */}
      <div className="row g-4 mb-5">
        {helpCategories.map((item) => (
          <div className="col-lg-4" key={item.id}>
            <div className="glass-card h-100 p-4 d-flex flex-column justify-content-between border border-secondary border-opacity-25">
              <div>
                <div className="p-3 rounded-4 d-inline-flex align-items-center justify-content-center bg-dark bg-opacity-50 border border-secondary border-opacity-25 mb-4">
                  {item.icon}
                </div>
                <h4 className="fw-bold text-white mb-3">{item.title}</h4>
                <p className="text-muted small mb-4 lh-base">{item.excerpt}</p>
              </div>

              <Link
                to={item.link}
                className="btn btn-outline-primary rounded-pill px-4 py-2 d-inline-flex align-items-center justify-content-between text-decoration-none fw-semibold small"
              >
                <span>Khám phá ngay</span>
                <ChevronRight size={16} />
              </Link>
            </div>
          </div>
        ))}
      </div>

      {/* Contact Support Section */}
      <div className="glass-card p-5 text-center border border-secondary border-opacity-25 shadow-lg my-5">
        <h3 className="fw-bold text-white mb-2">Vẫn chưa tìm thấy câu trả lời?</h3>
        <p className="text-muted mb-4 mx-auto" style={{ maxWidth: '520px' }}>
          Đội ngũ chăm sóc khách hàng của FiveTickets luôn sẵn sàng hỗ trợ bạn 24/7 qua email hoặc hotline.
        </p>
        <div className="d-flex flex-wrap justify-content-center gap-3">
          <a
            href="mailto:support@fivetickets.vn"
            className="btn btn-gradient rounded-pill px-4 py-2 d-inline-flex align-items-center gap-2 text-decoration-none"
          >
            <Mail size={16} /> support@fivetickets.vn
          </a>
          <a
            href="tel:19001234"
            className="btn btn-outline-light rounded-pill px-4 py-2 d-inline-flex align-items-center gap-2 text-decoration-none"
          >
            <Phone size={16} /> 1900 1234 (8:00 - 22:00)
          </a>
        </div>
      </div>
    </div>
  );
};

export default HelpPage;
