import request from './request';

// Auth
export const login = (username, password) => 
  request('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ username, password })
  });

export const register = (data) => 
  request('/auth/register', {
    method: 'POST',
    body: JSON.stringify(data)
  });

export const forgotPassword = (email) => 
  request('/auth/forgot-password', {
    method: 'POST',
    body: JSON.stringify({ email })
  });

export const resetPassword = (data) => 
  request('/auth/reset-password', {
    method: 'POST',
    body: JSON.stringify(data)
  });

// Events & Categories
export const getCategories = () => request('/categories');

export const getEvents = (params) => {
  const query = new URLSearchParams(params).toString();
  return request(`/events/search?${query}`);
};

export const getEventDetail = (id) => request(`/events/${id}`);

// Bookings & Cart
export const getCart = () => request('/cart');

export const addToCartApi = (ticketTypeId, quantity) => 
  request('/cart/add', {
    method: 'POST',
    body: JSON.stringify({ ticketTypeId, quantity })
  });

export const removeFromCartApi = (itemId) => 
  request(`/cart/items/${itemId}`, {
    method: 'DELETE'
  });

export const clearCartApi = () => 
  request('/cart/clear', {
    method: 'DELETE'
  });

export const getMyBookings = () => request('/bookings');

export const checkoutSelected = (itemIds, paymentMethod, voucherCode) => {
  const url = `/bookings/checkout-selected?paymentMethod=${paymentMethod}${voucherCode ? `&voucherCode=${voucherCode}` : ''}`;
  return request(url, {
    method: 'POST',
    body: JSON.stringify(itemIds)
  });
};

export const cancelAndRestoreCart = (orderCode) => 
  request(`/bookings/cancel-and-restore-cart?orderCode=${orderCode}`, {
    method: 'POST'
  });

// Users
export const getProfile = () => request('/users/my-info');

export const updateProfile = (username, data) => 
  request(`/users/${username}`, {
    method: 'PUT',
    body: JSON.stringify(data)
  });

// Vouchers
export const validateVoucher = (data) => 
  request('/vouchers/validate', {
    method: 'POST',
    body: JSON.stringify(data)
  });
