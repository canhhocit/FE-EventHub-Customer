import axios from "axios";
import {
  MOCK_USER,
  MOCK_CATEGORIES,
  MOCK_LINKED_EVENTS,
  MOCK_BLOG_POSTS,
  MOCK_BLOG_TAGS,
  MOCK_BOOKINGS,
  MOCK_VOUCHERS,
  getStoredMockCart,
  saveStoredMockCart
} from "./blogMockData";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || "http://localhost:8080",
  timeout: 3000 // Timeout 3s để fallback nhanh khi backend không chạy
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token && !config.url.includes('/auth/')) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// ==================== AUTH ====================
export const login = async (username, password) => {
  try {
    const res = await api.post("/auth/login", { username, password });
    return res.data;
  } catch (error) {
    console.warn("Backend offline, sử dụng Mock Login cho:", username);
    return {
      code: 1000,
      result: {
        token: "mock-jwt-customer-token-" + Date.now(),
        authenticated: true
      }
    };
  }
};

export const register = async (data) => {
  try {
    const res = await api.post("/auth/register", data);
    return res.data;
  } catch (error) {
    console.warn("Backend offline, sử dụng Mock Register");
    // Lưu tạm vào MOCK_USER để profile nhận diện
    MOCK_USER.username = data.username || MOCK_USER.username;
    MOCK_USER.fullName = data.fullName || MOCK_USER.fullName;
    MOCK_USER.email = data.email || MOCK_USER.email;
    MOCK_USER.phone = data.phone || MOCK_USER.phone;
    return { code: 1000, message: "Đăng ký thành công (Mock Mode)", result: data };
  }
};

export const forgotPassword = async (email) => {
  try {
    const res = await api.post("/auth/forgot-password", { email });
    return res.data;
  } catch (error) {
    console.warn("Backend offline, sử dụng Mock Forgot Password");
    return { code: 1000, message: "Mã xác thực đã được gửi về email test!" };
  }
};

export const resetPassword = async (data) => {
  try {
    const res = await api.post("/auth/reset-password", data);
    return res.data;
  } catch (error) {
    console.warn("Backend offline, sử dụng Mock Reset Password");
    return { code: 1000, message: "Đặt lại mật khẩu thành công!" };
  }
};

// ==================== EVENTS & CATEGORIES ====================
export const getCategories = async () => {
  try {
    const res = await api.get("/categories");
    return res.data;
  } catch (error) {
    console.warn("Backend offline, sử dụng Mock Categories");
    return { code: 1000, result: MOCK_CATEGORIES };
  }
};

export const getEvents = async (params = {}) => {
  try {
    const res = await api.get("/events/search", { params });
    return res.data;
  } catch (error) {
    console.warn("Backend offline, sử dụng Mock Events");
    let list = [...MOCK_LINKED_EVENTS];

    if (params.keyword) {
      const kw = params.keyword.toLowerCase();
      list = list.filter(e => e.name.toLowerCase().includes(kw) || e.description.toLowerCase().includes(kw));
    }
    if (params.province) {
      list = list.filter(e => e.province === params.province || e.provinceName === params.province);
    }
    if (params.categoryId) {
      list = list.filter(e => Number(e.categoryId) === Number(params.categoryId));
    }
    if (params.minPrice) {
      list = list.filter(e => e.ticketTypes?.some(t => t.price >= Number(params.minPrice)));
    }

    const page = params.page ? params.page - 1 : 0;
    const size = params.size || 10;
    const start = page * size;
    const paged = list.slice(start, start + size);

    return {
      code: 1000,
      result: {
        content: paged,
        totalPages: Math.ceil(list.length / size) || 1,
        totalElements: list.length,
        number: page,
        size
      }
    };
  }
};

export const getEventDetail = async (id) => {
  try {
    const res = await api.get(`/events/${id}`);
    return res.data;
  } catch (error) {
    console.warn(`Backend offline, sử dụng Mock Event Detail cho ID: ${id}`);
    const found = MOCK_LINKED_EVENTS.find(e => String(e.id) === String(id)) || MOCK_LINKED_EVENTS[0];
    return { code: 1000, result: found };
  }
};

// ==================== BLOG & NEWS ====================
export const getBlogPosts = async ({ page = 0, size = 10, tagId = null } = {}) => {
  try {
    const response = await api.get("/blog/posts", { params: { page, size, tagId } });
    return response.data;
  } catch (error) {
    console.warn("Backend blog offline, sử dụng Mock Data");
    let filtered = [...MOCK_BLOG_POSTS];
    if (tagId) {
      filtered = filtered.filter(p => p.tags && p.tags.some(t => t.id === Number(tagId)));
    }
    const start = page * size;
    const paged = filtered.slice(start, start + size);
    return {
      code: 1000,
      result: {
        content: paged,
        totalElements: filtered.length,
        totalPages: Math.ceil(filtered.length / size) || 1,
        number: page,
        size
      }
    };
  }
};

export const getBlogPostBySlug = async (slug) => {
  try {
    const response = await api.get(`/blog/posts/${slug}`);
    return response.data;
  } catch (error) {
    console.warn(`Backend offline cho bài viết '${slug}', sử dụng Mock Data`);
    const found = MOCK_BLOG_POSTS.find(p => p.slug === slug || String(p.id) === String(slug));
    return { code: 1000, result: found || MOCK_BLOG_POSTS[0] };
  }
};

export const getBlogTags = async () => {
  try {
    const response = await api.get("/blog/tags");
    return response.data;
  } catch (error) {
    console.warn("Backend tags offline, sử dụng Mock Data");
    return { code: 1000, result: MOCK_BLOG_TAGS };
  }
};

