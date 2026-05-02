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
  "Cà Mau"
];

export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8080";

export const getImageUrl = (imagePath) => {
  if (!imagePath) return 'https://images.unsplash.com/photo-1540553016722-983e48a2cd10?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80';
  if (imagePath.includes('http://') || imagePath.includes('https://')) return imagePath;
  return `${API_BASE_URL}/images/${imagePath}`;
};
