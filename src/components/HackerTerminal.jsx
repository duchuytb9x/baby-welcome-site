import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

export default function HackerTerminal({ onDone }) {
  const [terminalText, setTerminalText] = useState('');
  const [currentLine, setCurrentLine] = useState(0);
  const [showPreview, setShowPreview] = useState(false);
  
  const commands = [
    '> Initializing system...',
    '> Loading baby welcome site...',
    '> Connecting to server...',
    '> Downloading assets...',
    '> Compiling React components...',
    '> Rendering UI elements...',
    '> Applying animations...',
    '> Finalizing layout...',
    '> System ready!',
    '> Opening preview window...'
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      if (currentLine < commands.length) {
        setTerminalText(prev => prev + commands[currentLine] + '\n');
        setCurrentLine(prev => prev + 1);
      } else {
        clearInterval(interval);
        setTimeout(() => {
          setShowPreview(true);
          setTimeout(() => {
            if (onDone) onDone();
          }, 1500); // Hiển thị preview 1.5s rồi chuyển
        }, 1000);
      }
    }, 300);

    return () => clearInterval(interval);
  }, [currentLine, commands.length, onDone]);

  return (
    <div className="h-screen bg-black text-green-400 font-mono p-4 overflow-hidden">
      {/* Terminal Header */}
      <div className="border-b border-green-400 pb-2 mb-4">
        <div className="flex items-center space-x-2">
          <div className="w-3 h-3 bg-red-500 rounded-full"></div>
          <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
          <div className="w-3 h-3 bg-green-500 rounded-full"></div>
          <span className="ml-4 text-sm">Baby Welcome Site - Terminal</span>
        </div>
      </div>

      {/* Terminal Content */}
      <div className="space-y-2">
        <div className="whitespace-pre-wrap text-sm leading-relaxed">
          {terminalText}
          <span className="animate-pulse">█</span>
        </div>
      </div>

      {/* Web Preview */}
      {/* Đã xoá phần preview window theo yêu cầu */}

      {/* Matrix Rain Effect */}
      <div className="absolute inset-0 pointer-events-none">
        {[...Array(20)].map((_, i) => (
          <div
            key={i}
            className="absolute text-green-500 text-xs animate-pulse"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 2}s`,
              animationDuration: `${1 + Math.random()}s`
            }}
          >
            {String.fromCharCode(0x30A0 + Math.random() * 96)}
          </div>
        ))}
      </div>

      {/* Status Bar */}
      <div className="absolute bottom-4 left-4 right-4 border-t border-green-400 pt-2">
        <div className="flex justify-between text-xs">
          <span>Status: {showPreview ? 'Preview Active' : 'Loading...'}</span>
          <span>Time: {new Date().toLocaleTimeString()}</span>
          <span>Memory: {(Math.random() * 100).toFixed(1)}%</span>
        </div>
      </div>
    </div>
  );
} 