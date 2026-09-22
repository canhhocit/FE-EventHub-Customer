// Mock data hoàn chỉnh cho toàn bộ ứng dụng khi Backend chưa có sẵn

export const MOCK_USER = {
  id: 1,
  username: "khachhang_demo",
  fullName: "Nguyễn Văn Khách Hàng",
  email: "khachhang@fivetickets.vn",
  phone: "0912345678",
  address: "Số 1 Đại Cồ Việt, Hai Bà Trưng, Hà Nội",
  roles: [{ name: "CUSTOMER" }]
};

export const MOCK_CATEGORIES = [
  { id: 1, name: "Âm nhạc" },
  { id: 2, name: "Công nghệ" },
  { id: 3, name: "Thể thao" },
  { id: 4, name: "Hội thảo & Workshop" },
  { id: 5, name: "Lễ hội & Văn hóa" }
];

export const MOCK_BLOG_TAGS = [
  { id: 1, name: "Âm nhạc", slug: "am-nhac" },
  { id: 2, name: "Workshop", slug: "workshop" },
  { id: 3, name: "Thể thao", slug: "the-thao" },
  { id: 4, name: "Công nghệ", slug: "cong-nghe" },
  { id: 5, name: "Lễ hội & Văn hóa", slug: "le-hoi-van-hoa" },
  { id: 6, name: "Ưu đãi vé", slug: "uu-dai-ve" }
];

export const MOCK_LINKED_EVENTS = [
  {
    id: "1",
    name: "Hòa Nhạc Mùa Hè 2026 - Symphony of Sunset",
    description: "Đêm nhạc giao hưởng ngoài trời hoành tráng với sự tham gia của dàn nhạc danh tiếng và các nghệ sĩ hàng đầu Việt Nam. Một không gian nghệ thuật âm thanh vòm đỉnh cao đưa khán giả hòa mình vào giai điệu lãng mạn.",
    terms: "Vé đã mua không hỗ trợ hoàn tiền sau khi sự kiện diễn ra. Vui lòng có mặt trước giờ mở màn 30 phút.",
    province: "TP. Hồ Chí Minh",
    provinceName: "TP. Hồ Chí Minh",
    address: "Nhà hát Hòa Bình, 240 Đường 3 Tháng 2, Phường 12, Quận 10",
    status: "OPENING",
    categoryId: 1,
    startTime: "2026-07-15T19:00:00",
    imageUrls: ["https://images.unsplash.com/photo-1465847899084-d164df4dedc6?q=80&w=1200&auto=format&fit=crop"],
    ticketTypes: [
      { id: 101, name: "Vé Tiêu Chuẩn (Standard)", price: 350000, availableQuantity: 150, saleEndDate: "2026-07-14T23:59:59" },
      { id: 102, name: "Vé VIP (Fanzone & Quà tặng)", price: 850000, availableQuantity: 40, saleEndDate: "2026-07-14T23:59:59" }
    ]
  },
  {
    id: "2",
    name: "Tech Innovators Summit 2026",
    description: "Hội nghị công nghệ và trí tuệ nhân tạo quy tụ hơn 50 diễn giả quốc tế và 2,000 chuyên gia trong ngành. Cập nhật các xu hướng Agentic AI, Autonomous Workflows và Cloud Native.",
    terms: "Yêu cầu mang theo thẻ căn cước hoặc vé QR điện tử để làm thủ tục nhận badge tham dự.",
    province: "Hà Nội",
    provinceName: "Hà Nội",
    address: "Trung tâm Hội nghị Quốc gia, Cổng 1 Đại Lộ Thăng Long",
    status: "OPENING",
    categoryId: 2,
    startTime: "2026-08-20T08:30:00",
    imageUrls: ["https://images.unsplash.com/photo-1540575467063-178a50c2df87?q=80&w=1200&auto=format&fit=crop"],
    ticketTypes: [
      { id: 201, name: "Vé Early Bird (Giờ Vàng)", price: 500000, availableQuantity: 200, saleEndDate: "2026-08-10T23:59:59" },
      { id: 202, name: "Vé All-Access Pass (VIP)", price: 1200000, availableQuantity: 80, saleEndDate: "2026-08-19T23:59:59" }
    ]
  },
  {
    id: "3",
    name: "Giải Chạy Marathon Quốc Tế - Coastal Run 2026",
    description: "Cung đường chạy ven biển đẹp nhất Việt Nam với các cự ly 5km, 10km, 21km và 42km. Đón bình minh tuyệt đẹp trên cung đường biển miền Trung cùng hàng nghìn vận động viên.",
    terms: "Vận động viên cần ký cam kết sức khỏe trước ngày nhận race-kit.",
    province: "Đà Nẵng",
    provinceName: "Đà Nẵng",
    address: "Công viên Biển Đông, Đường Võ Nguyên Giáp",
    status: "OPENING",
    categoryId: 3,
    startTime: "2026-09-05T05:00:00",
    imageUrls: ["https://images.unsplash.com/photo-1530549387789-4c1017266635?q=80&w=1200&auto=format&fit=crop"],
    ticketTypes: [
      { id: 301, name: "Cự ly 10km Chạy Phong Trào", price: 450000, availableQuantity: 500, saleEndDate: "2026-08-30T23:59:59" },
      { id: 302, name: "Cự ly 21km Half-Marathon", price: 750000, availableQuantity: 300, saleEndDate: "2026-08-30T23:59:59" }
    ]
  },
  {
    id: "4",
    name: "Lễ Hội Ẩm Thực Đường Phố & Giao Lưu Văn Hóa",
    description: "Khám phá hơn 100 gian hàng ẩm thực đặc sắc từ 10 quốc gia châu Á cùng các tiết mục nghệ thuật đường phố hấp dẫn.",
    terms: "Vé bao gồm 01 coupon thưởng thức món ăn đặc biệt tại khu trung tâm.",
    province: "TP. Hồ Chí Minh",
    provinceName: "TP. Hồ Chí Minh",
    address: "Khu đô thị Sala, TP. Thủ Đức",
    status: "UPCOMING",
    categoryId: 5,
    startTime: "2026-10-10T16:00:00",
    imageUrls: ["https://images.unsplash.com/photo-1555396273-367ea4eb4db5?q=80&w=1200&auto=format&fit=crop"],
    ticketTypes: [
      { id: 401, name: "Vé Vào Cửa Thường", price: 150000, availableQuantity: 1000, saleEndDate: "2026-10-09T23:59:59" }
    ]
  },
  {
    id: "5",
    name: "Workshop Thiết Kế Sản Phẩm & Trải Nghiệm Người Dùng (UI/UX)",
    description: "Khóa học thực chiến 1 ngày cùng các chuyên gia hàng đầu về Design System, Figma và tư duy thiết kế trải nghiệm người dùng lấy khách hàng làm trung tâm.",
    terms: "Học viên cần mang theo laptop cá nhân đã cài sẵn Figma.",
    province: "Hà Nội",
    provinceName: "Hà Nội",
    address: "Toong Coworking Space, Tràng Thi, Hoàn Kiếm",
    status: "OPENING",
    categoryId: 4,
    startTime: "2026-07-28T09:00:00",
    imageUrls: ["https://images.unsplash.com/photo-1531403009284-440f080d1e12?q=80&w=1200&auto=format&fit=crop"],
    ticketTypes: [
      { id: 501, name: "Vé Tham Dự Trực Tiếp", price: 650000, availableQuantity: 35, saleEndDate: "2026-07-27T18:00:00" }
    ]
  }
];

