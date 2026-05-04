import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || "http://localhost:8080",
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Auth
export const login = (username, password) => 
    api.post("/auth/login", { username, password }).then(res => res.data);

export const register = (data) => 
    api.post("/auth/register", data).then(res => res.data);

export const forgotPassword = (email) => 
    api.post("/auth/forgot-password", { email }).then(res => res.data);

export const resetPassword = (data) => 
    api.post("/auth/reset-password", data).then(res => res.data);

// Events & Categories
export const getCategories = () => 
    api.get("/categories").then(res => res.data);

export const getEvents = (params) => 
    api.get("/events/search", { params }).then(res => res.data);

export const getEventDetail = (id) => 
    api.get(`/events/${id}`).then(res => res.data);

// Bookings & Cart
export const getCart = () => 
    api.get("/cart").then(res => res.data);

export const addToCartApi = (ticketTypeId, quantity) => 
    api.post("/cart/add", { ticketTypeId, quantity }).then(res => res.data);

export const removeFromCartApi = (itemId) => 
    api.delete(`/cart/items/${itemId}`).then(res => res.data);

export const clearCartApi = () => 
    api.delete("/cart/clear").then(res => res.data);

export const getMyBookings = () => 
    api.get("/bookings").then(res => res.data);

export const checkoutSelected = (itemIds, paymentMethod, voucherCode) => {
    const url = `/bookings/checkout-selected?paymentMethod=${paymentMethod}${voucherCode ? `&voucherCode=${voucherCode}` : ''}`;
    return api.post(url, itemIds).then(res => res.data);
};

export const cancelAndRestoreCart = (orderCode) => 
    api.post(`/bookings/cancel-and-restore-cart?orderCode=${orderCode}`).then(res => res.data);

// Users
export const getProfile = () => 
    api.get("/users/my-info").then(res => res.data);

export const updateProfile = (username, data) => 
    api.put(`/users/${username}`, data).then(res => res.data);

// Vouchers
export const validateVoucher = (data) => 
    api.post("/vouchers/validate", data).then(res => res.data);

export default api;
