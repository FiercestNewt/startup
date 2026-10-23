import { useEffect, useRef } from 'react';
import './DotField.css';

const clamp = (value, min, max) => Math.min(max, Math.max(min, value));

const getColor = (value, fallback) => {
  const match = String(value || '').trim().match(/^#?([0-9a-f]{3}|[0-9a-f]{6})$/i);
  if (!match) return fallback;

  const hex = match[1].length === 3
    ? match[1].split('').map((digit) => digit + digit).join('')
    : match[1];
  return [0, 2, 4].map((index) => parseInt(hex.slice(index, index + 2), 16));
};

const mixColor = (from, to, amount) => from.map((channel, index) => (
  Math.round(channel + (to[index] - channel) * amount)
));

export default function DotField({
  dotRadius = 1.5,
  dotSpacing = 14,
  gradientFrom = '#5227FF',
  gradientTo = '#FF9FFC',
  gradientAngle = 135,
  cursorRadius = 240,
  bulgeStrength = 0.6,
  glowColor = '#ffffff',
  glowRadius = 160,
  glowIntensity = 0.8,
  baseOpacity = 0.55,
  waveAmplitude = 0,
  speed = 1,
  interactive = true,
  intro = true,
  lightMode = false,
  opacity = 1,
  maxDevicePixelRatio = 2,
  className = '',
  style,
}) {
  const containerRef = useRef(null);
  const canvasRef = useRef(null);

  useEffect(() => {
    const container = containerRef.current;
    const canvas = canvasRef.current;
    if (!container || !canvas) return undefined;

    const context = canvas.getContext('2d');
    if (!context) return undefined;

    const from = getColor(gradientFrom, [82, 39, 255]);
    const to = getColor(gradientTo, [255, 159, 252]);
    const glow = getColor(glowColor, [255, 255, 255]);
    const spacing = Math.max(4, dotRadius * 2 + dotSpacing);
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    let width = 0;
    let height = 0;
    let frameId;
    let startTime = performance.now();
    let pointer = null;

    const resize = () => {
      const bounds = container.getBoundingClientRect();
      const ratio = Math.min(window.devicePixelRatio || 1, clamp(maxDevicePixelRatio, 0.5, 3));
      width = bounds.width;
      height = bounds.height;
      canvas.width = Math.max(1, Math.floor(width * ratio));
      canvas.height = Math.max(1, Math.floor(height * ratio));
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      context.setTransform(ratio, 0, 0, ratio, 0, 0);
    };

    const updatePointer = (event) => {
      const bounds = canvas.getBoundingClientRect();
      pointer = { x: event.clientX - bounds.left, y: event.clientY - bounds.top };
    };

    const clearPointer = () => {
      pointer = null;
    };

    const draw = (now) => {
      const elapsed = (now - startTime) / 1000;
      const time = prefersReducedMotion ? 0 : elapsed * Math.max(0, speed);
      context.clearRect(0, 0, width, height);
      context.globalCompositeOperation = 'source-over';

      const angle = (gradientAngle * Math.PI) / 180;
      const directionX = Math.cos(angle);
      const directionY = Math.sin(angle);
      const radius = clamp(dotRadius, 0.25, 12);
      const reach = Math.max(20, cursorRadius);

      for (let y = -spacing; y <= height + spacing; y += spacing) {
        for (let x = -spacing; x <= width + spacing; x += spacing) {
          const wave = waveAmplitude * 0.02 * Math.sin((x + y) * 0.02 + time);
          const sourceX = x + wave;
          const sourceY = y + wave;
          const relativeX = sourceX - width / 2;
          const relativeY = sourceY - height / 2;
          const gradient = clamp(
            0.5 + (relativeX * directionX + relativeY * directionY) / Math.max(width, height),
            0,
            1,
          );
          const distance = pointer
            ? Math.hypot(sourceX - pointer.x, sourceY - pointer.y)
            : Infinity;
          const influence = interactive ? Math.max(0, 1 - distance / reach) ** 2 : 0;
          const drawX = pointer
            ? sourceX + (sourceX - pointer.x) * influence * bulgeStrength * 0.18
            : sourceX;
          const drawY = pointer
            ? sourceY + (sourceY - pointer.y) * influence * bulgeStrength * 0.18
            : sourceY;
          const size = radius * (1 + influence * 0.7);
          const color = mixColor(from, to, gradient);
          const glowInfluence = interactive
            ? Math.max(0, 1 - distance / Math.max(20, glowRadius)) * glowIntensity
            : 0;
          const finalColor = mixColor(color, glow, clamp(glowInfluence, 0, 1));
          const alpha = clamp(baseOpacity + glowInfluence * 0.35, 0, 1) * opacity;

          context.beginPath();
          context.fillStyle = `rgba(${finalColor.join(',')}, ${alpha})`;
          context.arc(drawX, drawY, size, 0, Math.PI * 2);
          context.fill();
        }
      }

      frameId = window.requestAnimationFrame(draw);
    };

    const observer = new ResizeObserver(resize);
    observer.observe(container);
    if (interactive) {
      canvas.addEventListener('pointermove', updatePointer);
      canvas.addEventListener('pointerleave', clearPointer);
    }
    resize();
    if (intro) startTime = performance.now();
    frameId = window.requestAnimationFrame(draw);

    return () => {
      observer.disconnect();
      window.cancelAnimationFrame(frameId);
      if (interactive) {
        canvas.removeEventListener('pointermove', updatePointer);
        canvas.removeEventListener('pointerleave', clearPointer);
      }
    };
  }, [
    baseOpacity,
    bulgeStrength,
    cursorRadius,
    dotRadius,
    dotSpacing,
    gradientAngle,
    gradientFrom,
    gradientTo,
    glowColor,
    glowIntensity,
    glowRadius,
    interactive,
    intro,
    maxDevicePixelRatio,
    opacity,
    speed,
    waveAmplitude,
  ]);

  return (
    <div
      ref={containerRef}
      className={`dot-field ${className}`.trim()}
      style={style}
      aria-hidden="true"
    >
      <canvas ref={canvasRef} className="dot-field__canvas" />
    </div>
  );
}
