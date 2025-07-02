import { useState, useRef } from "react";
import { AlertTriangle } from "lucide-react";

interface SlideToBreakProps {
  onBreak: () => void;
  disabled?: boolean;
  className?: string;
}

export function SlideToBreak({ onBreak, disabled = false, className = "" }: SlideToBreakProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [slidePosition, setSlidePosition] = useState(0);
  const [isComplete, setIsComplete] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const SLIDE_THRESHOLD = 0.8; // 80% slide to trigger

  const handleStart = (clientX: number) => {
    if (disabled || isComplete) return;
    setIsDragging(true);
  };

  const handleMove = (clientX: number) => {
    if (!isDragging || !containerRef.current || disabled) return;

    const rect = containerRef.current.getBoundingClientRect();
    const maxSlide = rect.width - 48; // Account for slider width
    const newPosition = Math.max(0, Math.min(clientX - rect.left - 24, maxSlide));
    const percentage = newPosition / maxSlide;
    
    setSlidePosition(newPosition);

    if (percentage >= SLIDE_THRESHOLD && !isComplete) {
      setIsComplete(true);
      setIsDragging(false);
      
      // Haptic feedback on mobile
      if ('vibrate' in navigator) {
        navigator.vibrate([50, 30, 50, 30, 50]);
      }
      
      // Trigger the break action after animation
      setTimeout(() => {
        onBreak();
        // Reset for next use
        setTimeout(() => {
          setIsComplete(false);
          setSlidePosition(0);
        }, 1000);
      }, 200);
    }
  };

  const handleEnd = () => {
    if (!isComplete) {
      // Snap back animation
      setSlidePosition(0);
    }
    setIsDragging(false);
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    handleStart(e.clientX);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    handleMove(e.clientX);
  };

  const handleMouseUp = () => {
    handleEnd();
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    handleStart(e.touches[0].clientX);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    e.preventDefault();
    handleMove(e.touches[0].clientX);
  };

  const handleTouchEnd = () => {
    handleEnd();
  };

  const slidePercentage = containerRef.current 
    ? slidePosition / (containerRef.current.getBoundingClientRect().width - 48) 
    : 0;

  return (
    <div 
      className={`relative ${className}`}
      onMouseMove={isDragging ? handleMouseMove : undefined}
      onMouseUp={isDragging ? handleMouseUp : undefined}
      onMouseLeave={isDragging ? handleMouseUp : undefined}
    >
      <div
        ref={containerRef}
        className={`
          relative w-full h-12 rounded-full border-2 transition-all duration-200 overflow-hidden
          ${isComplete 
            ? 'bg-red-100 border-red-400 dark:bg-red-950/50 dark:border-red-600' 
            : 'bg-red-50 border-red-200 hover:border-red-300 dark:bg-red-950/20 dark:border-red-800'
          }
          ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-grab active:cursor-grabbing'}
        `}
      >
        {/* Background gradient fill */}
        <div 
          className="absolute inset-0 bg-gradient-to-r from-red-400 to-red-600 transition-all duration-200"
          style={{ 
            width: `${Math.max(slidePercentage * 100, 0)}%`,
            opacity: isComplete ? 1 : 0.3 
          }}
        />
        
        {/* Slider handle */}
        <div
          className={`
            absolute top-1 left-1 w-10 h-10 rounded-full shadow-lg transition-all duration-200 flex items-center justify-center
            ${isComplete 
              ? 'bg-red-600 text-white transform scale-105' 
              : 'bg-white text-red-500 hover:bg-red-50'
            }
            ${disabled ? '' : 'cursor-grab active:cursor-grabbing'}
          `}
          style={{ 
            transform: `translateX(${slidePosition}px) ${isComplete ? 'scale(1.05)' : 'scale(1)'}`,
            transition: isDragging ? 'none' : 'transform 0.3s ease-out'
          }}
          onMouseDown={handleMouseDown}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        >
          <AlertTriangle className={`w-5 h-5 ${isComplete ? 'animate-pulse' : ''}`} />
        </div>

        {/* Text overlay */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <span 
            className={`text-sm font-medium transition-all duration-200 ${
              isComplete 
                ? 'text-white' 
                : slidePercentage > 0.3 
                  ? 'text-white' 
                  : 'text-red-600 dark:text-red-400'
            }`}
          >
            {isComplete ? 'Promise Broken' : 'Slide to Break Promise'}
          </span>
        </div>

        {/* Subtle grab bars on the right */}
        <div className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
          <div className="flex gap-0.5">
            {[...Array(3)].map((_, i) => (
              <div 
                key={i} 
                className={`w-0.5 h-4 rounded-full transition-colors duration-200 ${
                  slidePercentage > 0.5 ? 'bg-white/60' : 'bg-red-400/40'
                }`} 
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}