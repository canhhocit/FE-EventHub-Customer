import { Link } from 'react-router-dom';
import { ShieldAlert, ShieldCheck, Lock, AlertTriangle, ChevronLeft, PhoneCall } from 'lucide-react';

const SecurityPage = () => {
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
          <li className="breadcrumb-item active text-danger" aria-current="page">
            An toàn & Bảo mật
          </li>
        </ol>
      </nav>

      {/* Header */}
      <div className="mb-5">
        <Link to="/help" className="text-muted text-decoration-none d-inline-flex align-items-center gap-1 mb-3 small fw-semibold">
          <ChevronLeft size={16} /> Quay lại trung tâm trợ giúp
        </Link>
        <h1 className="display-6 fw-bold text-dark mb-3">
          Khiên bảo vệ cho <span className="text-primary">chiếc vé của bạn</span>
        </h1>
        <p className="text-muted">
          Những quy tắc vàng giúp bạn bảo vệ tài khoản, sở hữu vé an toàn và phòng ngừa lừa đảo vé giả trên không gian mạng.
        </p>
      </div>

      <div className="row g-5">
        <div className="col-lg-8">
          <div className="d-flex flex-column gap-5">
            {/* Rule 1 */}
            <div>
              <h3 className="fw-bold text-dark mb-3 d-flex align-items-center gap-2">
                <ShieldAlert className="text-primary" size={24} /> 1. Tuyệt đối không chia sẻ hình ảnh mã QR
              </h3>
              <p className="text-muted lh-base">
                Mã QR trên vé điện tử là thông tin duy nhất xác thực quyền vào cổng của bạn. Khi bạn đăng ảnh khoe vé lên Facebook, Instagram hay TikTok mà để lộ mã QR, kẻ gian hoàn toàn có thể quét lại và check-in chiếm quyền vào cổng trước bạn.
              </p>
              <div className="p-3 rounded-3 bg-warning bg-opacity-10 border border-warning border-opacity-25">
                <p className="small text-dark mb-0">
                  💡 <b>Mẹo:</b> Nếu bạn muốn chia sẻ ảnh vé trên mạng xã hội, hãy dùng công cụ vẽ che kín toàn bộ phần mã QR và mã đơn hàng (Order Code).
                </p>
              </div>
            </div>

            {/* Rule 2 */}
            <div>
              <h3 className="fw-bold text-dark mb-3 d-flex align-items-center gap-2">
                <AlertTriangle className="text-warning" size={24} /> 2. Cảnh giác với lừa đảo vé chuyển nhượng (Resale)
              </h3>
              <p className="text-muted lh-base">
                Các sự kiện cháy vé thường xuất hiện đối tượng rao bán lại vé với chiêu trò lừa đảo tinh vi. Hãy luôn cẩn trọng trước các dấu hiệu sau:
              </p>
              <div className="panel p-4 border">
                <ul className="list-unstyled mb-0 d-flex flex-column gap-3 text-dark small">
                  <li className="d-flex align-items-start gap-2">
                    <span className="text-danger fw-bold">✖</span>
                    <span>Yêu cầu chuyển khoản 100% tiền cọc qua tài khoản ngân hàng không chính chủ trước khi gửi vé.</span>
                  </li>
                  <li className="d-flex align-items-start gap-2">
                    <span className="text-danger fw-bold">✖</span>
                    <span>Giá vé rẻ hơn bất thường so với giá niêm yết của Ban tổ chức.</span>
                  </li>
                  <li className="d-flex align-items-start gap-2">
                    <span className="text-danger fw-bold">✖</span>
                    <span>Ảnh chụp màn hình vé có dấu hiệu chỉnh sửa Photoshop (tên, ngày giờ, số ghế bị nhòe).</span>
                  </li>
                  <li className="d-flex align-items-start gap-2">
                    <span className="text-danger fw-bold">✖</span>
                    <span>1 chiếc vé gửi mã QR cho hàng chục người mua khác nhau để thu tiền nhiều lần.</span>
                  </li>
                </ul>
              </div>
            </div>

            {/* Rule 3 */}
            <div>
              <h3 className="fw-bold text-dark mb-3 d-flex align-items-center gap-2">
                <Lock className="text-primary" size={24} /> 3. Bảo mật mật khẩu & tài khoản
              </h3>
              <p className="text-muted lh-base">
                Sử dụng mật khẩu mạnh kết hợp chữ hoa, chữ thường, chữ số và ký tự đặc biệt. Định kỳ cập nhật mật khẩu của bạn tại trang Thông tin cá nhân và tuyệt đối không dùng chung một mật khẩu cho nhiều dịch vụ.
              </p>
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="col-lg-4">
          <div className="sticky-top" style={{ top: '6rem' }}>
            <div className="panel p-4 border border-danger border-opacity-30 mb-4 bg-white">
              <h5 className="fw-bold text-danger mb-3">Phát hiện nghi vấn lừa đảo?</h5>
              <p className="small text-muted mb-4">
                Nếu bạn nghi ngờ chiếc vé của mình bị kẻ xấu sao chép hoặc phát hiện hành vi giả mạo ban tổ chức, hãy báo cáo ngay cho chúng tôi để hỗ trợ khóa mã vé kịp thời.
              </p>
              <a
                href="mailto:security@fivetickets.vn"
                className="btn btn-outline-danger w-100 rounded-pill py-2 fw-semibold d-flex align-items-center justify-content-center gap-2 text-decoration-none"
              >
                <PhoneCall size={16} /> Báo cáo vi phạm
              </a>
            </div>

            <div className="panel p-4 border bg-white">
              <div className="d-flex align-items-center gap-2 text-success mb-2 fw-bold">
                <ShieldCheck size={20} /> Cam kết nền tảng
              </div>
              <p className="small text-muted mb-0">
                Toàn bộ dữ liệu thanh toán và vé điện tử trên hệ thống được mã hóa an toàn theo chuẩn SSL/TLS 256-bit.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SecurityPage;
