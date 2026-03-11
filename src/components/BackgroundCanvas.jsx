/* eslint-disable */
import React, { useRef, useEffect } from 'react';
import { useLocation } from 'react-router-dom';

function BackgroundCanvas({
                            backgroundColor = '#111111',
                            baseDensity = 14000,
                          }) {
  const location = useLocation();
  const canvasRef = useRef(null);
  const starsRef = useRef([]);
  const mouseRef = useRef({ x: null, y: null });
  const requestRef = useRef();
  const lastTimeRef = useRef(performance.now());

  const REPULSE_DISTANCE = 120;
  const REPULSE_STRENGTH = 5.0;
  const SPRINGINESS = 0.02;
  const FRICTION = 0.82;
  const CONNECT_DISTANCE = 140;

  // We check if we should be animating
  const isProjectsPage = location.pathname === '/projects';

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d', { alpha: false });

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      initStars(canvas.width, canvas.height);

      // If we are on projects page, we need to draw one single frame 
      // immediately after resize so the screen isn't blank
      if (isProjectsPage) {
        drawStaticFrame();
      }
    };

    const initStars = (w, h) => {
      starsRef.current = [];
      const cellSize = Math.sqrt(baseDensity);
      const cols = Math.ceil(w / cellSize);
      const rows = Math.ceil(h / cellSize);

      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          const centerX = c * cellSize + cellSize / 2;
          const centerY = r * cellSize + cellSize / 2;
          const spawnX = centerX + (Math.random() - 0.5) * cellSize * 0.8;
          const spawnY = centerY + (Math.random() - 0.5) * cellSize * 0.8;

          starsRef.current.push({
            spawnX, spawnY, x: spawnX, y: spawnY,
            radius: Math.random() * 1.5 + 0.5,
            vx: 0, vy: 0,
          });
        }
      }
    };

    // Helper to draw a single frame without calculations
    const drawStaticFrame = () => {
      ctx.fillStyle = backgroundColor;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      const limitSq = CONNECT_DISTANCE * CONNECT_DISTANCE;
      for (let i = 0; i < starsRef.current.length; i++) {
        for (let j = i + 1; j < starsRef.current.length; j++) {
          const a = starsRef.current[i];
          const b = starsRef.current[j];
          const dx = a.x - b.x;
          const dy = a.y - b.y;
          const dSq = dx * dx + dy * dy;
          if (dSq < limitSq) {
            const opacity = (1 - Math.sqrt(dSq) / CONNECT_DISTANCE) * 0.4;
            ctx.strokeStyle = `rgba(255, 255, 255, ${opacity})`;
            ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); ctx.stroke();
          }
        }
      }
      ctx.fillStyle = 'white';
      starsRef.current.forEach(star => {
        ctx.beginPath(); ctx.arc(star.x, star.y, star.radius, 0, Math.PI * 2); ctx.fill();
      });
    };

    const animate = (currentTime) => {
      // THE FIX: If we move to projects, stop the loop
      if (isProjectsPage) {
        cancelAnimationFrame(requestRef.current);
        return;
      }

      const deltaTime = (currentTime - lastTimeRef.current) / 16.67;
      lastTimeRef.current = currentTime;
      const dt = Math.min(deltaTime, 2);

      ctx.fillStyle = backgroundColor;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Physics logic
      starsRef.current.forEach(star => {
        if (mouseRef.current.x !== null) {
          const dx = star.x - mouseRef.current.x;
          const dy = star.y - mouseRef.current.y;
          const distSq = dx * dx + dy * dy;
          if (distSq < REPULSE_DISTANCE * REPULSE_DISTANCE) {
            const dist = Math.sqrt(distSq);
            const force = (REPULSE_DISTANCE - dist) / REPULSE_DISTANCE * REPULSE_STRENGTH;
            star.vx += (dx / dist) * force * dt;
            star.vy += (dy / dist) * force * dt;
          }
        }
        star.vx += (star.spawnX - star.x) * SPRINGINESS * dt;
        star.vy += (star.spawnY - star.y) * SPRINGINESS * dt;
        star.vx *= Math.pow(FRICTION, dt);
        star.vy *= Math.pow(FRICTION, dt);
        star.x += star.vx * dt;
        star.y += star.vy * dt;
      });

      // Connections
      const limitSq = CONNECT_DISTANCE * CONNECT_DISTANCE;
      for (let i = 0; i < starsRef.current.length; i++) {
        for (let j = i + 1; j < starsRef.current.length; j++) {
          const a = starsRef.current[i];
          const b = starsRef.current[j];
          const dSq = (a.x - b.x)**2 + (a.y - b.y)**2;
          if (dSq < limitSq) {
            const opacity = (1 - Math.sqrt(dSq) / CONNECT_DISTANCE) * 0.4;
            ctx.strokeStyle = `rgba(255, 255, 255, ${opacity})`;
            ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); ctx.stroke();
          }
        }
      }

      // Particles
      ctx.fillStyle = 'white';
      starsRef.current.forEach(star => {
        ctx.beginPath(); ctx.arc(star.x, star.y, star.radius, 0, Math.PI * 2); ctx.fill();
      });

      requestRef.current = requestAnimationFrame(animate);
    };

    const handleMove = (e) => {
      const clientX = e.touches ? e.touches[0].clientX : e.clientX;
      const clientY = e.touches ? e.touches[0].clientY : e.clientY;
      mouseRef.current = { x: clientX, y: clientY };
    };

    window.addEventListener('resize', resize);
    window.addEventListener('mousemove', handleMove);
    window.addEventListener('touchstart', handleMove, { passive: true });
    window.addEventListener('touchmove', handleMove, { passive: true });

    resize();
    if (!isProjectsPage) {
      requestRef.current = requestAnimationFrame(animate);
    }

    return () => {
      window.removeEventListener('resize', resize);
      window.removeEventListener('mousemove', handleMove);
      window.removeEventListener('touchstart', handleMove);
      window.removeEventListener('touchmove', handleMove);
      cancelAnimationFrame(requestRef.current);
    };
  }, [backgroundColor, baseDensity, isProjectsPage]); // Triggers when isProjectsPage changes

  return (
      <canvas
          ref={canvasRef}
          style={{
            position: 'fixed', top: 0, left: 0,
            width: '100vw', height: '100vh',
            zIndex: -1, background: backgroundColor,
            display: 'block', pointerEvents: 'none'
          }}
      />
  );
}

export default BackgroundCanvas;