export const MOCK_BLOG_POSTS = [
  {
    id: 1,
    title: "Bùng Nổ Cảm Xúc Cùng Đại Nhạc Hội Symphony of Sunset 2026",
    slug: "bung-no-cam-xuc-cung-dai-nhac-hoi-symphony-of-sunset-2026",
    summary: "Đại nhạc hội mùa hè chính thức mở cổng bán vé sớm với loạt ưu đãi hấp dẫn dành riêng cho cộng đồng yêu âm nhạc giao hưởng hiện đại.",
    content: `
      <p>Sau nhiều tháng ấp ủ, ban tổ chức chính thức công bố đại nhạc hội <strong>Symphony of Sunset 2026</strong> – sự kiện âm nhạc ngoài trời được mong chờ nhất mùa hè năm nay. Với sự kết hợp đột phá giữa dàn nhạc giao hưởng cổ điển và âm nhạc điện tử hiện đại, chương trình hứa hẹn sẽ mang đến không gian nghệ thuật đa giác quan mãn nhãn.</p>
      
      <h3>1. Những điểm nhấn không thể bỏ lỡ</h3>
      <ul>
        <li><strong>Sân khấu 360 độ:</strong> Thiết kế âm thanh vòm đỉnh cao đưa khán giả đắm chìm trong từng giai điệu.</li>
        <li><strong>Dàn nghệ sĩ khách mời quốc tế:</strong> Sự góp mặt của những tên tuổi lớn trong làng nhạc thính phòng đương đại.</li>
        <li><strong>Trải nghiệm ẩm thực & workshop bên lề:</strong> Khu vực lễ hội mở cửa từ 15:00 với nhiều hoạt động giải trí độc đáo.</li>
      </ul>

      <p>Đặc biệt, vé sớm (Early Bird) sẽ chính thức mở bán trên hệ thống với số lượng giới hạn. Khán giả hãy nhanh tay đặt vé ngay hôm nay để nhận trọn bộ quà tặng lưu niệm độc quyền!</p>
    `,
    thumbnail: "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?q=80&w=1200&auto=format&fit=crop",
    authorName: "Ban Tổ Chức Sunset Fest",
    publishedAt: "2026-04-18T10:00:00",
    tags: [{ id: 1, name: "Âm nhạc" }, { id: 6, name: "Ưu đãi vé" }],
    eventIds: ["1"]
  },
  {
    id: 2,
    title: "Xu Hướng AI & Công Nghệ Mới Tại Tech Innovators Summit 2026",
    slug: "xu-huong-ai-cong-nghe-moi-tai-tech-innovators-summit-2026",
    summary: "Khám phá bức tranh tương lai của Generative AI và ứng dụng thực tiễn trong doanh nghiệp cùng dàn chuyên gia công nghệ đầu ngành.",
    content: `
      <p>Năm 2026 đánh dấu bước chuyển mình mạnh mẽ của kỷ nguyên trí tuệ nhân tạo tự động hóa (Autonomous AI). <strong>Tech Innovators Summit 2026</strong> là diễn đàn quy mô lớn kết nối các nhà sáng lập, kỹ sư phần mềm, và lãnh đạo doanh nghiệp nhằm thảo luận về cơ hội cũng như thách thức công nghệ trong thập kỷ tới.</p>
      
      <h3>Nội dung chương trình nổi bật:</h3>
      <ul>
        <li>Keynote: Agentic AI và bước nhảy vọt trong tự động hóa quy trình nghiệp vụ.</li>
        <li>Panel Discussion: An toàn thông tin và đạo đức AI trong kỷ nguyên số.</li>
        <li>Khu vực triển lãm Tech Expo: Trải nghiệm hơn 100 sản phẩm công nghệ đột phá.</li>
      </ul>

      <p>Chỉ còn vài tuần trước khi sự kiện chính thức diễn ra. Đăng ký vé sớm để bảo đảm vị trí tham dự các phiên hội thảo chuyên sâu!</p>
    `,
    thumbnail: "https://images.unsplash.com/photo-1540575467063-178a50c2df87?q=80&w=1200&auto=format&fit=crop",
    authorName: "Hội Đồng Công Nghệ TechX",
    publishedAt: "2026-04-15T14:30:00",
    tags: [{ id: 4, name: "Công nghệ" }, { id: 2, name: "Workshop" }],
    eventIds: ["2"]
  },
  {
    id: 3,
    title: "Chinh Phục Cung Đường Ven Biển Cùng Coastal Run Marathon 2026",
    slug: "chinh-phuc-cung-duong-ven-bien-cung-coastal-run-marathon-2026",
    summary: "Giải chạy thường niên quy tụ hàng nghìn chân chạy khám phá vẻ đẹp bình minh trên cung đường biển miền Trung tuyệt sắc.",
    content: `
      <p><strong>Coastal Run Marathon 2026</strong> chính thức trở lại với cung đường chạy hoàn toàn mới, đưa các vận động viên băng qua những bãi biển thơ mộng và đón tia nắng bình minh đầu tiên của ngày mới.</p>
      
      <p>Giải chạy chia thành 4 cự ly: 5km dành cho người mới bắt đầu và gia đình, 10km phong trào, 21km bán marathon và 42km full marathon dành cho các chân chạy chuyên nghiệp. Toàn bộ race-kit sẽ bao gồm áo đấu kỷ niệm, bib có gắn chip tính giờ điện tử và huy chương hoàn thành thiết kế tinh xảo.</p>
    `,
    thumbnail: "https://images.unsplash.com/photo-1530549387789-4c1017266635?q=80&w=1200&auto=format&fit=crop",
    authorName: "CLB Điền Kinh Việt Nam",
    publishedAt: "2026-04-12T09:00:00",
    tags: [{ id: 3, name: "Thể thao" }],
    eventIds: ["3"]
  },
  {
    id: 4,
    title: "Bí Quyết Săn Vé Sự Kiện Hot Không Lo Nghẽn Mạng",
    slug: "bi-quyet-san-ve-su-kien-hot-khong-lo-nghen-mang",
    summary: "Những mẹo cực hữu ích giúp bạn tối ưu tốc độ đặt vé, thanh toán thành công ngay trong những phút đầu tiên mở bán.",
    content: `
      <p>Các concert lớn hoặc sự kiện thể thao nổi tiếng thường hết vé chỉ sau vài phút mở bán. Để không bỏ lỡ cơ hội, người dùng cần nắm vững những kinh nghiệm sau:</p>
      <ol>
        <li><strong>Đăng nhập và cập nhật hồ sơ trước giờ mở bán:</strong> Đảm bảo thông tin họ tên, số điện thoại, email nhận vé đã chính xác.</li>
        <li><strong>Chuẩn bị sẵn sàng phương thức thanh toán:</strong> Nạp sẵn tiền vào thẻ hoặc tài khoản ngân hàng điện tử.</li>
        <li><strong>Kiểm tra đường truyền internet:</strong> Dùng kết nối mạng dây hoặc Wi-Fi ổn định, tránh mạng công cộng chập chờn.</li>
      </ol>
    `,
    thumbnail: "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?q=80&w=1200&auto=format&fit=crop",
    authorName: "Đội Ngũ Hỗ Trợ Khách Hàng",
    publishedAt: "2026-04-08T16:00:00",
    tags: [{ id: 6, name: "Ưu đãi vé" }],
    eventIds: ["1", "2"]
  }
];

