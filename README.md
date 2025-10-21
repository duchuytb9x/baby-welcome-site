# Baby Welcome Site - Phan Trúc Linh & Phan Hạ Linh

Website chào mừng cặp song sinh với backend API để quản lý lời chúc và ảnh.

## Cài đặt và chạy

### 1. Cài đặt dependencies
```bash
npm install
```

### 2. Chạy cả frontend và backend
```bash
npm run dev
```

Lệnh này sẽ chạy đồng thời:
- Backend server tại: http://localhost:5555
- Frontend React tại: http://localhost:3000

### 3. Chạy riêng lẻ

**Chỉ chạy backend:**
```bash
npm run server
```

**Chỉ chạy frontend:**
```bash
npm start
```

## API Endpoints

### GET /api/wishes
Lấy tất cả lời chúc
```bash
curl http://localhost:5555/api/wishes
```

### POST /api/wishes
Thêm lời chúc mới
```bash
curl -X POST http://localhost:5555/api/wishes \
  -H "Content-Type: application/json" \
  -d '{"name": "Tên người", "message": "Lời chúc"}'
```

### GET /api/images/:babyName
Lấy danh sách ảnh của bé (Tit hoặc Mit)
```bash
curl http://localhost:5555/api/images/Tit
curl http://localhost:5555/api/images/Mit
```

### DELETE /api/wishes/:index
Xóa lời chúc theo index
```bash
curl -X DELETE http://localhost:5555/api/wishes/0
```

## Cấu trúc dự án

```
baby-welcome-site/
├── server.js              # Backend Express server
├── data/
│   └── wishes.json        # File lưu trữ lời chúc (tự động tạo)
├── public/
│   └── images/
│       ├── Tit/           # Thư mục ảnh của bé Tit (Phan Trúc Linh)
│       └── Mit/           # Thư mục ảnh của bé Mit (Phan Hạ Linh)
├── src/
│   └── components/
│       └── BabyWelcomeSite.jsx  # Frontend React component
└── package.json
```

## Quản lý ảnh

### Thêm ảnh cho bé:
1. **Bé Tit (Phan Trúc Linh)**: Thêm ảnh vào thư mục `public/images/Tit/`
2. **Bé Mit (Phan Hạ Linh)**: Thêm ảnh vào thư mục `public/images/Mit/`

### Định dạng ảnh hỗ trợ:
- JPG/JPEG
- PNG
- GIF
- WebP

### Cách hoạt động:
- Ảnh đầu tiên trong thư mục sẽ làm ảnh đại diện
- Tất cả ảnh trong thư mục sẽ hiển thị trong gallery
- Ảnh được sắp xếp theo tên file
- Nếu không có ảnh, sẽ hiển thị placeholder

## Tính năng

- ✅ Hiển thị thông tin cặp song sinh
- ✅ Sổ lưu bút với lời chúc
- ✅ Thêm lời chúc mới (lưu vào backend)
- ✅ Load lời chúc từ backend
- ✅ Quản lý ảnh động từ thư mục
- ✅ Ảnh đại diện tự động (ảnh đầu tiên)
- ✅ Gallery hiển thị tất cả ảnh
- ✅ Hiệu ứng confetti và nhạc nền
- ✅ Chia sẻ mạng xã hội
- ✅ Responsive design
- ✅ Bảo mật XSS protection
- ✅ Rate limiting
- ✅ Input validation

## Bảo mật

- 🔒 **XSS Protection**: DOMPurify sanitization
- 🛡️ **Rate Limiting**: Giới hạn requests
- ✅ **Input Validation**: Kiểm tra dữ liệu đầu vào
- 🔐 **Security Headers**: Helmet middleware
- 📏 **Payload Limits**: Giới hạn kích thước request

## Lưu ý

- Backend server cần chạy trước khi frontend có thể load dữ liệu
- Dữ liệu lời chúc được lưu trong file `data/wishes.json`
- Ảnh được serve từ thư mục `public/images/`
- File `data/wishes.json` sẽ được tạo tự động khi chạy server lần đầu