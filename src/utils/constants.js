export const VIETNAM_PROVINCES = [
  "Hà Nội",
  "Hải Phòng",
  "Quảng Ninh",
  "Ninh Bình",
  "Lào Cai",
  "Điện Biên",
  "Thanh Hóa",
  "Nghệ An",
  "Huế",
  "Đà Nẵng",
  "Quảng Nam",
  "Khánh Hòa",
  "Lâm Đồng",
  "TP. Hồ Chí Minh",
  "Bình Dương",
  "Đồng Nai",
  "Bà Rịa - Vũng Tàu",
  "Cần Thơ",
  "An Giang",
  "Kiên Giang",
  "Cà Mau",
];

export const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:8080";

/** Where a prospective organizer signs up / manages their events. */
export const ORGANIZER_PORTAL_URL =
  import.meta.env.VITE_ORGANIZER_PORTAL_URL || "";

const FALLBACK_IMAGE =
  "data:image/svg+xml;charset=utf-8," +
  encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" width="640" height="400" viewBox="0 0 640 400">
      <rect width="640" height="400" fill="#eef0f4"/>
      <path d="M0 400 L200 240 L330 330 L470 200 L640 320 L640 400Z" fill="#dfe3ea"/>
      <circle cx="500" cy="96" r="34" fill="#dfe3ea"/>
    </svg>`,
  );

export const getImageUrl = (imagePath) => {
  if (!imagePath) return FALLBACK_IMAGE;
  if (imagePath.startsWith("http://") || imagePath.startsWith("https://"))
    return imagePath;
  if (imagePath.startsWith("data:")) return imagePath;
  return `${API_BASE_URL}/images/${imagePath}`;
};

/** Swaps in the placeholder once, so a broken URL can't loop onError. */
export const handleImageError = (event) => {
  if (event.target.dataset.fallbackApplied) return;
  event.target.dataset.fallbackApplied = "1";
  event.target.src = FALLBACK_IMAGE;
};

export const formatCurrency = (value) => {
  const amount = Number(value);
  if (!Number.isFinite(amount)) return "0đ";
  return `${amount.toLocaleString("vi-VN")}đ`;
};

export const formatDate = (value, options) => {
  if (!value) return "Đang cập nhật";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Đang cập nhật";
  return date.toLocaleDateString("vi-VN", options);
};

export const formatDateTime = (value) => {
  if (!value) return "Đang cập nhật";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Đang cập nhật";
  return date.toLocaleString("vi-VN", {
    hour: "2-digit",
    minute: "2-digit",
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
};

export const EVENT_STATUS = {
  OPENING: { label: "Đang mở bán", pill: "pill-live" },
  UPCOMING: { label: "Sắp mở bán", pill: "pill-soon" },
  CLOSED: { label: "Đã đóng bán", pill: "pill-closed" },
  CANCELLED: { label: "Đã hủy", pill: "pill-danger" },
  PENDING: { label: "Chờ duyệt", pill: "pill-warn" },
};

export const getEventStatus = (status) =>
  EVENT_STATUS[status] || { label: status || "Sự kiện", pill: "pill-neutral" };

/** Lowest ticket price of an event, or null when it has no ticket types. */
export const getLowestPrice = (event) => {
  const prices = (event?.ticketTypes || [])
    .map((t) => Number(t?.price))
    .filter((p) => Number.isFinite(p));
  return prices.length ? Math.min(...prices) : null;
};

export const getEventLocation = (event) => {
  const parts = [event?.address || event?.location, event?.provinceName || event?.province]
    .filter(Boolean)
    .map((p) => String(p).trim());
  return parts.length ? [...new Set(parts)].join(", ") : "Đang cập nhật";
};
