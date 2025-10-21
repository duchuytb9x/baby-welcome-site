import React, { useState, useEffect } from "react";
import { Card, CardContent } from "./ui/card";
import { Button } from "./ui/button";
import { motion } from "framer-motion";
import { createPortal } from "react-dom";
import DOMPurify from "dompurify";

export default function BabyWelcomeSite() {
  const twins = [
    {
      name: "Phan Trúc Linh",
      nickname: "Tit",
      bornAt: "22/10/2025",
      weight: "2.5 kg",
      height: "50 cm",
      hospital: "Bệnh viện Phụ sản Hà Nội",
      image: "https://i.pinimg.com/736x/05/44/2c/05442ce313dba17776639cfadef49cfc.jpg",
      photos: [
        "https://i.pinimg.com/736x/05/44/2c/05442ce313dba17776639cfadef49cfc.jpg",
        "https://i.pinimg.com/736x/05/44/2c/05442ce313dba17776639cfadef49cfc.jpg",
        "https://i.pinimg.com/736x/05/44/2c/05442ce313dba17776639cfadef49cfc.jpg"
      ]
    },
    {
      name: "Phan Hạ Linh", 
      bornAt: "22/10/2025",
      weight: "2.5 kg",
      height: "50 cm",
      hospital: "Bệnh viện Phụ sản Hà Nội",
      image: "https://i.pinimg.com/736x/05/44/2c/05442ce313dba17776639cfadef49cfc.jpg",
      photos: [
        "https://i.pinimg.com/736x/05/44/2c/05442ce313dba17776639cfadef49cfc.jpg",
        "https://i.pinimg.com/736x/05/44/2c/05442ce313dba17776639cfadef49cfc.jpg",
        "https://i.pinimg.com/736x/05/44/2c/05442ce313dba17776639cfadef49cfc.jpg"
      ]
    },
  ];

  // State management
  const [audio] = useState(() =>
    new Audio(
      "https://cdn.pixabay.com/download/audio/2025/07/24/audio_9a0fe08f86.mp3?filename=little-alicia-dramatic-background-music-for-video-stories-short-ver-379556.mp3"
    )
  );
  const [hasPlayed, setHasPlayed] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [showConfetti, setShowConfetti] = useState(true);
  const [selectedBaby, setSelectedBaby] = useState(null);
  const [showGallery, setShowGallery] = useState(false);
  const [guestbookMessages, setGuestbookMessages] = useState([]);
  const [newMessage, setNewMessage] = useState({ name: "", message: "" });
  const [loading, setLoading] = useState(true);
  const [showSuccessNotification, setShowSuccessNotification] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [babyImages, setBabyImages] = useState({ Tit: [], Mit: [] });
  
  useEffect(() => {
    // Load lời chúc và ảnh từ backend
    const loadData = async () => {
      try {
        // Load lời chúc
        const wishesResponse = await fetch('http://localhost:5555/api/wishes');
        if (wishesResponse.ok) {
          const wishes = await wishesResponse.json();
          setGuestbookMessages(wishes);
        } else {
          console.error('Không thể load lời chúc từ server');
        }

        // Load ảnh cho cả 2 bé
        const [titImagesResponse, mitImagesResponse] = await Promise.all([
          fetch('http://localhost:5555/api/images/Tit'),
          fetch('http://localhost:5555/api/images/Mit')
        ]);

        const titImages = titImagesResponse.ok ? await titImagesResponse.json() : [];
        const mitImages = mitImagesResponse.ok ? await mitImagesResponse.json() : [];

        //setBabyImages({ Tit: titImages, Mit: mitImages });
      } catch (error) {
        console.error('Lỗi khi load dữ liệu:', error);
      } finally {
        setLoading(false);
      }
    };

    loadData();

    // Tự động phát nhạc khi vào màn chi tiết
    audio.volume = 0.5;
    audio.play()
      .then(() => {
        setHasPlayed(true);
        setIsPlaying(true);
      })
      .catch(() => {
        // Nếu bị chặn tự động phát, không làm gì, tránh hiện lỗi
      });
    // Dọn dẹp khi rời khỏi
    return () => {
      audio.pause();
      audio.currentTime = 0;
    };
  }, [audio]);

  // Chặn chuột phải và F12
  useEffect(() => {
    const handleContextMenu = (e) => {
      e.preventDefault();
      return false;
    };

    const handleKeyDown = (e) => {
      // Chặn F12
      if (e.key === 'F12') {
        e.preventDefault();
        return false;
      }
      
      // Chặn Ctrl+Shift+I (Developer Tools)
      if (e.ctrlKey && e.shiftKey && e.key === 'I') {
        e.preventDefault();
        return false;
      }
      
      // Chặn Ctrl+Shift+C (Developer Tools)
      if (e.ctrlKey && e.shiftKey && e.key === 'C') {
        e.preventDefault();
        return false;
      }
      
      // Chặn Ctrl+U (View Source)
      if (e.ctrlKey && e.key === 'u') {
        e.preventDefault();
        return false;
      }
    };

    document.addEventListener('contextmenu', handleContextMenu);
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('contextmenu', handleContextMenu);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  const playAudio = () => {
    audio.volume = 0.5;
    audio.play()
      .then(() => {
        setHasPlayed(true);
        setIsPlaying(true);
      })
      .catch(() => {});
  };

  const stopAudio = () => {
    audio.pause();
    setIsPlaying(false);
  };

  // Function để sanitize input
  const sanitizeInput = (input) => {
    return DOMPurify.sanitize(input, { 
      ALLOWED_TAGS: ['b', 'i', 'em', 'strong', 'br'], // Chỉ cho phép một số tag cơ bản
      ALLOWED_ATTR: [] // Không cho phép attributes
    });
  };

  const addGuestbookMessage = async () => {
    if (newMessage.name && newMessage.message) {
      setIsSubmitting(true);
      
      // Sanitize input trước khi gửi
      const sanitizedName = sanitizeInput(newMessage.name.trim());
      const sanitizedMessage = sanitizeInput(newMessage.message.trim());
      
      if (!sanitizedName || !sanitizedMessage) {
        alert('Tên và lời chúc không được để trống hoặc chỉ chứa ký tự đặc biệt');
        setIsSubmitting(false);
        return;
      }

      try {
        const response = await fetch('http://localhost:5555/api/wishes', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            name: sanitizedName,
            message: sanitizedMessage
          })
        });

        if (response.ok) {
          const result = await response.json();
          // Thêm lời chúc mới vào cuối danh sách
          setGuestbookMessages([...guestbookMessages, result.wish]);
          setNewMessage({ name: "", message: "" });
          
          // Hiển thị thông báo thành công
          setShowSuccessNotification(true);
          
          // Tự động ẩn thông báo sau 3 giây
          setTimeout(() => {
            setShowSuccessNotification(false);
          }, 3000);
        } else {
          const errorData = await response.json();
          alert(`Lỗi: ${errorData.error || 'Không thể gửi lời chúc'}`);
        }
      } catch (error) {
        console.error('Lỗi khi gửi lời chúc:', error);
        alert('Lỗi kết nối. Vui lòng thử lại sau.');
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  const shareOnSocial = (platform) => {
    const text = "Chào mừng cặp song sinh Phan Trúc Linh và Phan Hạ Linh! 👶👶";
    const url = window.location.href;
    
    const shareUrls = {
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`,
      twitter: `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`,
      whatsapp: `https://wa.me/?text=${encodeURIComponent(text + ' ' + url)}`
    };
    
    window.open(shareUrls[platform], '_blank');
  };

  return (
    <>
      {/* Success Notification */}
      {showSuccessNotification && createPortal(
        <motion.div
          className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50 bg-green-500 text-white px-6 py-4 rounded-2xl shadow-2xl border-2 border-green-300"
          initial={{ opacity: 0, y: -50, scale: 0.8 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -50, scale: 0.8 }}
          transition={{ duration: 0.5, type: "spring", stiffness: 300 }}
        >
          <div className="flex items-center space-x-3">
            <div className="text-2xl">✅</div>
            <div>
              <div className="font-bold text-lg">Thành công!</div>
              <div className="text-sm">Lời chúc của bạn đã được gửi thành công! 💖</div>
            </div>
          </div>
        </motion.div>,
        document.body
      )}

      {/* Confetti Effect - Render trực tiếp vào body */}
      {showConfetti && createPortal(
        <div 
          className="fixed inset-0 pointer-events-none" 
          style={{ 
            zIndex: 2147483647, 
            position: 'fixed !important',
            top: '0 !important',
            left: '0 !important',
            right: '0 !important',
            bottom: '0 !important'
          }}
        >
          {/* Confetti tròn */}
          {[...Array(100)].map((_, i) => (
            <motion.div
              key={`circle-${i}`}
              className="absolute rounded-full"
              style={{
                width: `${Math.random() * 8 + 4}px`,
                height: `${Math.random() * 8 + 4}px`,
                left: `${Math.random() * 100}%`,
                backgroundColor: ['#ff69b4', '#ffb6c1', '#ffc0cb', '#ff1493', '#ff69b4', '#ff1493', '#ff69b4'][Math.floor(Math.random() * 7)]
              }}
              initial={{ 
                x: Math.random() * window.innerWidth,
                y: window.innerHeight + 10,
                rotate: 0
              }}
              animate={{
                y: -10,
                rotate: 360,
                x: Math.random() * window.innerWidth
              }}
              transition={{
                duration: Math.random() * 3 + 2,
                repeat: Infinity,
                ease: "linear"
              }}
            />
          ))}

          {/* Confetti vuông */}
          {[...Array(50)].map((_, i) => (
            <motion.div
              key={`square-${i}`}
              className="absolute"
              style={{
                width: `${Math.random() * 10 + 5}px`,
                height: `${Math.random() * 10 + 5}px`,
                left: `${Math.random() * 100}%`,
                backgroundColor: ['#c084fc', '#a855f7', '#8b5cf6', '#7c3aed', '#6d28d9'][Math.floor(Math.random() * 5)]
              }}
              initial={{ 
                x: Math.random() * window.innerWidth,
                y: window.innerHeight + 10,
                rotate: 0
              }}
              animate={{
                y: -10,
                rotate: 720,
                x: Math.random() * window.innerWidth
              }}
              transition={{
                duration: Math.random() * 4 + 3,
                repeat: Infinity,
                ease: "linear"
              }}
            />
          ))}

          {/* Confetti tam giác */}
          {[...Array(30)].map((_, i) => (
            <motion.div
              key={`triangle-${i}`}
              className="absolute"
              style={{
                width: 0,
                height: 0,
                left: `${Math.random() * 100}%`,
                borderLeft: '6px solid transparent',
                borderRight: '6px solid transparent',
                borderBottom: '12px solid',
                borderBottomColor: ['#fde047', '#facc15', '#eab308', '#ca8a04', '#a16207'][Math.floor(Math.random() * 5)]
              }}
              initial={{ 
                x: Math.random() * window.innerWidth,
                y: window.innerHeight + 10,
                rotate: 0
              }}
              animate={{
                y: -10,
                rotate: 540,
                x: Math.random() * window.innerWidth
              }}
              transition={{
                duration: Math.random() * 5 + 4,
                repeat: Infinity,
                ease: "linear"
              }}
            />
          ))}

          {/* Confetti hình thoi */}
          {[...Array(25)].map((_, i) => (
            <motion.div
              key={`diamond-${i}`}
              className="absolute"
              style={{
                width: `${Math.random() * 12 + 6}px`,
                height: `${Math.random() * 12 + 6}px`,
                left: `${Math.random() * 100}%`,
                backgroundColor: ['#10b981', '#059669', '#047857', '#065f46', '#064e3b'][Math.floor(Math.random() * 5)],
                transform: 'rotate(45deg)'
              }}
              initial={{ 
                x: Math.random() * window.innerWidth,
                y: window.innerHeight + 10,
                rotate: 45
              }}
              animate={{
                y: -10,
                rotate: 405,
                x: Math.random() * window.innerWidth
              }}
              transition={{
                duration: Math.random() * 4 + 3,
                repeat: Infinity,
                ease: "linear"
              }}
            />
          ))}

          {/* Confetti ngôi sao */}
          {[...Array(20)].map((_, i) => (
            <motion.div
              key={`star-${i}`}
              className="absolute text-lg"
              style={{
                left: `${Math.random() * 100}%`,
                color: ['#fbbf24', '#f59e0b', '#d97706', '#b45309', '#92400e'][Math.floor(Math.random() * 5)]
              }}
              initial={{ 
                x: Math.random() * window.innerWidth,
                y: window.innerHeight + 10,
                rotate: 0,
                scale: 0.5
              }}
              animate={{
                y: -10,
                rotate: 360,
                x: Math.random() * window.innerWidth,
                scale: [0.5, 1.2, 0.5]
              }}
              transition={{
                duration: Math.random() * 5 + 4,
                repeat: Infinity,
                ease: "linear"
              }}
            >
              ⭐
            </motion.div>
          ))}

          {/* Confetti trái tim */}
          {[...Array(15)].map((_, i) => (
            <motion.div
              key={`heart-${i}`}
              className="absolute text-xl"
              style={{
                left: `${Math.random() * 100}%`,
                color: ['#ef4444', '#dc2626', '#b91c1c', '#991b1b', '#7f1d1d'][Math.floor(Math.random() * 5)]
              }}
              initial={{ 
                x: Math.random() * window.innerWidth,
                y: window.innerHeight + 10,
                rotate: 0,
                scale: 0.8
              }}
              animate={{
                y: -10,
                rotate: 180,
                x: Math.random() * window.innerWidth,
                scale: [0.8, 1.3, 0.8]
              }}
              transition={{
                duration: Math.random() * 6 + 5,
                repeat: Infinity,
                ease: "linear"
              }}
            >
              ❤️
            </motion.div>
          ))}

          {/* Sparkles */}
          {[...Array(40)].map((_, i) => (
            <motion.div
              key={`sparkle-${i}`}
              className="absolute text-2xl"
              style={{
                left: `${Math.random() * 100}%`,
                color: ['#ffd700', '#ffed4e', '#fff200', '#ffff00'][Math.floor(Math.random() * 4)]
              }}
              initial={{ 
                x: Math.random() * window.innerWidth,
                y: window.innerHeight + 10,
                rotate: 0,
                scale: 0
              }}
              animate={{
                y: -10,
                rotate: 360,
                x: Math.random() * window.innerWidth,
                scale: [0, 1, 0]
              }}
              transition={{
                duration: Math.random() * 4 + 3,
                repeat: Infinity,
                ease: "linear"
              }}
            >
              ✨
            </motion.div>
          ))}

          {/* Confetti bong bóng */}
          {[...Array(35)].map((_, i) => (
            <motion.div
              key={`bubble-${i}`}
              className="absolute rounded-full border-2"
              style={{
                width: `${Math.random() * 15 + 8}px`,
                height: `${Math.random() * 15 + 8}px`,
                left: `${Math.random() * 100}%`,
                borderColor: ['#3b82f6', '#2563eb', '#1d4ed8', '#1e40af', '#1e3a8a'][Math.floor(Math.random() * 5)],
                backgroundColor: 'transparent'
              }}
              initial={{ 
                x: Math.random() * window.innerWidth,
                y: window.innerHeight + 10,
                rotate: 0,
                scale: 0.3
              }}
              animate={{
                y: -10,
                rotate: 240,
                x: Math.random() * window.innerWidth,
                scale: [0.3, 1.1, 0.3]
              }}
              transition={{
                duration: Math.random() * 7 + 6,
                repeat: Infinity,
                ease: "linear"
              }}
            />
          ))}
        </div>,
        document.body
      )}

      <main 
        className="min-h-screen bg-gradient-to-br from-pink-100 via-yellow-100 to-purple-200 flex flex-col items-center justify-center p-4 lg:p-8 space-y-6 lg:space-y-8 overflow-hidden relative"
        style={{ cursor: 'grab' }}
      >

      {/* Control Buttons */}
      <div className="fixed top-4 right-4 flex flex-col gap-2 z-50">
        <Button
          onClick={isPlaying ? stopAudio : playAudio}
          className="bg-gradient-to-r from-pink-500 to-pink-600 text-black rounded-full shadow-lg px-4 py-2 hover:from-pink-600 hover:to-pink-700 transition-all duration-300 transform hover:scale-105 font-semibold"
          style={{ border: '2px solid #f9a8d4', cursor: 'pointer' }}
          whileHover={{ 
            scale: 1.15,
            rotate: 3,
            boxShadow: "0 15px 30px -5px rgba(0, 0, 0, 0.3)"
          }}
          whileTap={{ scale: 0.9 }}
        >
          {isPlaying ? '🔇 Tắt nhạc' : '🎵 Bật nhạc'}
        </Button>
        
        <Button
          onClick={() => setShowConfetti(!showConfetti)}
          className="bg-gradient-to-r from-purple-500 to-purple-600 text-black rounded-full shadow-lg px-4 py-2 hover:from-purple-600 hover:to-purple-700 transition-all duration-300 transform hover:scale-105 font-semibold"
          style={{ border: '2px solid #c084fc', cursor: 'pointer' }}
          whileHover={{ 
            scale: 1.15,
            rotate: -3,
            boxShadow: "0 15px 30px -5px rgba(0, 0, 0, 0.3)"
          }}
          whileTap={{ scale: 0.9 }}
        >
          {showConfetti ? '🎊 Tắt confetti' : '🎊 Bật confetti'}
        </Button>
      </div>

      {/* Floating Elements */}
      <div 
        className="absolute inset-0 z-0 overflow-hidden pointer-events-none"
        style={{ cursor: 'grab' }}
      >
        {[...Array(30)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-6 h-6 text-2xl lg:text-3xl"
            initial={{ 
              x: Math.random() * window.innerWidth,
              y: window.innerHeight + 50
            }}
            animate={{
              y: -50,
              rotate: 360
            }}
            transition={{
              duration: Math.random() * 10 + 10,
              repeat: Infinity,
              ease: "linear"
            }}
            style={{
              left: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 10}s`
            }}
          >
            {['👶', '🎈', '🎀', '⭐', '💖', '🌸', '🦋', '🌈'][Math.floor(Math.random() * 8)]}
          </motion.div>
        ))}
      </div>

      {/* Main Title */}
      <motion.div
        className="text-center max-w-5xl"
        initial={{ opacity: 0, y: -30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1 }}
        style={{ cursor: 'help' }}
      >
        <h1 className="text-3xl lg:text-5xl xl:text-6xl font-extrabold text-pink-600 drop-shadow-lg animate-bounce bg-gradient-to-r from-pink-500 to-purple-600 bg-clip-text text-transparent">
          👶👶 Chào mừng cặp song sinh đáng yêu của bố Đức Huy và mẹ Lan Anh! 🎉
        </h1>
        <p className="text-lg lg:text-xl font-medium text-purple-700 mt-4 lg:mt-6">
          Chào mừng Hai thiên thần nhỏ đã đến với thế giới này 💖💖
        </p>
      </motion.div>

      {/* Baby Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-6xl">
        {twins.map((baby, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.3 }}
            whileHover={{ 
              scale: 1.05,
              rotateY: 5,
              boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.4)"
            }}
            whileTap={{ scale: 0.95 }}
            style={{ cursor: 'pointer' }}
          >
            <Card className="rounded-3xl shadow-2xl border-4 border-pink-200 bg-white/90 backdrop-blur-md overflow-hidden hover:shadow-3xl transition-all duration-500 cursor-pointer">
              <CardContent className="p-6 text-center space-y-4">
                <h2 className="text-2xl font-bold text-pink-500 bg-gradient-to-r from-pink-500 to-purple-600 bg-clip-text text-transparent">
                  👼 {index === 0 ? 'Tít' : 'Mít'}
                </h2>
                <div className="text-left text-base space-y-1 bg-gradient-to-br from-pink-50 to-purple-50 p-4 rounded-xl shadow-inner border border-pink-100">
                  <p><strong className="text-pink-600">👶 Tên:</strong> {baby.name}</p>
                  <p><strong className="text-pink-600">⏰ Thời gian:</strong> {baby.bornAt}</p>
                  <p><strong className="text-pink-600">⚖️ Cân nặng:</strong> {baby.weight}</p>
                  <p><strong className="text-pink-600">📏 Chiều cao:</strong> {baby.height}</p>
                  <p><strong className="text-pink-600">🏥 Nơi sinh:</strong> {baby.hospital}</p>
                </div>
                
                <div className="relative">
                  <motion.div
                    className="absolute -top-4 -left-4 w-16 h-16 bg-yellow-300 rounded-full blur-xl opacity-50 animate-ping"
                    whileHover={{ scale: 1.2 }}
                  />
                  <motion.div
                    className="absolute -bottom-4 -right-4 w-16 h-16 bg-pink-300 rounded-full blur-xl opacity-50 animate-ping"
                    whileHover={{ scale: 1.2 }}
                  />
                  <motion.img
                    src={baby.image}
                    alt={`Hình ảnh bé ${baby.name}`}
                    className="mx-auto rounded-2xl w-60 h-60 object-cover border-4 border-white shadow-2xl cursor-pointer hover:shadow-3xl transition-all duration-500"
                    style={{ cursor: 'grab' }}
                    whileHover={{ 
                      scale: 1.1, 
                      rotate: 5,
                      filter: "brightness(1.1) contrast(1.1)"
                    }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => {
                      setSelectedBaby(baby);
                      setShowGallery(true);
                    }}
                  />
                </div>
                
                <div className="flex gap-2 justify-center">
                  <Button 
                    className="bg-gradient-to-r from-pink-400 to-purple-500 hover:from-pink-500 hover:to-purple-600 text-black px-6 py-2 text-base rounded-full shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 font-semibold"
                    style={{ border: '2px solid #f9a8d4', cursor: 'pointer' }}
                    whileHover={{ 
                      scale: 1.1,
                      rotate: 2,
                      boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.3)"
                    }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => {
                      setSelectedBaby(baby);
                      setShowGallery(true);
                    }}
                  >
                    📸 Xem ảnh {baby.name}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Guestbook Section */}
      <motion.div
        className="w-full max-w-2xl bg-white/90 backdrop-blur-md rounded-3xl p-6 lg:p-8 shadow-2xl border-2 border-pink-200"
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        style={{ cursor: 'default' }}
      >
        <h2 className="text-2xl lg:text-3xl font-bold text-pink-600 text-center mb-8">💌 Sổ lưu bút</h2>
        
        {/* Add Message Form */}
        <div className="mb-8 p-6 from-pink-50 to-purple-50 rounded-2xl border border-pink-200">
          <div className="flex flex-col lg:flex-row gap-6 mb-6">
            <div className="lg:w-1/3">
              <label className="block text-pink-600 font-semibold mb-5 text-lg">👤 Tên của bạn</label>
              <input
                type="text"
                placeholder="Nhập tên của bạn"
                value={newMessage.name}
                onChange={(e) => setNewMessage({...newMessage, name: e.target.value})}
                className="px-3 py-2 rounded-xl border-2 border-pink-200 focus:border-pink-400 outline-none transition-all duration-300 focus:shadow-lg text-gray-800 placeholder-gray-500 text-lg w-full"
                style={{ cursor: 'text' }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              />
            </div>
            <div className="lg:w-2/3">
              <label className="block text-pink-600 font-semibold mb-5 text-lg">💌 Lời chúc</label>
              <textarea
                placeholder="Nhập lời chúc của bạn"
                value={newMessage.message}
                onChange={(e) => setNewMessage({...newMessage, message: e.target.value})}
                className="px-3 py-2 rounded-xl border-2 border-pink-200 focus:border-pink-400 outline-none transition-all duration-300 focus:shadow-lg text-gray-800 placeholder-gray-500 text-lg w-full resize-none"
                rows="4"
                style={{ cursor: 'text' }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              />
            </div>
          </div>
            <Button
              onClick={addGuestbookMessage}
              disabled={isSubmitting}
              className={`px-8 py-3 rounded-full transition-all duration-300 transform font-semibold text-lg shadow-lg ${
                isSubmitting 
                  ? 'bg-gray-400 text-gray-600 cursor-not-allowed' 
                  : 'bg-gradient-to-r from-pink-500 to-purple-600 text-black hover:from-pink-600 hover:to-purple-700 hover:scale-105'
              }`}
              style={{ border: '2px solid #f9a8d4', cursor: isSubmitting ? 'not-allowed' : 'pointer' }}
              whileHover={!isSubmitting ? { 
                scale: 1.1,
                rotate: 2,
                boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.3)"
              } : {}}
              whileTap={!isSubmitting ? { scale: 0.9 } : {}}
            >
              {isSubmitting ? '⏳ Đang gửi...' : '💌 Gửi lời chúc'}
            </Button>
        </div>

        {/* Messages List */}
        <div className="mb-8 p-6 from-pink-50 to-purple-50 rounded-2xl border border-pink-200">
          <div className="space-y-4 max-h-80 overflow-y-auto">
            {loading ? (
              <div className="text-center py-8">
                <div className="text-pink-600 text-lg">🔄 Đang tải lời chúc...</div>
              </div>
            ) : (
              guestbookMessages.map((msg, index) => (
              <motion.div
                key={index}
                className="bg-white p-6 rounded-2xl shadow-lg border-l-4 border-pink-400 hover:shadow-xl transition-all duration-300"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                style={{ cursor: 'default' }}
              >
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <p className="font-bold text-pink-600 text-lg" dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(msg.name) }}></p>
                    <p className="text-gray-800 mt-2 text-base" dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(msg.message) }}></p>
                  </div>
                  <span className="text-xs text-gray-500 ml-4">{msg.time}</span>
                </div>
              </motion.div>
              ))
            )}
          </div>
        </div>
      </motion.div>

      {/* Share Buttons */}
      <motion.div
        className="p-6 from-pink-50 to-purple-50 rounded-2xl border border-pink-200"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.8 }}
        style={{ cursor: 'default' }}
      >
        <div className="flex flex-wrap gap-4 justify-center">
          <Button
            onClick={() => shareOnSocial('facebook')}
            className="bg-gradient-to-r from-blue-600 to-blue-700 text-black px-6 py-3 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 font-semibold"
            style={{ border: '2px solid #93c5fd', cursor: 'pointer' }}
            whileHover={{ 
              scale: 1.15,
              rotate: 3,
              boxShadow: "0 15px 30px -5px rgba(0, 0, 0, 0.3)"
            }}
            whileTap={{ scale: 0.9 }}
          >
            📘 Chia sẻ Facebook
          </Button>
          <Button
            onClick={() => shareOnSocial('twitter')}
            className="bg-gradient-to-r from-blue-500 to-blue-600 text-black px-6 py-3 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 font-semibold"
            style={{ border: '2px solid #93c5fd', cursor: 'pointer' }}
            whileHover={{ 
              scale: 1.15,
              rotate: -3,
              boxShadow: "0 15px 30px -5px rgba(0, 0, 0, 0.3)"
            }}
            whileTap={{ scale: 0.9 }}
          >
            🐦 Chia sẻ Twitter
          </Button>
          <Button
            onClick={() => shareOnSocial('whatsapp')}
            className="bg-gradient-to-r from-green-600 to-green-700 text-black px-6 py-3 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 font-semibold"
            style={{ border: '2px solid #86efac', cursor: 'pointer' }}
            whileHover={{ 
              scale: 1.15,
              rotate: 3,
              boxShadow: "0 15px 30px -5px rgba(0, 0, 0, 0.3)"
            }}
            whileTap={{ scale: 0.9 }}
          >
            💬 Chia sẻ WhatsApp
          </Button>
        </div>
      </motion.div>

      {/* Photo Gallery Modal */}
      {showGallery && selectedBaby && (
        <motion.div
          className="fixed inset-0 bg-black/90 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            className="bg-white rounded-3xl p-6 lg:p-8 max-w-5xl max-h-[90vh] overflow-y-auto shadow-2xl"
            initial={{ scale: 0.8 }}
            animate={{ scale: 1 }}
          >
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-2xl lg:text-3xl font-bold text-pink-600 bg-gradient-to-r from-pink-500 to-purple-600 bg-clip-text text-transparent">📸 Ảnh của {selectedBaby.name}</h3>
              <Button
                onClick={() => setShowGallery(false)}
                className="bg-gradient-to-r from-gray-500 to-gray-600 text-black px-4 py-2 rounded-full hover:from-gray-600 hover:to-gray-700 transition-all duration-300"
                style={{ border: '2px solid #f9a8d4' }}
              >
                ✕
              </Button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6">
              {selectedBaby.photos.map((photo, index) => (
                  <motion.img
                    key={index}
                  src={photo}
                    alt={`Ảnh ${index + 1} của ${selectedBaby.name}`}
                    className="w-full h-48 lg:h-64 object-cover rounded-2xl shadow-lg cursor-pointer hover:shadow-2xl transition-all duration-300"
                    whileHover={{ scale: 1.05 }}
                  />
              ))}
            </div>
          </motion.div>
        </motion.div>
      )}
    </main>
    </>
  );
} 