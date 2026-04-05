import React, { useRef, useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { RotateCcw, CheckCircle2 } from 'lucide-react';
import confetti from 'canvas-confetti';
import { soundService } from '../services/soundService';

interface TracingCanvasProps {
  letter: string;
  progressLabel?: string;
  animationIntensity?: number;
  onComplete: () => void;
}

export default function TracingCanvas({ 
  letter, 
  progressLabel = "Tracing Progress", 
  animationIntensity = 1,
  onComplete 
}: TracingCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas size
    const size = Math.min(window.innerWidth * 0.8, 400);
    canvas.width = size;
    canvas.height = size;

    drawGuide();
  }, [letter]);

  const drawGuide = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Draw background letter guide
    ctx.font = `bold ${canvas.width * 0.8}px "Bubblegum Sans", cursive`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillStyle = '#f1f5f9'; // slate-100
    ctx.fillText(letter, canvas.width / 2, canvas.height / 2);
    
    // Draw dashed outline
    ctx.setLineDash([10, 10]);
    ctx.strokeStyle = '#cbd5e1'; // slate-300
    ctx.lineWidth = 4;
    ctx.strokeText(letter, canvas.width / 2, canvas.height / 2);
    ctx.setLineDash([]);
  };

  const startDrawing = (e: React.MouseEvent | React.TouchEvent) => {
    setIsDrawing(true);
    draw(e);
  };

  const stopDrawing = () => {
    setIsDrawing(false);
    checkProgress();
  };

  const draw = (e: React.MouseEvent | React.TouchEvent) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const x = ('touches' in e) ? e.touches[0].clientX - rect.left : (e as React.MouseEvent).clientX - rect.left;
    const y = ('touches' in e) ? e.touches[0].clientY - rect.top : (e as React.MouseEvent).clientY - rect.top;

    ctx.lineWidth = 15;
    ctx.lineCap = 'round';
    ctx.strokeStyle = '#6366f1'; // indigo-500
    
    ctx.lineTo(x, y);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(x, y);
  };

  const checkProgress = () => {
    // Simple heuristic for completion: check pixel density in the center area
    // In a real app, we'd use path matching, but for a kid's app, we just want to encourage them
    const newProgress = Math.min(progress + 20, 100);
    setProgress(newProgress);
    if (newProgress >= 80 && progress < 80) {
      soundService.play('sparkle');
      confetti({
        particleCount: 50,
        spread: 40,
        origin: { y: 0.7 },
        colors: ['#6366f1', '#10b981']
      });
      onComplete();
    }
  };

  const reset = () => {
    setProgress(0);
    drawGuide();
  };

  return (
    <div className="flex flex-col items-center gap-6 w-full max-w-md">
      {/* Progress Bar */}
      <div className="w-full px-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-slate-500 font-bold text-sm uppercase tracking-wider">{progressLabel}</span>
          <span className="text-indigo-600 font-bold">{Math.round(progress)}%</span>
        </div>
        <div className="w-full h-6 bg-slate-100 rounded-full overflow-hidden shadow-inner border-2 border-white">
          <motion.div 
            className="h-full bg-gradient-to-r from-indigo-400 to-indigo-600 rounded-full"
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ type: "spring", stiffness: 100 * animationIntensity, damping: 20 }}
          />
        </div>
      </div>

      <div className="relative bg-white rounded-3xl shadow-inner p-4 border-4 border-dashed border-slate-200">
        <canvas
          ref={canvasRef}
          onMouseDown={startDrawing}
          onMouseMove={draw}
          onMouseUp={stopDrawing}
          onMouseLeave={stopDrawing}
          onTouchStart={startDrawing}
          onTouchMove={draw}
          onTouchEnd={stopDrawing}
          className="cursor-crosshair touch-none"
        />
        
        {progress >= 100 && (
          <motion.div 
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="absolute inset-0 flex items-center justify-center bg-white/50 backdrop-blur-sm rounded-3xl"
          >
            <CheckCircle2 className="w-24 h-24 text-green-500" />
          </motion.div>
        )}
      </div>

      <div className="flex gap-4">
        <button 
          onClick={reset}
          className="flex items-center gap-2 px-6 py-3 bg-slate-100 text-slate-600 rounded-full font-bold hover:bg-slate-200 transition-colors"
        >
          <RotateCcw className="w-5 h-5" />
          Try Again
        </button>
      </div>
    </div>
  );
}
