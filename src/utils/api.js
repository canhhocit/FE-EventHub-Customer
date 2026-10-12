import axios from "axios";

export const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:8080";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || "http://192.168.0.105:8080",
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

/* Called by AuthContext so its state follows a silently refreshed token. */
let onTokenRefreshed = null;
export const setTokenRefreshedHandler = (fn) => {
  onTokenRefreshed = fn;
};

const readToken = () => {
  try {
    return localStorage.getItem("token");
  } catch {
    return null;
  }
};

const storeToken = (token) => {
  try {
    localStorage.setItem("token", token);
  } catch {
    /* ignore */
  }
};

const clearToken = () => {
  try {
    localStorage.removeItem("token");
  } catch {
    /* ignore */
  }
};

const decodePayload = (token) => {
  if (!token || typeof token !== "string") return null;
  const parts = token.split(".");
  if (parts.length !== 3) return null;
  try {
    return JSON.parse(atob(parts[1].replace(/-/g, "+").replace(/_/g, "/")));
  } catch {
    return null;
  }
};

/**
 * Tokens last an hour, and the API answers an expired or malformed one with a
 * raw 500 stack trace rather than a clean 401. Checking `exp` here lets us
 * refresh before sending instead of erroring on every request.
 */
export const isTokenUsable = (token) => {
  const payload = decodePayload(token);
  if (!payload) return false;
  if (!payload.exp) return true; // no expiry claim — let the server decide
  return payload.exp * 1000 > Date.now() + 5000;
};

/**
 * An expired token can still be traded for a new one at /auth/refresh (the
 * server allows that for a while after it was issued), so only a token that
 * isn't a JWT at all is worth throwing away without asking.
 */
export const isTokenRefreshable = (token) => decodePayload(token) !== null;

/* No interceptors here, so a failing refresh can never recurse into itself. */
const refreshClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
});

const sessionExpired = () => {
  const err = new Error("Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.");
  err.isSessionExpired = true;
  return err;
};

let refreshPromise = null;

/**
 * Trade the stored token for a fresh one. Concurrent callers share a single
 * request: the server invalidates the old token on refresh, so a second
 * refresh with the same token would be rejected and log the user out.
 */
export const refreshAccessToken = () => {
  if (refreshPromise) return refreshPromise;

  const oldToken = readToken();
  if (!oldToken) return Promise.reject(sessionExpired());

  refreshPromise = refreshClient
    .post("/auth/refresh", { token: oldToken })
    .then((res) => {
      const newToken = res.data?.result?.token;
      if (res.data?.code !== 1000 || !newToken) throw sessionExpired();
      storeToken(newToken);
      onTokenRefreshed?.(newToken);
      return newToken;
    })
    .catch((error) => {
      // Another tab may have refreshed first, which invalidates our copy.
      const current = readToken();
      if (current && current !== oldToken && isTokenUsable(current)) {
        onTokenRefreshed?.(current);
        return current;
      }

      const status = error.response?.status;
      const rejected =
        error.isSessionExpired || (status >= 400 && status < 500);
      if (!rejected) {
        // Network error or the server is restarting (5xx): the session may
        // still be fine, so keep the token and let this request fail.
        throw error;
      }

      console.warn(
        `[auth] refresh rejected at ${new Date().toISOString()}`,
        status,
        error.response?.data,
      );
      clearToken();
      onUnauthorized?.();
      throw sessionExpired();
    })
    .finally(() => {
      refreshPromise = null;
    });

  return refreshPromise;
};

api.interceptors.request.use(async (config) => {
  const url = config.url || "";
  if (ANONYMOUS_PATHS.some((p) => url.startsWith(p))) return config;

  let token = readToken();
  if (!token) return config;

  if (!isTokenUsable(token)) {
    if (!isTokenRefreshable(token)) {
      clearToken();
      onUnauthorized?.();
      return config;
    }
    try {
      token = await refreshAccessToken();
    } catch (error) {
      // Server unreachable: fail this request rather than send it anonymously
      // and have the 401 log the user out.
      if (!error.isSessionExpired) throw error;
      // Session is over (already cleared): public endpoints still work.
      return config;
    }
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
  async (error) => {
    if (axios.isCancel?.(error)) return Promise.reject(error);

    const status = error.response?.status;
    const body = error.response?.data;
    const requestUrl = error.config?.url || "";

    // Our API always answers with a numeric `code`; anything else is an
    // unhandled framework error whose message is a Java stack trace, not
    // something to show a user.
    const isApiResponse =
      body && typeof body === "object" && typeof body.code === "number";

    // The server rejected a token that looked valid to us — typically one
    // issued before a redeploy. Refresh once and replay the request.
    const original = error.config || {};
    const isAnonymous = ANONYMOUS_PATHS.some((p) => requestUrl.startsWith(p));
    const sentAuth = !!original.headers?.Authorization;
    const tokenRejected =
      status === 401 || (status === 500 && !isApiResponse && sentAuth);
    let refreshUnavailable = false;
    if (tokenRejected && sentAuth && !isAnonymous && !original._retried) {
      original._retried = true;
      try {
        const newToken = await refreshAccessToken();
        original.headers.Authorization = `Bearer ${newToken}`;
        return api(original);
      } catch (refreshError) {
        if (!refreshError.isSessionExpired) {
          refreshUnavailable = true;
          console.warn(
            `[auth] refresh failed at ${new Date().toISOString()}`,
            refreshError.message,
          );
        }
        // fall through and report the original failure
      }
    }

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
    const isSessionFailure = tokenRejected;

    if (isSessionFailure && refreshUnavailable) {
      // Couldn't reach /auth/refresh, so we don't know the session is dead.
      message = NETWORK_MESSAGE;
    } else if (isSessionFailure && !isAnonymous && readToken()) {
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
export const getBlogPosts = ({ page = 0, size = 20 } = {}) =>
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
export const getMyBookings = ({ page = 1, size = 20 } = {}) =>
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
