import { Link } from 'react-router-dom';
import { Search, ShoppingCart, CreditCard, QrCode, CheckCircle, AlertTriangle, Phone, ChevronLeft } from 'lucide-react';

const GuidePage = () => {
  const steps = [
    {
      id: 1,
      title: "Bước 1: Tìm kiếm & Lựa chọn sự kiện",
      desc: "Dạo quanh trang chủ, sử dụng thanh tìm kiếm theo tên hoặc bộ lọc theo danh mục (Âm nhạc, Thể thao, Hội thảo...) và tỉnh/thành phố để tìm sự kiện bạn yêu thích.",
      icon: <Search size={28} className="text-muted" />
    },
    {
      id: 2,
      title: "Bước 2: Chọn hạng vé & Số lượng",
      desc: "Xem chi tiết thông tin, quyền lợi từng hạng vé (Early Bird, Standard, VIP). Chọn số lượng vé mong muốn và thêm vào giỏ hàng.",
      icon: <ShoppingCart size={28} className="text-muted" />
    },
    {
      id: 3,
      title: "Bước 3: Thanh toán an toàn & Nhập Voucher",
      desc: "Áp dụng mã giảm giá (nếu có), lựa chọn phương thức thanh toán chuyển khoản quét mã QR hoặc thẻ ngân hàng và hoàn tất đặt hàng.",
      icon: <CreditCard size={28} className="text-muted" />
    },
    {
      id: 4,
      title: "Bước 4: Nhận vé điện tử (Mã QR E-Ticket)",
      desc: "Sau khi thanh toán thành công, vé điện tử có mã QR duy nhất sẽ hiển thị ngay tại mục 'Vé của tôi' trên website và được gửi xác nhận qua Email.",
      icon: <QrCode size={28} className="text-muted" />
    }
  ];

  return (
    <div className="container py-4 animate-fade-up">
      {/* Breadcrumb */}
      <nav aria-label="breadcrumb" className="mb-4">
        <ol className="breadcrumb small text-muted">
          <li className="breadcrumb-item">
            <Link to="/" className="text-muted text-decoration-none">Trang chủ</Link>
          </li>
          <li className="breadcrumb-item">
            <Link to="/help" className="text-muted text-decoration-none">Trợ giúp</Link>
          </li>
          <li className="breadcrumb-item active text-primary" aria-current="page">
            Hướng dẫn mua vé
          </li>
        </ol>
      </nav>

      {/* Header */}
      <div className="mb-5">
        <Link to="/help" className="text-muted text-decoration-none d-inline-flex align-items-center gap-1 mb-3 small fw-semibold">
          <ChevronLeft size={16} /> Quay lại trung tâm trợ giúp
        </Link>
        <h1 className="display-5 fw-bold text-white mb-3">
          Hướng dẫn mua vé & <span className="text-gradient">Soát vé chi tiết</span>
        </h1>
        <p className="text-muted">
          Quy trình 4 bước đơn giản để sở hữu vé sự kiện và trải nghiệm check-in mượt mà tại cổng vào.
        </p>
      </div>

      <div className="row g-5">
        {/* Main Content */}
        <div className="col-lg-8">
          <h3 className="fw-bold text-white mb-4">1. Quy trình mua vé trực tuyến</h3>
          
          <div className="d-flex flex-column gap-3 mb-5">
            {steps.map((s) => (
              <div key={s.id} className="glass-card p-4 d-flex gap-4 align-items-start border border-secondary border-opacity-25">
                <div className="p-3 rounded-4 bg-dark bg-opacity-60 border border-secondary border-opacity-25 flex-shrink-0">
                  {s.icon}
                </div>
                <div>
                  <h5 className="fw-bold text-white mb-2">{s.title}</h5>
                  <p className="text-muted small mb-0 lh-base">{s.desc}</p>
                </div>
              </div>
            ))}
          </div>

          <h3 className="fw-bold text-white mb-4">2. Hướng dẫn Check-in tại cổng sự kiện</h3>
          <div className="glass-card p-4 border border-secondary border-opacity-25 mb-5">
            <p className="text-muted small mb-4">
              Để không bỏ lỡ khoảnh khắc khai mạc, bạn vui lòng lưu ý những điều sau khi tới cổng soát vé:
            </p>
            <div className="d-flex flex-column gap-3">
              <div className="d-flex gap-3 align-items-center p-3 rounded-3 bg-dark bg-opacity-40 border border-secondary border-opacity-25">
                <CheckCircle size={20} className="text-muted flex-shrink-0" />
                <span className="small text-light">
                  <b>Mở sẵn mã QR:</b> Vào mục <b>"Vé của tôi"</b> trên website và chuẩn bị sẵn mã QR trước khi đến lượt.
                </span>
              </div>
              <div className="d-flex gap-3 align-items-center p-3 rounded-3 bg-dark bg-opacity-40 border border-secondary border-opacity-25">
                <CheckCircle size={20} className="text-muted flex-shrink-0" />
                <span className="small text-light">
                  <b>Độ sáng màn hình:</b> Tăng tối đa độ sáng điện thoại để máy quét quang học nhận diện mã QR tức thì.
                </span>
              </div>
              <div className="d-flex gap-3 align-items-center p-3 rounded-3 bg-dark bg-opacity-40 border border-secondary border-opacity-25">
                <CheckCircle size={20} className="text-muted flex-shrink-0" />
                <span className="small text-light">
                  <b>Nhận vòng tay/thẻ sự kiện:</b> Nhân viên soát vé sẽ quét mã và phát vòng tay check-in hợp lệ.
                </span>
              </div>
              <div className="d-flex gap-3 align-items-center p-3 rounded-3 bg-warning bg-opacity-10 border border-warning border-opacity-25">
                <AlertTriangle size={20} className="text-muted flex-shrink-0" />
                <span className="small text-warning">
                  <b>Lưu ý quan trọng:</b> Mỗi mã QR chỉ có giá trị cho 01 lượt vào cổng duy nhất.
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar Info */}
        <div className="col-lg-4">
          <div className="sticky-top" style={{ top: '6rem' }}>
            <div className="glass-card p-4 mb-4 border border-primary border-opacity-30">
              <h5 className="fw-bold text-white mb-3">Cần hỗ trợ thanh toán?</h5>
              <p className="small text-muted mb-4">
                Nếu bạn gặp sự cố trừ tiền hoặc không nhận được vé, hãy liên hệ ngay với đường dây nóng của chúng tôi:
              </p>
              <a href="tel:19001234" className="btn btn-gradient w-100 rounded-pill py-2 fw-bold d-flex align-items-center justify-content-center gap-2 text-decoration-none">
                <Phone size={16} /> Hotline: 1900 1234
              </a>
            </div>

            <div className="glass-card p-4 border border-secondary border-opacity-25">
              <h6 className="fw-bold text-white mb-2">Mẹo bảo vệ vé</h6>
              <p className="small text-muted mb-0">
                Tuyệt đối không gửi ảnh mã QR vé cho người lạ trên mạng xã hội trước khi sự kiện diễn ra.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GuidePage;
