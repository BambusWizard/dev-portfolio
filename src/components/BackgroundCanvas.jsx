/* eslint-disable */
import React, { useRef, useEffect, useImperativeHandle, forwardRef } from 'react';
import { useLocation } from 'react-router-dom';

/**
 * High-Performance Background Canvas
 * Features:
 * 1. Spatial Partitioning Grid (O(n) complexity vs O(n^2))
 * 2. Alpha Bucketing (Batched draw calls for transparency)
 * 3. Auto-pause on specific routes
 */
const BackgroundCanvas = forwardRef(({
                                       backgroundColor = '#111111',
                                       baseDensity = 14000,
                                       externalPause = false,
                                     }, ref) => {
  const location = useLocation();
  const canvasRef = useRef(null);
  const starsRef = useRef([]);
  const mouseRef = useRef({ x: null, y: null });
  const requestRef = useRef();
  const lastTimeRef = useRef(performance.now());

  // Animation state tracking
  const isRunningRef = useRef(true);

  // Expose control to parent components
  useImperativeHandle(ref, () => ({
    getIsRunning: () => isRunningRef.current,
    setIsRunning: (val) => { isRunningRef.current = val; }
  }));

  // Constants for behavior
  const REPULSE_DISTANCE = 120;
  const REPULSE_STRENGTH = 5.0;
  const SPRINGINESS = 0.02;
  const FRICTION = 0.82;
  const CONNECT_DISTANCE = 140;
  const GRID_SIZE = CONNECT_DISTANCE; // Cells sized to match max connection length

  const isProjectsPage = location.pathname === '/projects';

  useEffect(() => {
    // Determine if we should be animating
    isRunningRef.current = !isProjectsPage && !externalPause;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d', { alpha: false }); // Optimization: Opaque background

    const initStars = (w, h) => {
      starsRef.current = [];
      const cellSize = Math.sqrt(baseDensity);
      const cols = Math.ceil(w / cellSize);
      const rows = Math.ceil(h / cellSize);

      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          const spawnX = (c * cellSize) + (Math.random() * cellSize);
          const spawnY = (r * cellSize) + (Math.random() * cellSize);
          starsRef.current.push({
            spawnX, spawnY, x: spawnX, y: spawnY,
            radius: Math.random() * 1.5 + 0.5,
            vx: 0, vy: 0,
          });
        }
      }
    };

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      initStars(canvas.width, canvas.height);
      // If paused, draw one static frame so the background isn't black
      if (!isRunningRef.current) drawFrame(0);
    };

    const drawFrame = (dt) => {
      ctx.fillStyle = backgroundColor;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // 1. PHYSICS UPDATE
      starsRef.current.forEach(star => {
        if (isRunningRef.current && mouseRef.current.x !== null) {
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
        // Return to home position logic
        star.vx += (star.spawnX - star.x) * SPRINGINESS * dt;
        star.vy += (star.spawnY - star.y) * SPRINGINESS * dt;
        star.vx *= Math.pow(FRICTION, dt);
        star.vy *= Math.pow(FRICTION, dt);
        star.x += star.vx * dt;
        star.y += star.vy * dt;
      });

      // 2. SPATIAL GRID CONSTRUCTION
      // Instead of comparing every star to every star, we bucket them by location
      const grid = new Map();
      starsRef.current.forEach(star => {
        const gx = Math.floor(star.x / GRID_SIZE);
        const gy = Math.floor(star.y / GRID_SIZE);
        const key = `${gx},${gy}`;
        if (!grid.has(key)) grid.set(key, []);
        grid.get(key).push(star);
      });

      // 3. BATCHED LINE DRAWING (Alpha Bucketing)
      const limitSq = CONNECT_DISTANCE * CONNECT_DISTANCE;
      const opacityBuckets = { 1: [], 2: [], 3: [], 4: [] };

      starsRef.current.forEach(a => {
        const gx = Math.floor(a.x / GRID_SIZE);
        const gy = Math.floor(a.y / GRID_SIZE);

        // Check neighbors (using offset to avoid redundant distance checks)
        for (let ox = 0; ox <= 1; ox++) {
          for (let oy = -1; oy <= 1; oy++) {
            const neighbors = grid.get(`${gx + ox},${gy + oy}`);
            if (neighbors) {
              neighbors.forEach(b => {
                if (a === b) return;
                const dx = a.x - b.x;
                const dy = a.y - b.y;
                const dSq = dx * dx + dy * dy;

                if (dSq < limitSq) {
                  const dist = Math.sqrt(dSq);
                  const alpha = (1 - dist / CONNECT_DISTANCE) * 0.4;
                  const bucket = Math.ceil(alpha * 10);
                  if (opacityBuckets[bucket]) {
                    opacityBuckets[bucket].push(a.x, a.y, b.x, b.y);
                  }
                }
              });
            }
          }
        }
      });

      // Draw all lines for each opacity level in one go
      Object.keys(opacityBuckets).forEach(b => {
        const lines = opacityBuckets[b];
        if (lines.length === 0) return;
        ctx.beginPath();
        ctx.strokeStyle = `rgba(255, 255, 255, ${b / 10})`;
        ctx.lineWidth = 0.8;
        for (let i = 0; i < lines.length; i += 4) {
          ctx.moveTo(lines[i], lines[i+1]);
          ctx.lineTo(lines[i+2], lines[i+3]);
        }
        ctx.stroke();
      });

      // 4. BATCHED STAR DRAWING
      ctx.beginPath();
      ctx.fillStyle = 'white';
      starsRef.current.forEach(star => {
        ctx.moveTo(star.x + star.radius, star.y);
        ctx.arc(star.x, star.y, star.radius, 0, Math.PI * 2);
      });
      ctx.fill();
    };

    const animate = (currentTime) => {
      const deltaTime = (currentTime - lastTimeRef.current) / 16.67;
      lastTimeRef.current = currentTime;
      const dt = Math.min(deltaTime, 2);

      drawFrame(dt);

      if (isRunningRef.current) {
        requestRef.current = requestAnimationFrame(animate);
      }
    };

    window.addEventListener('resize', resize);
    const handleMove = (e) => {
      const clientX = e.touches ? e.touches[0].clientX : e.clientX;
      const clientY = e.touches ? e.touches[0].clientY : e.clientY;
      mouseRef.current = { x: clientX, y: clientY };
    };

    window.addEventListener('mousemove', handleMove);
    window.addEventListener('touchstart', handleMove, { passive: true });
    window.addEventListener('touchmove', handleMove, { passive: true });

    resize();
    requestRef.current = requestAnimationFrame(animate);

    return () => {
      window.removeEventListener('resize', resize);
      window.removeEventListener('mousemove', handleMove);
      window.removeEventListener('touchstart', handleMove);
      window.removeEventListener('touchmove', handleMove);
      cancelAnimationFrame(requestRef.current);
    };
  }, [backgroundColor, baseDensity, isProjectsPage, externalPause]);

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
});

export default BackgroundCanvas;