export const MOCK_BOOKINGS = [
  {
    id: "ORD-2026-001",
    bookingCode: "BK2026041801",
    createdAt: "2026-04-10T14:30:00",
    status: "PAID",
    totalAmount: 700000,
    paymentMethod: "PAYOS",
    eventName: "Hòa Nhạc Mùa Hè 2026 - Symphony of Sunset",
    startTime: "2026-07-15T19:00:00",
    location: "Nhà hát Hòa Bình, TP. Hồ Chí Minh",
    eventImage: "https://images.unsplash.com/photo-1465847899084-d164df4dedc6?q=80&w=600&auto=format&fit=crop",
    tickets: [
      {
        ticketCode: "TK-SUNSET-88219",
        ticketTypeName: "Vé Tiêu Chuẩn (Standard)",
        price: 350000,
        seatNumber: "A-12",
        qrCode: "https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=TK-SUNSET-88219"
      },
      {
        ticketCode: "TK-SUNSET-88220",
        ticketTypeName: "Vé Tiêu Chuẩn (Standard)",
        price: 350000,
        seatNumber: "A-13",
        qrCode: "https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=TK-SUNSET-88220"
      }
    ]
  },
  {
    id: "ORD-2026-002",
    bookingCode: "BK2026041502",
    createdAt: "2026-04-12T09:15:00",
    status: "PAID",
    totalAmount: 500000,
    paymentMethod: "MOMO",
    eventName: "Tech Innovators Summit 2026",
    startTime: "2026-08-20T08:30:00",
    location: "Trung tâm Hội nghị Quốc gia, Hà Nội",
    eventImage: "https://images.unsplash.com/photo-1540575467063-178a50c2df87?q=80&w=600&auto=format&fit=crop",
    tickets: [
      {
        ticketCode: "TK-TECH-99120",
        ticketTypeName: "Vé Early Bird (Giờ Vàng)",
        price: 500000,
        seatNumber: "Tự do",
        qrCode: "https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=TK-TECH-99120"
      }
    ]
  }
];

export const MOCK_VOUCHERS = [
  {
    id: "VC1",
    code: "WELCOME50",
    name: "Giảm giá người mới",
    discountType: "FIXED",
    amount: 50000,
    minOrderAmount: 200000,
    description: "Giảm trực tiếp 50.000đ cho đơn hàng từ 200.000đ"
  },
  {
    id: "VC2",
    code: "SUMMER10",
    name: "Ưu đãi mùa hè",
    discountType: "PERCENT",
    amount: 10,
    maxDiscount: 100000,
    minOrderAmount: 300000,
    description: "Giảm 10% tối đa 100.000đ"
  }
];

// Helper lưu giỏ hàng offline vào localStorage
const CART_STORAGE_KEY = "mock_cart_items";

export const getStoredMockCart = () => {
  try {
    const raw = localStorage.getItem(CART_STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
};

export const saveStoredMockCart = (items) => {
  localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
};
