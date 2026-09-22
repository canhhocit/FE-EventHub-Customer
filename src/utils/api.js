import axios from "axios";

export const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:8080";

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
});

/* Endpoints that must never carry a stale Authorization header. */
const ANONYMOUS_PATHS = [
  "/auth/login",
  "/auth/register",
  "/auth/forgot-password",
  "/auth/reset-password",
];

/* Called by AuthContext so a rejected token logs the user out everywhere. */
let onUnauthorized = null;
export const setUnauthorizedHandler = (fn) => {
  onUnauthorized = fn;
};

const clearToken = () => {
  try {
    localStorage.removeItem("token");
  } catch {
    /* ignore */
  }
};

/**
 * Tokens last an hour, and the API answers an expired or malformed one with a
 * raw 500 stack trace rather than a clean 401. Checking `exp` here means an
 * expired session logs out quietly instead of erroring on every request.
 */
export const isTokenUsable = (token) => {
  if (!token || typeof token !== "string") return false;
  const parts = token.split(".");
  if (parts.length !== 3) return false;
  try {
    const payload = JSON.parse(
      atob(parts[1].replace(/-/g, "+").replace(/_/g, "/")),
    );
    if (!payload.exp) return true; // no expiry claim — let the server decide
    return payload.exp * 1000 > Date.now() + 5000;
  } catch {
    return false;
  }
};

api.interceptors.request.use((config) => {
  const url = config.url || "";
  if (ANONYMOUS_PATHS.some((p) => url.startsWith(p))) return config;

  const token = localStorage.getItem("token");
  if (!token) return config;

  if (!isTokenUsable(token)) {
    clearToken();
    onUnauthorized?.();
    return config;
  }

  config.headers.Authorization = `Bearer ${token}`;
  return config;
});

const NETWORK_MESSAGE =
  "Không kết nối được máy chủ. Vui lòng kiểm tra kết nối mạng và thử lại.";

/**
 * The backend always answers with { code, message, result }, including on
 * 4xx/5xx. Axios turns those into a generic "Request failed with status code
 * 401", which is what users were seeing. Unwrap the real message here so every
 * caller can just read `error.message`.
 */
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (axios.isCancel?.(error)) return Promise.reject(error);

    const status = error.response?.status;
    const body = error.response?.data;
    const requestUrl = error.config?.url || "";

    // Our API always answers with a numeric `code`; anything else is an
    // unhandled framework error whose message is a Java stack trace, not
    // something to show a user.
    const isApiResponse =
      body && typeof body === "object" && typeof body.code === "number";

    let message;
    if (!error.response) {
      message =
        error.code === "ECONNABORTED"
          ? "Máy chủ phản hồi quá lâu. Vui lòng thử lại."
          : NETWORK_MESSAGE;
    } else if (isApiResponse && body.message) {
      message = body.message;
    } else if (status === 401) {
      message = "Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.";
    } else if (status === 403) {
      message = "Bạn không có quyền thực hiện thao tác này.";
    } else if (status === 404) {
      message = "Không tìm thấy dữ liệu yêu cầu.";
    } else if (status >= 500) {
      message = "Máy chủ đang gặp sự cố. Vui lòng thử lại sau.";
    } else {
      message = "Đã có lỗi xảy ra. Vui lòng thử lại.";
    }

    // A rejected token on a protected call means the session is gone. The API
    // signals that as a 401, or as an unhandled 500 when the JWT filter itself
    // rejects the token — treat both the same way.
    const isLoginAttempt = ANONYMOUS_PATHS.some((p) => requestUrl.startsWith(p));
    const sentToken = !!error.config?.headers?.Authorization;
    const isSessionFailure =
      status === 401 || (status === 500 && !isApiResponse && sentToken);

    if (isSessionFailure && !isLoginAttempt && localStorage.getItem("token")) {
      message = "Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.";
      clearToken();
      onUnauthorized?.();
    }

    const normalized = new Error(message);
    normalized.status = status;
    normalized.code = isApiResponse ? body.code : undefined;
    normalized.isSessionExpired = isSessionFailure;
    normalized.isNetworkError = !error.response;
    return Promise.reject(normalized);
  },
);

/* Drop empty filters so Spring never tries to bind "" to a Long/BigDecimal. */
const clean = (params = {}) =>
  Object.fromEntries(
    Object.entries(params).filter(
      ([, v]) => v !== "" && v !== null && v !== undefined,
    ),
  );

const unwrap = (res) => res.data;

// ==================== AUTH ====================
export const login = (username, password) =>
  api.post("/auth/login", { username, password }).then(unwrap);

export const register = (data) =>
  api.post("/auth/register", data).then(unwrap);

export const forgotPassword = (email) =>
  api.post("/auth/forgot-password", { email }).then(unwrap);

export const resetPassword = (data) =>
  api.post("/auth/reset-password", data).then(unwrap);

// ==================== EVENTS & CATEGORIES ====================
export const getCategories = () => api.get("/categories").then(unwrap);

export const getEvents = (params = {}, config = {}) =>
  api.get("/events/search", { params: clean(params), ...config }).then(unwrap);

export const getEventDetail = (id) => api.get(`/events/${id}`).then(unwrap);

// ==================== BLOG & NEWS ====================
export const getBlogPosts = ({ page = 0, size = 10 } = {}) =>
  api.get("/blog/posts", { params: { page, size } }).then(unwrap);

export const getBlogPostBySlug = (slug) =>
  api.get(`/blog/posts/${slug}`).then(unwrap);

export const getBlogTags = () => api.get("/blog/tags").then(unwrap);

// ==================== CART ====================
export const getCart = () => api.get("/cart").then(unwrap);

export const addToCartApi = (ticketTypeId, quantity) =>
  api.post("/cart/add", { ticketTypeId, quantity }).then(unwrap);

export const updateCartItemApi = (itemId, quantity) =>
  api.put(`/cart/items/${itemId}`, null, { params: { quantity } }).then(unwrap);

export const removeFromCartApi = (itemId) =>
  api.delete(`/cart/items/${itemId}`).then(unwrap);

export const clearCartApi = () => api.delete("/cart/clear").then(unwrap);

// ==================== ORDERS ====================
export const getMyBookings = ({ page = 1, size = 10 } = {}) =>
  api.get("/bookings", { params: { page, size } }).then(unwrap);

/**
 * The backend accepts exactly one voucher code per order, so the UI must send
 * at most one — sending several silently applied only the first.
 */
export const checkoutSelected = ({
  itemIds,
  paymentMethod,
  voucherCode = null,
}) =>
  api
    .post("/bookings/checkout-selected", itemIds, {
      params: clean({ paymentMethod, voucherCode, platform: "web" }),
    })
    .then(unwrap);

export const cancelAndRestoreCart = (orderCode) =>
  api
    .post("/bookings/cancel-and-restore-cart", null, { params: { orderCode } })
    .then(unwrap);

export const downloadInvoice = (orderId) =>
  api.get(`/bookings/${orderId}/invoice`, { responseType: "blob" });

// ==================== USERS & PROFILE ====================
export const getProfile = () => api.get("/users/my-info").then(unwrap);

export const updateProfile = (username, data) =>
  api.put(`/users/${username}`, data).then(unwrap);

// ==================== VOUCHERS ====================
export const getVouchersForEvent = (eventId) =>
  api.get(`/vouchers/event/${eventId}`).then(unwrap);

export const validateVoucher = (data) =>
  api.post("/vouchers/validate", data).then(unwrap);

export default api;