// ==================== CART & BOOKINGS ====================
export const getCart = async () => {
  try {
    const res = await api.get("/cart");
    return res.data;
  } catch (error) {
    console.warn("Backend cart offline, sử dụng Mock Cart");
    const items = getStoredMockCart();
    return {
      code: 1000,
      result: {
        items
      }
    };
  }
};

export const addToCartApi = async (ticketTypeId, quantity) => {
  try {
    const res = await api.post("/cart/add", { ticketTypeId, quantity });
    return res.data;
  } catch (error) {
    console.warn("Backend cart offline, thêm vé vào Mock Cart");
    const items = getStoredMockCart();
    
    // Tìm thông tin ticket và event trong MOCK_LINKED_EVENTS
    let matchedEvent = null;
    let matchedTicket = null;
    for (const ev of MOCK_LINKED_EVENTS) {
      const tt = ev.ticketTypes?.find(t => t.id === Number(ticketTypeId));
      if (tt) {
        matchedEvent = ev;
        matchedTicket = tt;
        break;
      }
    }

    if (matchedEvent && matchedTicket) {
      const existingIdx = items.findIndex(i => Number(i.ticketTypeId) === Number(ticketTypeId));
      if (existingIdx >= 0) {
        items[existingIdx].quantity += quantity;
      } else {
        items.push({
          id: Date.now() + Math.floor(Math.random() * 1000),
          cartItemId: Date.now() + Math.floor(Math.random() * 1000),
          eventId: matchedEvent.id,
          eventName: matchedEvent.name,
          eventImage: matchedEvent.imageUrls?.[0],
          ticketTypeId: matchedTicket.id,
          ticketTypeName: matchedTicket.name,
          unitPrice: matchedTicket.price,
          price: matchedTicket.price,
          quantity: quantity,
          saleEndDate: matchedTicket.saleEndDate
        });
      }
      saveStoredMockCart(items);
    }
    return { code: 1000, message: "Thêm vào giỏ hàng thành công (Mock)" };
  }
};

export const removeFromCartApi = async (itemId) => {
  try {
    const res = await api.delete(`/cart/items/${itemId}`);
    return res.data;
  } catch (error) {
    console.warn("Backend cart offline, xóa vé khỏi Mock Cart");
    let items = getStoredMockCart();
    items = items.filter(i => String(i.id) !== String(itemId) && String(i.cartItemId) !== String(itemId));
    saveStoredMockCart(items);
    return { code: 1000, message: "Xóa thành công (Mock)" };
  }
};

export const clearCartApi = async () => {
  try {
    const res = await api.delete("/cart/clear");
    return res.data;
  } catch (error) {
    console.warn("Backend cart offline, làm trống Mock Cart");
    saveStoredMockCart([]);
    return { code: 1000, message: "Làm trống giỏ hàng thành công (Mock)" };
  }
};

export const getMyBookings = async () => {
  try {
    const res = await api.get("/bookings");
    return res.data;
  } catch (error) {
    console.warn("Backend offline, sử dụng Mock Bookings");
    return {
      code: 1000,
      result: {
        content: MOCK_BOOKINGS,
        totalElements: MOCK_BOOKINGS.length,
        totalPages: 1
      }
    };
  }
};

export const checkoutSelected = async (itemIds, paymentMethod, voucherCode) => {
  try {
    const url = `/bookings/checkout-selected?paymentMethod=${paymentMethod}${voucherCode ? `&voucherCode=${voucherCode}` : ''}&platform=web`;
    const res = await api.post(url, itemIds);
    return res.data;
  } catch (error) {
    console.warn("Backend offline, mô phỏng Checkout thành công");
    // Xóa các item đã thanh toán khỏi mock cart
    let items = getStoredMockCart();
    items = items.filter(i => !itemIds.includes(i.id) && !itemIds.includes(i.cartItemId));
    saveStoredMockCart(items);

    return {
      code: 1000,
      message: "Thanh toán thành công (Mock Demo)",
      result: {
        orderCode: "ORD-MOCK-" + Date.now(),
        paymentUrl: null // Không redirect ra cổng thật mà hiển thị màn hình thành công
      }
    };
  }
};

export const cancelAndRestoreCart = async (orderCode) => {
  try {
    const res = await api.post(`/bookings/cancel-and-restore-cart?orderCode=${orderCode}`);
    return res.data;
  } catch (error) {
    return { code: 1000, message: "Đã hủy đơn hàng (Mock)" };
  }
};

// ==================== USERS & PROFILE ====================
export const getProfile = async () => {
  try {
    const res = await api.get("/users/my-info");
    return res.data;
  } catch (error) {
    console.warn("Backend profile offline, sử dụng Mock User Profile");
    return {
      code: 1000,
      result: MOCK_USER
    };
  }
};

export const updateProfile = async (username, data) => {
  try {
    const res = await api.put(`/users/${username}`, data);
    return res.data;
  } catch (error) {
    console.warn("Backend profile offline, lưu Mock User Profile");
    Object.assign(MOCK_USER, data);
    return {
      code: 1000,
      message: "Cập nhật thành công (Mock)",
      result: MOCK_USER
    };
  }
};

// ==================== VOUCHERS ====================
export const validateVoucher = async (data) => {
  try {
    const res = await api.post("/vouchers/validate", data);
    return res.data;
  } catch (error) {
    console.warn("Backend voucher offline, sử dụng Mock Voucher");
    return {
      code: 1000,
      result: {
        valid: true,
        discountAmount: 50000
      }
    };
  }
};

export default api;
