import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Tag, CheckCircle, X } from "lucide-react";
import { useCart } from "../context/CartContext";

const Checkout = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { cart, fetchBackendCart } = useCart();

  const selectedCartItemIds = location.state?.selectedCartItemIds || [];
  const checkoutItems = cart.filter((item) =>
    selectedCartItemIds.includes(item.cartItemId),
  );

  const [paymentMethod, setPaymentMethod] = useState("PAYOS");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [eventVouchers, setEventVouchers] = useState({}); // { eventId: [vouchers] }
  const [selectedVouchers, setSelectedVouchers] = useState({}); // { eventId: voucherId }
  const [voucherLoading, setVoucherLoading] = useState(false);
  const [showVoucherModal, setShowVoucherModal] = useState(false);
  const [currentEventId, setCurrentEventId] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      alert("Vui lòng đăng nhập để thanh toán!");
      navigate("/login");
      return;
    }
    if (checkoutItems.length === 0 && !success) {
      navigate("/cart");
    }
  }, [checkoutItems, navigate, success]);

  const subtotal = checkoutItems.reduce(
    (total, item) => total + item.price * item.quantity,
    0,
  );

  // Group items by eventId
  const groupedByEvent = checkoutItems.reduce((acc, item) => {
    if (!acc[item.eventId]) {
      acc[item.eventId] = {
        eventId: item.eventId,
        eventName: item.eventName,
        items: [],
        totalPrice: 0,
      };
    }
    acc[item.eventId].items.push(item);
    acc[item.eventId].totalPrice += item.price * item.quantity;
    return acc;
  }, {});

  const eventGroups = Object.values(groupedByEvent);

  const handleOpenVoucherModal = async (eventId) => {
    const eventIdKey = String(eventId);
    setCurrentEventId(eventIdKey);
    setShowVoucherModal(true);

    if (eventVouchers[eventIdKey]) {
      return; // Already loaded
    }

    setVoucherLoading(true);
    try {
      const token = localStorage.getItem("token");
      const apiBase =
        import.meta.env.VITE_API_BASE_URL;
      const response = await fetch(`${apiBase}/vouchers/event/${eventId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });
      const data = await response.json();

      if (data.code === 1000 && Array.isArray(data.result)) {
        setEventVouchers((prev) => ({
          ...prev,
          [eventIdKey]: data.result,
        }));
      } else {
        alert("Không thể tải danh sách voucher");
      }
    } catch (error) {
      console.error(error);
      alert("Lỗi hệ thống khi tải voucher");
    } finally {
      setVoucherLoading(false);
    }
  };

  const handleSelectVoucher = (voucher) => {
    setSelectedVouchers((prev) => ({
      ...prev,
      [currentEventId]: voucher,
    }));
    setShowVoucherModal(false);
  };

  const handleRemoveVoucher = (eventId) => {
    const eventIdKey = String(eventId);
    setSelectedVouchers((prev) => {
      const updated = { ...prev };
      delete updated[eventIdKey];
      return updated;
    });
  };

  const isVoucherValid = (eventId, voucher) => {
    const eventIdKey = String(eventId);
    const eventTotal = groupedByEvent[eventIdKey]?.totalPrice || 0;
    if (voucher.minOrderAmount && eventTotal < voucher.minOrderAmount) {
      return false;
    }
    return true;
  };

  const getVoucherDiscount = (voucher, eventTotal) => {
    if (!voucher) return 0;

    const discountType = String(voucher.discountType || "").toUpperCase();
    const amount = Number(voucher.amount || 0);

    if (discountType.includes("PERCENT")) {
      let discount = (eventTotal * amount) / 100;
      if (voucher.maxDiscount !== null && voucher.maxDiscount !== undefined) {
        discount = Math.min(discount, Number(voucher.maxDiscount));
      }
      return discount;
    }

    if (
      discountType.includes("FIXED") ||
      discountType.includes("AMOUNT") ||
      discountType.includes("MONEY")
    ) {
      return amount;
    }

    return amount;
  };

  const calculateTotalDiscount = () => {
    let total = 0;
    Object.entries(selectedVouchers).forEach(([eventId, voucher]) => {
      const eventIdKey = String(eventId);
      if (voucher) {
        const eventTotal = groupedByEvent[eventIdKey]?.totalPrice || 0;
        total += getVoucherDiscount(voucher, eventTotal);
      }
    });
    return total;
  };

  const handlePayment = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const apiBase =
        import.meta.env.VITE_API_BASE_URL;

      // Build query params with voucher codes
      const voucherParams = [];
      Object.entries(selectedVouchers).forEach(([eventId, voucher]) => {
        if (voucher && voucher.code) {
          voucherParams.push(`voucherCode=${encodeURIComponent(voucher.code)}`);
        }
      });

      const queryString =
        voucherParams.length > 0 ? `&${voucherParams.join("&")}` : "";

      const response = await fetch(
        `${apiBase}/bookings/checkout-selected?paymentMethod=${paymentMethod}${queryString}&platform=web`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(selectedCartItemIds),
        },
      );

      const data = await response.json();

      if (data.code === 1000) {
        // If PayOS provides a payment URL, redirect to it
        if (
          data.result &&
          data.result.paymentUrl &&
          paymentMethod === "PAYOS"
        ) {
          window.location.href = data.result.paymentUrl;
          return;
        }

        // For MoMo or cases without external redirect, show success immediately
        await fetchBackendCart();
        setSuccess(true);
        setTimeout(() => {
          navigate("/my-tickets");
        }, 3000);
        return;
      } else {
        alert(
          "Thanh toán thất bại: " + (data.message || "Vui lòng thử lại sau"),
        );
      }
    } catch (error) {
      console.error("Checkout error:", error);
      alert("Lỗi hệ thống: Không thể hoàn tất thanh toán do mất kết nối");
    } finally {
      setLoading(false);
    }
  };

  const totalDiscount = calculateTotalDiscount();
  const total = subtotal - totalDiscount;

  if (success) {
    return (
      <div className="container py-5 text-center animate-fade-up">
        <div className="glass-card p-5 mx-auto" style={{ maxWidth: "500px" }}>
          <CheckCircle size={64} className="text-success mb-4 mx-auto" />
          <h2 className="fw-bold mb-3">Thanh toán thành công!</h2>
          <p className="text-muted">
            Hóa đơn điện tử PDF đã được gửi vào Email của bạn.
            <br />
            Hệ thống sẽ chuyển về trang Quản lý vé...
          </p>
        </div>
      </div>
    );
  }

  // Voucher Modal
  const voucherModal = (
    <div
      className={`modal fade ${showVoucherModal ? "show" : ""}`}
      style={{ display: showVoucherModal ? "block" : "none" }}
      tabIndex={-1}
    >
      <div className="modal-dialog modal-dialog-centered">
        <div className="modal-content bg-dark text-white border-secondary">
          <div className="modal-header border-secondary">
            <h5 className="modal-title fw-bold">Chọn voucher</h5>
            <button
              type="button"
              className="btn-close btn-close-white"
              onClick={() => setShowVoucherModal(false)}
            ></button>
          </div>
          <div className="modal-body">
            {voucherLoading ? (
              <div className="text-center py-4">
                <div className="spinner-border text-primary" role="status">
                  <span className="visually-hidden">Đang tải...</span>
                </div>
              </div>
            ) : (eventVouchers[currentEventId] || []).length > 0 ? (
              <div className="d-flex flex-column gap-2">
                <button
                  className="btn btn-outline-secondary text-white text-start p-3"
                  onClick={() => {
                    handleRemoveVoucher(currentEventId);
                    setShowVoucherModal(false);
                  }}
                >
                  Không sử dụng voucher
                </button>
                {(eventVouchers[currentEventId] || []).map((voucher) => {
                  const isValid = isVoucherValid(currentEventId, voucher);
                  return (
                    <button
                      key={voucher.id}
                      className={`btn text-start p-3 ${
                        isValid
                          ? "btn-outline-primary"
                          : "btn-outline-secondary opacity-50"
                      }`}
                      onClick={() => isValid && handleSelectVoucher(voucher)}
                      disabled={!isValid}
                    >
                      <div className="d-flex justify-content-between">
                        <div>
                          <div className="fw-bold">{voucher.code}</div>
                          <small className="text-muted">
                            {voucher.discountType === "PERCENTAGE"
                              ? `Giảm ${voucher.amount}%`
                              : `Giảm ${voucher.amount.toLocaleString("vi-VN")}đ`}
                          </small>
                          {voucher.minOrderAmount && (
                            <div>
                              <small
                                className={
                                  isValid ? "text-muted" : "text-danger"
                                }
                              >
                                Tối thiểu:{" "}
                                {voucher.minOrderAmount.toLocaleString("vi-VN")}
                                đ
                              </small>
                            </div>
                          )}
                        </div>
                        <div className="text-end">
                          <small className="text-muted">
                            Còn: {voucher.quantity}
                          </small>
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-4">
                <p className="text-muted">Không có voucher khả dụng</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="container py-4">
      <h2 className="fw-bold mb-4">Thanh toán</h2>
      <div className="row g-4">
        {/* Cột trái: Thông tin đơn hàng */}
        <div className="col-lg-8 animate-fade-up">
          <div className="glass-card p-4 mb-4">
            <h5 className="fw-bold mb-4">Chi tiết vé</h5>
            {eventGroups.map((group, idx) => {
              const eventIdKey = String(group.eventId);
              const selectedVoucher = selectedVouchers[eventIdKey] || null;
              const eventDiscount = getVoucherDiscount(
                selectedVoucher,
                group.totalPrice,
              );
              const eventFinalTotal = group.totalPrice - eventDiscount;

              return (
                <div
                  key={idx}
                  className="border border-secondary rounded p-3 mb-3"
                >
                  <div className="mb-3">
                    <div className="flex-grow-1">
                      <h6 className="mb-2">{group.eventName}</h6>
                      <div>
                        {group.items.map((item, i) => (
                          <div
                            key={i}
                            className="d-flex justify-content-between mb-1"
                          >
                            <small className="text-muted">
                              {item.ticketTypeName} x {item.quantity}
                            </small>
                            <small className="text-muted fw-medium">
                              {(item.price * item.quantity).toLocaleString(
                                "vi-VN",
                              )}
                              đ
                            </small>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="border-top border-secondary pt-3">
                    {selectedVoucher ? (
                      <div className="d-flex justify-content-between align-items-center bg-success bg-opacity-10 p-2 rounded mb-2">
                        <div>
                          <small className="text-success fw-bold">
                            {selectedVoucher.code}
                          </small>
                          <br />
                          <small className="text-muted">
                            {String(selectedVoucher.discountType || "")
                              .toUpperCase()
                              .includes("PERCENT")
                              ? `Giảm ${selectedVoucher.amount}%`
                              : `Giảm ${Number(selectedVoucher.amount || 0).toLocaleString("vi-VN")}đ`}
                          </small>
                        </div>
                        <button
                          className="btn btn-sm btn-outline-danger"
                          onClick={() => handleRemoveVoucher(eventIdKey)}
                        >
                          <X size={16} />
                        </button>
                      </div>
                    ) : null}
                    <button
                      className="btn btn-sm btn-outline-primary w-100"
                      onClick={() => handleOpenVoucherModal(eventIdKey)}
                    >
                      {selectedVoucher ? "Đổi voucher" : "Chọn voucher"}
                    </button>
                    <div className="d-flex justify-content-between align-items-center mt-3 pt-3 border-top border-secondary">
                      <span className="fw-bold">Tổng tiền:</span>
                      <div className="text-end">
                        {eventDiscount > 0 ? (
                          <>
                            <small className="text-muted d-block">
                              <del>
                                {group.totalPrice.toLocaleString("vi-VN")}đ
                              </del>
                            </small>
                            <span className="fw-bold text-success">
                              {eventFinalTotal.toLocaleString("vi-VN")}đ
                            </span>
                          </>
                        ) : (
                          <span className="fw-bold">
                            {group.totalPrice.toLocaleString("vi-VN")}đ
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="glass-card p-4">
            <h5 className="fw-bold mb-4">Phương thức thanh toán</h5>
            <div className="d-flex flex-column gap-3">
              <label
                className={`d-flex align-items-center gap-3 p-3 border rounded cursor-pointer transition-all ${paymentMethod === "PAYOS" ? "border-primary bg-primary bg-opacity-10" : "border-secondary bg-dark"}`}
                onClick={() => setPaymentMethod("PAYOS")}
              >
                <input
                  type="radio"
                  name="payment"
                  checked={paymentMethod === "PAYOS"}
                  onChange={() => setPaymentMethod("PAYOS")}
                  className="form-check-input mt-0"
                />
                <img
                  src="https://th.bing.com/th/id/OIP.7088OwVKnkxm9jJwOy8z5QHaHa?w=161&h=180&c=7&r=0&o=7&dpr=1.1&pid=1.7&rm=3"
                  height={40}
                  width={40}
                  alt="VietQR(PayOS)"
                  className="rounded object-fit-contain bg-white px-2"
                />
                <span className="fw-medium">VietQR</span>
              </label>

              <label
                className={`d-flex align-items-center gap-3 p-3 border rounded cursor-pointer transition-all ${paymentMethod === "MOMO" ? "border-primary bg-primary bg-opacity-10" : "border-secondary bg-dark"}`}
                onClick={() => setPaymentMethod("MOMO")}
              >
                <input
                  type="radio"
                  name="payment"
                  checked={paymentMethod === "MOMO"}
                  onChange={() => setPaymentMethod("MOMO")}
                  className="form-check-input mt-0"
                />
                <img
                  src="https://cdn.haitrieu.com/wp-content/uploads/2022/10/Logo-MoMo-Square.png"
                  width={40}
                  height={40}
                  alt="Momo"
                  className="rounded shadow-sm"
                />
                <div className="d-flex flex-column">
                  <span className="fw-medium">Momo</span>
                  <small className="text-warning">Giả lập</small>
                </div>
              </label>
            </div>
          </div>
        </div>

        {/* Cột phải: Tổng tiền & Voucher */}
        <div
          className="col-lg-4 animate-fade-up"
          style={{ animationDelay: "0.1s" }}
        >
          <div className="glass-card p-4 sticky-top" style={{ top: "100px" }}>
            <h5 className="fw-bold mb-4">Tổng cộng</h5>

            {/* Event breakdown */}
            <div className="mb-3">
              {eventGroups.map((group) => {
                const eventIdKey = String(group.eventId);
                const selectedVoucher = selectedVouchers[eventIdKey] || null;
                const eventDiscount = getVoucherDiscount(
                  selectedVoucher,
                  group.totalPrice,
                );

                return (
                  <div key={eventIdKey} className="mb-2">
                    <div className="d-flex justify-content-between text-muted small">
                      <span>{group.eventName}:</span>
                      <span>{group.totalPrice.toLocaleString("vi-VN")}đ</span>
                    </div>
                    {selectedVoucher && eventDiscount > 0 && (
                      <div className="d-flex justify-content-between text-success small ms-2">
                        <span>{selectedVoucher.code}:</span>
                        <span>-{eventDiscount.toLocaleString("vi-VN")}đ</span>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            <hr className="border-secondary" />

            <div className="d-flex justify-content-between mb-2 text-muted">
              <span>Tạm tính:</span>
              <span>{subtotal.toLocaleString("vi-VN")}đ</span>
            </div>
            {totalDiscount > 0 && (
              <div className="d-flex justify-content-between mb-2 text-success">
                <span>
                  <Tag size={14} className="me-1" /> Giảm giá:
                </span>
                <span>-{totalDiscount.toLocaleString("vi-VN")}đ</span>
              </div>
            )}
            <hr className="border-secondary" />
            <div className="d-flex justify-content-between mb-4">
              <span className="fw-bold fs-5">Thành tiền:</span>
              <span className="fw-bold fs-4 text-gradient">
                {total.toLocaleString("vi-VN")}đ
              </span>
            </div>

            <button
              className="btn btn-gradient w-100 py-3 rounded-pill fs-5"
              onClick={handlePayment}
              disabled={loading || checkoutItems.length === 0}
            >
              {loading ? (
                <span className="spinner-border spinner-border-sm me-2"></span>
              ) : (
                "Thanh toán"
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Voucher Modal */}
      {voucherModal}
      {showVoucherModal && (
        <div
          className="modal-backdrop fade show"
          onClick={() => setShowVoucherModal(false)}
        ></div>
      )}
    </div>
  );
};

export default Checkout;
