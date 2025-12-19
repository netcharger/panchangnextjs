"use client";

import { useEffect, useRef } from "react";

export default function AudioVisualizer({ analyser, isPlaying, onEnded }) {
  const canvasRef = useRef(null);
  const animationFrameRef = useRef(null);

  useEffect(() => {
    if (!analyser || !isPlaying) {
      // Cleanup when not playing
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
        animationFrameRef.current = null;
      }
      return;
    }

    const canvas = canvasRef.current;
    if (!canvas) return;

    // Set canvas size for high DPI
    const rect = canvas.getBoundingClientRect();
    const width = rect.width || 400;
    const height = rect.height || 128;
    canvas.width = width * 2;
    canvas.height = height * 2;

    const ctx = canvas.getContext('2d');
    ctx.scale(2, 2); // Scale for high DPI

    const bufferLength = analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);

    // Animation function
    const draw = () => {
      if (!isPlaying) {
        return;
      }

      animationFrameRef.current = requestAnimationFrame(draw);

      analyser.getByteFrequencyData(dataArray);

      // Clear canvas
      ctx.clearRect(0, 0, width, height);

      // Draw bars
      const barWidth = (width / bufferLength) * 2.5;
      let barHeight;
      let x = 0;

      // Gradient colors
      const gradient = ctx.createLinearGradient(0, 0, 0, height);
      gradient.addColorStop(0, '#8B5CF6'); // Purple
      gradient.addColorStop(0.5, '#EC4899'); // Pink
      gradient.addColorStop(1, '#F59E0B'); // Orange

      for (let i = 0; i < bufferLength; i++) {
        barHeight = (dataArray[i] / 255) * height * 0.8;

        // Draw bar with gradient
        ctx.fillStyle = gradient;
        ctx.fillRect(x, height - barHeight, barWidth - 1, barHeight);

        // Add glow effect
        ctx.shadowBlur = 10;
        ctx.shadowColor = '#EC4899';
        ctx.fillRect(x, height - barHeight, barWidth - 1, barHeight);
        ctx.shadowBlur = 0;

        x += barWidth + 1;
      }

      // Draw circular waveform in center
      const centerX = width / 2;
      const centerY = height / 2;
      const radius = 20;

      ctx.beginPath();
      ctx.arc(centerX, centerY, radius, 0, 2 * Math.PI);
      ctx.strokeStyle = 'rgba(139, 92, 246, 0.3)';
      ctx.lineWidth = 2;
      ctx.stroke();

      // Draw circular bars
      const angleStep = (2 * Math.PI) / bufferLength;
      for (let i = 0; i < bufferLength; i += 4) {
        const angle = i * angleStep;
        const barLength = (dataArray[i] / 255) * 30;
        
        ctx.beginPath();
        ctx.moveTo(
          centerX + Math.cos(angle) * radius,
          centerY + Math.sin(angle) * radius
        );
        ctx.lineTo(
          centerX + Math.cos(angle) * (radius + barLength),
          centerY + Math.sin(angle) * (radius + barLength)
        );
        ctx.strokeStyle = gradient;
        ctx.lineWidth = 2;
        ctx.stroke();
      }
    };

    draw();

    // Cleanup
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
        animationFrameRef.current = null;
      }
    };
  }, [analyser, isPlaying, onEnded]);

  return (
    <div className="w-full h-32 rounded-xl overflow-hidden bg-gradient-to-br from-indigo-900/20 via-purple-900/20 to-pink-900/20 backdrop-blur-sm border border-white/10">
      <canvas
        ref={canvasRef}
        width={400}
        height={128}
        className="w-full h-full"
      />
    </div>
  );
}

