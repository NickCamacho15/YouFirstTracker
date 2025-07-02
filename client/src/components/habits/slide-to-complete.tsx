import { useState, useRef, useEffect } from "react";
import { ChevronRight } from "lucide-react";

interface SlideToCompleteProps {
  onComplete: () => void;
  disabled?: boolean;
  colors: {
    bg: string;
    stroke: string;
    text: string;
  };
}

export function SlideToComplete({ onComplete, disabled = false, colors }: SlideToCompleteProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState(0);
  const [isCompleting, setIsCompleting] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const sliderRef = useRef<HTMLDivElement>(null);

  const handleStart = (clientX: number) => {
    if (disabled || isCompleting) return;
    setIsDragging(true);
  };

  const handleMove = (clientX: number) => {
    if (!isDragging || !containerRef.current || disabled || isCompleting) return;
    
    const container = containerRef.current;
    const rect = container.getBoundingClientRect();
    const maxOffset = rect.width - 60; // 60px is the slider width
    const offset = Math.max(0, Math.min(clientX - rect.left - 30, maxOffset));
    
    setDragOffset(offset);
  };

  const handleEnd = () => {
    if (!isDragging || disabled || isCompleting) return;
    
    const container = containerRef.current;
    if (!container) return;
    
    const maxOffset = container.getBoundingClientRect().width - 60;
    const threshold = maxOffset * 0.8; // 80% of the way
    
    if (dragOffset >= threshold) {
      setIsCompleting(true);
      setTimeout(() => {
        onComplete();
        setDragOffset(0);
        setIsCompleting(false);
      }, 200);
    } else {
      setDragOffset(0);
    }
    
    setIsDragging(false);
  };

  // Touch events
  const handleTouchStart = (e: React.TouchEvent) => {
    e.preventDefault();
    handleStart(e.touches[0].clientX);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    e.preventDefault();
    handleMove(e.touches[0].clientX);
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    e.preventDefault();
    handleEnd();
  };

  // Mouse events
  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    handleStart(e.clientX);
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      handleMove(e.clientX);
    };

    const handleMouseUp = () => {
      handleEnd();
    };

    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, dragOffset]);

  const progressPercentage = containerRef.current 
    ? (dragOffset / (containerRef.current.getBoundingClientRect().width - 60)) * 100 
    : 0;

  return (
    <div className="w-full">
      <div
        ref={containerRef}
        className={`relative h-14 bg-gray-100 dark:bg-gray-800 rounded-xl overflow-hidden touch-none select-none ${
          disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'
        }`}
      >
        {/* Progress background */}
        <div
          className={`absolute inset-0 transition-all duration-200 rounded-xl`}
          style={{
            background: `linear-gradient(to right, ${colors.bg.includes('bg-') ? colors.bg.replace('bg-', '') : colors.bg} ${progressPercentage}%, transparent ${progressPercentage}%)`,
            opacity: 0.3,
          }}
        />
        
        {/* Text */}
        <div className="absolute inset-0 flex items-center justify-center">
          <span className={`font-semibold text-gray-600 dark:text-gray-300 transition-opacity duration-200 ${
            progressPercentage > 50 ? 'opacity-30' : 'opacity-100'
          }`}>
            {isCompleting ? 'Completing...' : 'Slide to complete'}
          </span>
        </div>
        
        {/* Slider */}
        <div
          ref={sliderRef}
          className={`absolute left-1 top-1 w-12 h-12 rounded-lg flex items-center justify-center transition-all duration-200 cursor-grab active:cursor-grabbing ${
            isCompleting ? 'scale-110' : isDragging ? 'scale-105' : 'scale-100'
          }`}
          style={{
            transform: `translateX(${dragOffset}px)`,
            backgroundColor: colors.bg.includes('bg-') ? colors.stroke : colors.bg,
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
          }}
          onMouseDown={handleMouseDown}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        >
          <ChevronRight className="w-6 h-6 text-white" />
        </div>
      </div>
    </div>
  );
}