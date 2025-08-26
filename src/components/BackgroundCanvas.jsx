/* eslint-disable */
import React, { useRef, useEffect } from 'react';

function BackgroundCanvas({
  width = window.innerWidth,
  height = window.innerHeight,
  particleCount = 80,
  backgroundColor = '#111111', // editable background color
}) {
  const canvasRef = useRef(null);
  const starsRef = useRef([]);
  const mouseRef = useRef({ x: null, y: null });

  // ======= Editable constants =======
  const SPAWN_RADIUS = 50;          
  const REPULSE_DISTANCE = 80;      
  const REPULSE_STRENGTH = 2;       
  const SPRINGINESS = 0.02;         
  const FRICTION = 0.9;             
  const CONNECT_DISTANCE = 260;      
  const MIN_SPAWN_DISTANCE = 15;    
  // ================================

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');

    canvas.width = width;
    canvas.height = height;

    // initialize stars
    starsRef.current = [];
    for (let i = 0; i < particleCount; i++) {
      let spawnX, spawnY, valid;
      do {
        spawnX = Math.random() * width;
        spawnY = Math.random() * height;
        valid = true;
        for (let j = 0; j < starsRef.current.length; j++) {
          const dx = spawnX - starsRef.current[j].spawnX;
          const dy = spawnY - starsRef.current[j].spawnY;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < MIN_SPAWN_DISTANCE) {
            valid = false;
            break;
          }
        }
      } while (!valid);

      starsRef.current.push({
        spawnX,
        spawnY,
        x: spawnX,
        y: spawnY,
        radius: Math.random() * 1.5 + 0.5,
        color: 'white',
        vx: 0,
        vy: 0,
      });
    }

    function animate() {
      // fill background
      ctx.fillStyle = backgroundColor;
      ctx.fillRect(0, 0, width, height);

      // update stars
      starsRef.current.forEach(star => {
        if (mouseRef.current.x !== null && mouseRef.current.y !== null) {
          const dx = star.x - mouseRef.current.x;
          const dy = star.y - mouseRef.current.y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < REPULSE_DISTANCE) {
            const force = (REPULSE_DISTANCE - dist) / REPULSE_DISTANCE * REPULSE_STRENGTH;
            star.vx += (dx / dist) * force;
            star.vy += (dy / dist) * force;
          }
        }

        const dxSpawn = star.spawnX - star.x;
        const dySpawn = star.spawnY - star.y;
        star.vx += dxSpawn * SPRINGINESS;
        star.vy += dySpawn * SPRINGINESS;

        star.vx *= FRICTION;
        star.vy *= FRICTION;
        star.x += star.vx;
        star.y += star.vy;

        const dxBound = star.x - star.spawnX;
        const dyBound = star.y - star.spawnY;
        const distSqBound = dxBound * dxBound + dyBound * dyBound;
        if (distSqBound > SPAWN_RADIUS * SPAWN_RADIUS) {
          const distBound = Math.sqrt(distSqBound);
          star.x = star.spawnX + (dxBound / distBound) * SPAWN_RADIUS;
          star.y = star.spawnY + (dyBound / distBound) * SPAWN_RADIUS;
        }
      });

      // draw connections
      for (let i = 0; i < starsRef.current.length; i++) {
        for (let j = i + 1; j < starsRef.current.length; j++) {
          const a = starsRef.current[i];
          const b = starsRef.current[j];
          const dx = a.x - b.x;
          const dy = a.y - b.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < CONNECT_DISTANCE) {
            ctx.strokeStyle = `rgba(255,255,255,${1 - dist / CONNECT_DISTANCE})`;
            ctx.lineWidth = 0.5;
            ctx.beginPath();
            ctx.moveTo(a.x, a.y);
            ctx.lineTo(b.x, b.y);
            ctx.stroke();
          }
        }
      }

      // draw stars
      starsRef.current.forEach(star => {
        ctx.beginPath();
        ctx.arc(star.x, star.y, star.radius, 0, Math.PI * 2);
        ctx.fillStyle = star.color;
        ctx.fill();
      });

      requestAnimationFrame(animate);
    }

    animate();

    function handleMouseMove(e) {
      mouseRef.current.x = e.clientX;
      mouseRef.current.y = e.clientY;
    }

    function handleMouseLeave() {
      mouseRef.current.x = null;
      mouseRef.current.y = null;
    }

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseleave', handleMouseLeave);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, [width, height, particleCount, backgroundColor]);

  return <canvas ref={canvasRef} style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', zIndex: -1 }} />;
}

export default BackgroundCanvas;
