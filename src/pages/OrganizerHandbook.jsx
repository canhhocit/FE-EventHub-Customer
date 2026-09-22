import React from 'react';
import { Link } from 'react-router-dom';
import { Rocket, FileText, DollarSign, QrCode, ArrowRight, ChevronLeft, Award } from 'lucide-react';

const OrganizerHandbook = () => {
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
          <li className="breadcrumb-item active text-success" aria-current="page">
            Cẩm nang Ban tổ chức
          </li>
        </ol>
      </nav>

      {/* Header */}
      <div className="mb-5">
        <Link to="/help" className="text-muted text-decoration-none d-inline-flex align-items-center gap-1 mb-3 small fw-semibold">
          <ChevronLeft size={16} /> Quay lại trung tâm trợ giúp
        </Link>
        <h1 className="display-5 fw-bold text-white mb-3">
          Cẩm nang dành cho <span className="text-gradient">Ban Tổ Chức Sự Kiện 🚀</span>
        </h1>
        <p className="text-muted">
          Hướng dẫn toàn diện quy trình phát hành vé, quản lý chiến dịch marketing và vận hành check-in sự kiện đỉnh cao.
        </p>
      </div>

      <div className="row g-5">
        <div className="col-lg-8">
          <div className="d-flex flex-column gap-5">
            {/* Step 1 */}
            <div>
              <h3 className="fw-bold text-white mb-3 d-flex align-items-center gap-2">
                <FileText className="text-primary" size={24} /> 1. Khởi tạo & Đăng ký sự kiện
              </h3>
              <p className="text-muted lh-base">
                Ban tổ chức đăng nhập vào cổng quản trị chuyên dụng (Manager Portal), điền đầy đủ hồ sơ tổ chức và gửi yêu cầu kiểm duyệt sự kiện.
              </p>
              <div className="row g-3 my-2">
                <div className="col-md-6">
                  <div className="glass-card p-3 border border-secondary border-opacity-25 h-100">
                    <h6 className="fw-bold text-white mb-2">Hình ảnh & Mô tả chuẩn SEO</h6>
                    <p className="small text-muted mb-0">Chuẩn bị banner ngang 16:9 sắc nét, mô tả chi tiết lịch trình, diễn giả và quyền lợi người tham dự.</p>
                  </div>
                </div>
                <div className="col-md-6">
                  <div className="glass-card p-3 border border-secondary border-opacity-25 h-100">
                    <h6 className="fw-bold text-white mb-2">Đa dạng phân hạng vé</h6>
                    <p className="small text-muted mb-0">Hỗ trợ linh hoạt: Vé Early Bird, Vé Tiêu Chuẩn, Vé VIP kèm mã giảm giá Voucher riêng biệt.</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Step 2 */}
            <div>
              <h3 className="fw-bold text-white mb-3 d-flex align-items-center gap-2">
                <DollarSign className="text-success" size={24} /> 2. Quản lý Doanh thu & Báo cáo Realtime
              </h3>
              <p className="text-muted lh-base">
                Hệ thống cung cấp dashboard biểu đồ phân tích trực quan: số lượng vé đã bán, tỉ lệ lấp đầy ghế, doanh thu theo từng ngày và báo cáo thanh toán minh bạch, đối soát tự động.
              </p>
            </div>

            {/* Step 3 */}
            <div>
              <h3 className="fw-bold text-white mb-3 d-flex align-items-center gap-2">
                <QrCode className="text-info" size={24} /> 3. Công cụ Soát vé Tốc độ cao (Staff Check-in)
              </h3>
              <p className="text-muted lh-base">
                Cung cấp ứng dụng quét mã QR chuyên dụng cho nhân viên kiểm soát tại cửa. Tốc độ nhận diện dưới 0.5 giây giúp xử lý hàng nghìn khách vào cổng nhanh chóng mà không gây ùn tắc.
              </p>
            </div>
          </div>
        </div>

        {/* Sidebar CTA */}
        <div className="col-lg-4">
          <div className="sticky-top" style={{ top: '6rem' }}>
            <div className="glass-card p-4 border border-success border-opacity-30 mb-4 shadow-lg">
              <div className="d-flex align-items-center gap-2 text-success mb-2 fw-bold">
                <Award size={20} /> Đối tác tổ chức
              </div>
              <h5 className="fw-bold text-white mb-3">Đăng ký trở thành Ban tổ chức ngay!</h5>
              <p className="small text-muted mb-4">
                Gia nhập nền tảng bán vé hiện đại nhất và tiếp cận hàng triệu khách hàng yêu thích sự kiện trên toàn quốc.
              </p>
              <Link
                to="/register"
                className="btn btn-gradient w-100 rounded-pill py-2 fw-bold d-flex align-items-center justify-content-center gap-2 text-decoration-none"
              >
                <span>Đăng ký đối tác</span>
                <ArrowRight size={16} />
              </Link>
            </div>

            <div className="glass-card p-4 border border-secondary border-opacity-25">
              <h6 className="fw-bold text-white mb-2">📞 Hỗ trợ đối tác</h6>
              <p className="small text-muted mb-0">
                Email phòng hợp tác phát triển sự kiện: <br />
                <span className="text-primary">partner@fivetickets.vn</span>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrganizerHandbook;
