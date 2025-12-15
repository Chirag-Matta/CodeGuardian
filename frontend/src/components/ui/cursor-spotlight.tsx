// frontend/src/components/ui/cursor-spotlight.tsx
'use client';

import { useEffect, useRef, useState } from 'react';
import { cn } from '@/lib/utils';

export function CursorSpotlight() {
  const divRef = useRef<HTMLDivElement>(null);
  const requestRef = useRef<number>(0);
  const [opacity, setOpacity] = useState(0);
  
  // Coordinates for movement
  const mousePos = useRef({ x: 0, y: 0 });
  const currentPos = useRef({ x: 0, y: 0 });

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      mousePos.current = { x: e.clientX, y: e.clientY };
      setOpacity(1);
    };

    const handleMouseLeave = () => {
      setOpacity(0);
    };

    const handleMouseEnter = () => {
      setOpacity(1);
    };

    const animate = () => {
      // 1. Smooth Movement (Lerp)
      const ease = 0.1; // Lower = smoother/slower catch-up
      currentPos.current.x += (mousePos.current.x - currentPos.current.x) * ease;
      currentPos.current.y += (mousePos.current.y - currentPos.current.y) * ease;

      // 2. Breathing Animation (Size Change)
      // Uses time to create a sine wave that goes between 1.0 and 1.2 scale
      const time = Date.now() * 0.0015; // Speed of the breath
      const scale = 1 + Math.sin(time) * 0.15; // Amplitude of size change

      if (divRef.current) {
        // Center offset (half of 500px width/height)
        const x = currentPos.current.x - 250;
        const y = currentPos.current.y - 250;
        
        // Apply position AND scale
        divRef.current.style.transform = `translate3d(${x}px, ${y}px, 0) scale(${scale})`;
      }

      requestRef.current = requestAnimationFrame(animate);
    };

    window.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseleave', handleMouseLeave);
    document.addEventListener('mouseenter', handleMouseEnter);
    
    requestRef.current = requestAnimationFrame(animate);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseleave', handleMouseLeave);
      document.removeEventListener('mouseenter', handleMouseEnter);
      cancelAnimationFrame(requestRef.current);
    };
  }, []);

  return (
    <div
      ref={divRef}
      className={cn(
        "pointer-events-none fixed top-0 left-0 z-30 h-[500px] w-[500px] transition-opacity duration-700",
        // Visual Style:
        // - No background color needed, we use the gradient below
        // - blur-2xl: Softens the gradient bands
        "blur-2xl"
      )}
      style={{
        opacity,
        // The Aura Gradient:
        // Bright blue core (0.1 opacity) -> Fades to transparent
        background: `radial-gradient(circle, rgba(79, 70, 229, 0.15) 0%, rgba(59, 130, 246, 0.05) 45%, transparent 70%)`,
        // Initialize off-screen
        transform: 'translate3d(-1000px, -1000px, 0)',
      }}
    />
  );
}