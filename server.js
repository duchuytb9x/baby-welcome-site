const express = require('express');
const cors = require('cors');
const fs = require('fs').promises;
const path = require('path');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const { body, validationResult } = require('express-validator');
const app = express();
const PORT = process.env.PORT || 5555;

// cho dev local + domain production (chỉ whitelist origin cần thiết)
app.use(cors({ origin: ['http://localhost:3000', 'http://127.0.0.1:3000', 'https://songlinh.online'], credentials: true }));
app.use(express.json());

// xử lý preflight
app.options('*', cors());
// ...existing code...

// Security Middleware
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
    },
  },
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Quá nhiều requests từ IP này, vui lòng thử lại sau 15 phút.'
});

const postLimiter = rateLimit({
  windowMs: 5 * 60 * 1000, // 5 minutes
  max: 10, // limit each IP to 10 POST requests per 5 minutes
  message: 'Quá nhiều lời chúc từ IP này, vui lòng thử lại sau 5 phút.'
});

app.use(limiter);
app.use(express.json({ limit: '1mb' })); // Limit JSON payload size

// Serve static images
app.use('/images', express.static(path.join(__dirname, 'public', 'images')));

// Đường dẫn đến file lưu trữ lời chúc
const WISHES_FILE = path.join(__dirname, 'data', 'wishes.json');

// Đảm bảo thư mục data tồn tại
const ensureDataDir = async () => {
  const dataDir = path.dirname(WISHES_FILE);
  try {
    await fs.access(dataDir);
  } catch {
    await fs.mkdir(dataDir, { recursive: true });
  }
};

// Khởi tạo file wishes.json nếu chưa có
const initWishesFile = async () => {
  try {
    await fs.access(WISHES_FILE);
  } catch {
    const initialWishes = [
      {
        name: "Mẹ",
        message: "Chào mừng hai thiên thần Phan Trúc Linh và Phan Hạ Linh! 💖",
        time: "2 giờ trước"
      },
      {
        name: "Bố",
        message: "Hai con Phan Trúc Linh và Phan Hạ Linh là niềm hạnh phúc lớn nhất của bố mẹ! 👨‍👩‍👧‍👦",
        time: "1 giờ trước"
      },
      {
        name: "Bà nội",
        message: "Cháu ngoan Phan Trúc Linh và Phan Hạ Linh của bà! 🥰",
        time: "30 phút trước"
      }
    ];
    await fs.writeFile(WISHES_FILE, JSON.stringify(initialWishes, null, 2));
  }
};

// API Routes

// Lấy danh sách ảnh từ thư mục
app.get('/api/images/:babyName', async (req, res) => {
  try {
    const babyName = req.params.babyName;
    const imageDir = path.join(__dirname, 'public', 'images', babyName);
    
    // Kiểm tra thư mục có tồn tại không
    try {
      await fs.access(imageDir);
    } catch {
      return res.json([]);
    }
    
    const files = await fs.readdir(imageDir);
    const imageFiles = files.filter(file => {
      const ext = path.extname(file).toLowerCase();
      return ['.jpg', '.jpeg', '.png', '.gif', '.webp'].includes(ext);
    });
    
    // Sắp xếp theo tên file
    imageFiles.sort();
    
    // Tạo URL cho từng ảnh (encode tên file để xử lý dấu cách và ký tự đặc biệt)
    const imageUrls = imageFiles.map(file => `/images/${babyName}/${encodeURIComponent(file)}`);
    
    res.json(imageUrls);
  } catch (error) {
    console.error('Error reading images:', error);
    res.status(500).json({ error: 'Không thể đọc ảnh' });
  }
});

// Lấy tất cả lời chúc
app.get('/api/wishes', async (req, res) => {
  try {
    const data = await fs.readFile(WISHES_FILE, 'utf8');
    const wishes = JSON.parse(data);
    res.json(wishes);
  } catch (error) {
    console.error('Error reading wishes:', error);
    res.status(500).json({ error: 'Không thể đọc lời chúc' });
  }
});

// Validation middleware
const wishValidation = [
  body('name')
    .trim()
    .isLength({ min: 1, max: 50 })
    .withMessage('Tên phải có từ 1-50 ký tự')
    .matches(/^[a-zA-ZÀ-ỹ0-9\s.,!?-]+$/)
    .withMessage('Tên chỉ được chứa chữ cái, số và một số ký tự đặc biệt'),
  body('message')
    .trim()
    .isLength({ min: 1, max: 500 })
    .withMessage('Lời chúc phải có từ 1-500 ký tự')
    .matches(/^[a-zA-ZÀ-ỹ0-9\s.,!?@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/~`\u{1F600}-\u{1F64F}\u{1F300}-\u{1F5FF}\u{1F680}-\u{1F6FF}\u{1F1E0}-\u{1F1FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}]+$/u)
    .withMessage('Lời chúc chứa ký tự không hợp lệ')
];

// Thêm lời chúc mới
app.post('/api/wishes', postLimiter, wishValidation, async (req, res) => {
  try {
    // Kiểm tra validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        error: 'Dữ liệu không hợp lệ', 
        details: errors.array() 
      });
    }

    const { name, message } = req.body;
    
    // Sanitize input (loại bỏ HTML tags và script)
    const sanitizedName = name.replace(/<[^>]*>/g, '').trim();
    const sanitizedMessage = message.replace(/<[^>]*>/g, '').trim();

    const newWish = {
      name: sanitizedName,
      message: sanitizedMessage,
      time: "Vừa xong"
    };

    // Đọc lời chúc hiện tại
    const data = await fs.readFile(WISHES_FILE, 'utf8');
    const wishes = JSON.parse(data);
    
    // Giới hạn số lượng lời chúc tối đa
    if (wishes.length >= 1000) {
      return res.status(429).json({ error: 'Đã đạt giới hạn số lượng lời chúc' });
    }
    
    // Thêm lời chúc mới vào cuối danh sách
    wishes.push(newWish);
    
    // Lưu lại file
    await fs.writeFile(WISHES_FILE, JSON.stringify(wishes, null, 2));
    
    res.json({ success: true, wish: newWish });
  } catch (error) {
    console.error('Error adding wish:', error);
    res.status(500).json({ error: 'Không thể thêm lời chúc' });
  }
});

// Xóa lời chúc (tùy chọn)
app.delete('/api/wishes/:index', async (req, res) => {
  try {
    const index = parseInt(req.params.index);
    
    const data = await fs.readFile(WISHES_FILE, 'utf8');
    const wishes = JSON.parse(data);
    
    if (index < 0 || index >= wishes.length) {
      return res.status(400).json({ error: 'Lời chúc không tồn tại' });
    }
    
    wishes.splice(index, 1);
    await fs.writeFile(WISHES_FILE, JSON.stringify(wishes, null, 2));
    
    res.json({ success: true });
  } catch (error) {
    console.error('Error deleting wish:', error);
    res.status(500).json({ error: 'Không thể xóa lời chúc' });
  }
});

// Khởi động server
const startServer = async () => {
  await ensureDataDir();
  await initWishesFile();
  
  app.listen(PORT, () => {
    console.log(`🚀 Backend server đang chạy tại http://localhost:${PORT}`);
    console.log(`📝 API endpoints:`);
    console.log(`   GET  /api/wishes - Lấy tất cả lời chúc`);
    console.log(`   POST /api/wishes - Thêm lời chúc mới`);
    console.log(`   DELETE /api/wishes/:index - Xóa lời chúc`);
  });
};

startServer().catch(console.error);
