/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useRef, useState } from 'react';
import { Trophy, Play, RotateCcw, Pause } from 'lucide-react';

// Constants
const PLAYER_SIZE = 40;
const ENEMY_SIZE = 35;
const BULLET_SIZE = 6;
const BULLET_SPEED = 7;
const ENEMY_SPEED_MIN = 2;
const ENEMY_SPEED_MAX = 5;
const SPAWN_RATE = 60; // Frames between enemy spawns
const FIRE_RATE = 15; // Frames between bullet fires

interface Entity {
  x: number;
  y: number;
  width: number;
  height: number;
}

interface Bullet extends Entity {
  active: boolean;
}

interface Enemy extends Entity {
  speed: number;
  active: boolean;
}

export default function App() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [gameState, setGameState] = useState<'START' | 'PLAYING' | 'GAMEOVER' | 'PAUSED'>('START');
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(0);

  // Game variables (refs to avoid re-renders during game loop)
  const playerRef = useRef({ x: 0, y: 0 });
  const bulletsRef = useRef<Bullet[]>([]);
  const enemiesRef = useRef<Enemy[]>([]);
  const frameCountRef = useRef(0);
  const requestRef = useRef<number>(null);

  // Image assets
  const playerImgRef = useRef<HTMLImageElement | null>(null);
  const enemyImgRef = useRef<HTMLImageElement | null>(null);

  // Load images
  useEffect(() => {
    const pImg = new Image();
    pImg.src = 'https://cdn-icons-png.flaticon.com/512/571/571035.png'; // Replace with your player image URL
    pImg.onload = () => { playerImgRef.current = pImg; };

    const eImg = new Image();
    eImg.src = 'https://cdn-icons-png.flaticon.com/512/571/571038.png'; // Replace with your enemy image URL
    eImg.onload = () => { enemyImgRef.current = eImg; };
  }, []);

  // Initialize player position
  useEffect(() => {
    if (containerRef.current) {
      const { width, height } = containerRef.current.getBoundingClientRect();
      playerRef.current = { x: width / 2, y: height - 100 };
    }
  }, []);

  const resetGame = () => {
    setScore(0);
    bulletsRef.current = [];
    enemiesRef.current = [];
    frameCountRef.current = 0;
    if (containerRef.current) {
      const { width, height } = containerRef.current.getBoundingClientRect();
      playerRef.current = { x: width / 2, y: height - 100 };
    }
    setGameState('PLAYING');
  };

  const spawnEnemy = (canvasWidth: number) => {
    const x = Math.random() * (canvasWidth - ENEMY_SIZE);
    enemiesRef.current.push({
      x,
      y: -ENEMY_SIZE,
      width: ENEMY_SIZE,
      height: ENEMY_SIZE,
      speed: Math.random() * (ENEMY_SPEED_MAX - ENEMY_SPEED_MIN) + ENEMY_SPEED_MIN,
      active: true,
    });
  };

  const fireBullet = () => {
    bulletsRef.current.push({
      x: playerRef.current.x,
      y: playerRef.current.y - 20,
      width: BULLET_SIZE,
      height: BULLET_SIZE * 2,
      active: true,
    });
  };

  const checkCollision = (rect1: Entity, rect2: Entity) => {
    return (
      rect1.x < rect2.x + rect2.width &&
      rect1.x + rect1.width > rect2.x &&
      rect1.y < rect2.y + rect2.height &&
      rect1.y + rect1.height > rect2.y
    );
  };

  const update = (width: number, height: number) => {
    frameCountRef.current++;

    // Fire bullets
    if (frameCountRef.current % FIRE_RATE === 0) {
      fireBullet();
    }

    // Spawn enemies
    if (frameCountRef.current % SPAWN_RATE === 0) {
      spawnEnemy(width);
    }

    // Update bullets
    bulletsRef.current.forEach((bullet) => {
      bullet.y -= BULLET_SPEED;
      if (bullet.y < -bullet.height) bullet.active = false;
    });
    bulletsRef.current = bulletsRef.current.filter((b) => b.active);

    // Update enemies
    enemiesRef.current.forEach((enemy) => {
      enemy.y += enemy.speed;
      if (enemy.y > height) enemy.active = false;

      // Check collision with player
      const playerRect = {
        x: playerRef.current.x - PLAYER_SIZE / 2,
        y: playerRef.current.y - PLAYER_SIZE / 2,
        width: PLAYER_SIZE,
        height: PLAYER_SIZE,
      };
      if (checkCollision(playerRect, enemy)) {
        setGameState('GAMEOVER');
      }
    });
    enemiesRef.current = enemiesRef.current.filter((e) => e.active);

    // Check collisions (bullets vs enemies)
    bulletsRef.current.forEach((bullet) => {
      enemiesRef.current.forEach((enemy) => {
        if (checkCollision(bullet, enemy)) {
          bullet.active = false;
          enemy.active = false;
          setScore((s) => s + 10);
        }
      });
    });
  };

  const draw = (ctx: CanvasRenderingContext2D, width: number, height: number) => {
    ctx.clearRect(0, 0, width, height);

    // Draw background stars (simple)
    ctx.fillStyle = '#ffffff';
    for (let i = 0; i < 50; i++) {
      const x = (Math.sin(i + frameCountRef.current * 0.01) * width + width) % width;
      const y = (i * 20 + frameCountRef.current * 2) % height;
      ctx.fillRect(x, y, 2, 2);
    }

    // Draw player
    const px = playerRef.current.x;
    const py = playerRef.current.y;

    if (playerImgRef.current) {
      ctx.drawImage(
        playerImgRef.current,
        px - PLAYER_SIZE / 2,
        py - PLAYER_SIZE / 2,
        PLAYER_SIZE,
        PLAYER_SIZE
      );
    } else {
      ctx.fillStyle = '#3b82f6'; // fallback
      ctx.beginPath();
      ctx.moveTo(px, py - 20);
      ctx.lineTo(px - 20, py + 20);
      ctx.lineTo(px + 20, py + 20);
      ctx.closePath();
      ctx.fill();
    }

    // Draw bullets
    ctx.fillStyle = '#facc15'; // yellow-400
    bulletsRef.current.forEach((bullet) => {
      ctx.fillRect(bullet.x - bullet.width / 2, bullet.y, bullet.width, bullet.height);
    });

    // Draw enemies
    enemiesRef.current.forEach((enemy) => {
      if (enemyImgRef.current) {
        ctx.save();
        ctx.translate(enemy.x + enemy.width / 2, enemy.y + enemy.height / 2);
        ctx.rotate(Math.PI); // Rotate 180 deg to face down
        ctx.drawImage(
          enemyImgRef.current,
          -enemy.width / 2,
          -enemy.height / 2,
          enemy.width,
          enemy.height
        );
        ctx.restore();
      } else {
        ctx.fillStyle = '#ef4444';
        ctx.beginPath();
        ctx.moveTo(enemy.x + enemy.width / 2, enemy.y + enemy.height);
        ctx.lineTo(enemy.x, enemy.y);
        ctx.lineTo(enemy.x + enemy.width, enemy.y);
        ctx.closePath();
        ctx.fill();
      }
    });
  };

  const gameLoop = () => {
    if (gameState !== 'PLAYING') return;

    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx) return;

    update(canvas.width, canvas.height);
    draw(ctx, canvas.width, canvas.height);

    requestRef.current = requestAnimationFrame(gameLoop);
  };

  useEffect(() => {
    if (gameState === 'PLAYING') {
      requestRef.current = requestAnimationFrame(gameLoop);
    }
    return () => {
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
    };
  }, [gameState]);

  useEffect(() => {
    if (score > highScore) {
      setHighScore(score);
    }
  }, [score]);

  const handleMouseMove = (e: React.MouseEvent | React.TouchEvent) => {
    if (gameState !== 'PLAYING') return;
    
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    let clientX, clientY;

    if ('touches' in e) {
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
    } else {
      clientX = (e as React.MouseEvent).clientX;
      clientY = (e as React.MouseEvent).clientY;
    }

    const x = clientX - rect.left;
    const y = clientY - rect.top;

    // Clamp values
    playerRef.current = {
      x: Math.max(20, Math.min(canvas.width - 20, x)),
      y: Math.max(20, Math.min(canvas.height - 20, y)),
    };
  };

  // Handle Resize
  useEffect(() => {
    const handleResize = () => {
      if (containerRef.current && canvasRef.current) {
        const { width, height } = containerRef.current.getBoundingClientRect();
        canvasRef.current.width = width;
        canvasRef.current.height = height;
      }
    };

    window.addEventListener('resize', handleResize);
    handleResize();
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <div 
      ref={containerRef}
      className="relative w-full h-screen bg-slate-950 overflow-hidden font-sans text-white select-none touch-none"
    >
      {/* Game Canvas */}
      <canvas
        ref={canvasRef}
        onMouseMove={handleMouseMove}
        onTouchMove={handleMouseMove}
        className="block w-full h-full cursor-none"
      />

      {/* UI Overlay */}
      <div className="absolute top-0 left-0 w-full p-6 flex justify-between items-start pointer-events-none">
        <div className="flex flex-col gap-1">
          <div className="text-xs uppercase tracking-widest text-slate-400 font-semibold">Score</div>
          <div className="text-4xl font-black tabular-nums">{score}</div>
        </div>
        <div className="flex flex-col items-end gap-1">
          <div className="flex items-center gap-2 text-xs uppercase tracking-widest text-slate-400 font-semibold">
            <Trophy size={12} /> High Score
          </div>
          <div className="text-2xl font-bold tabular-nums text-yellow-500">{highScore}</div>
        </div>
      </div>

      {/* Start Screen */}
      {gameState === 'START' && (
        <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm flex flex-col items-center justify-center p-4">
          <div className="text-6xl md:text-8xl font-black mb-2 text-transparent bg-clip-text bg-gradient-to-b from-blue-400 to-blue-600 italic uppercase tracking-tighter">
            Sky Strike
          </div>
          <div className="text-blue-300/60 uppercase tracking-[0.3em] text-sm mb-12 font-semibold">Ace Combat Edition</div>
          
          <button
            onClick={resetGame}
            className="group relative px-12 py-4 bg-blue-600 hover:bg-blue-500 transition-all rounded-full font-bold text-xl flex items-center gap-3 shadow-lg shadow-blue-500/20 active:scale-95 pointer-events-auto"
          >
            <Play fill="currentColor" size={24} />
            START MISSION
          </button>
          
          <div className="mt-12 text-slate-500 text-sm flex flex-col items-center gap-2">
            <p>Drag mouse or finger to move</p>
            <p>Auto-firing enabled</p>
          </div>
        </div>
      )}

      {/* Game Over Screen */}
      {gameState === 'GAMEOVER' && (
        <div className="absolute inset-0 bg-red-950/90 backdrop-blur-md flex flex-col items-center justify-center p-4 animate-in fade-in duration-500">
          <div className="text-7xl md:text-9xl font-black mb-4 text-red-500 italic uppercase tracking-tighter">
            CRASHED
          </div>
          <div className="text-red-300/60 uppercase tracking-[0.2em] text-lg mb-8 font-semibold">Mission Failed</div>
          
          <div className="bg-white/5 border border-white/10 rounded-2xl p-8 mb-12 flex flex-col items-center gap-4 min-w-[300px]">
            <div className="text-slate-400 uppercase text-xs tracking-widest font-bold">Final Score</div>
            <div className="text-6xl font-black">{score}</div>
          </div>

          <button
            onClick={resetGame}
            className="group relative px-12 py-4 bg-white text-slate-950 hover:bg-slate-200 transition-all rounded-full font-bold text-xl flex items-center gap-3 shadow-xl active:scale-95 pointer-events-auto"
          >
            <RotateCcw size={24} />
            RETRY MISSION
          </button>
        </div>
      )}

      {/* Pause Button (Optional) */}
      {gameState === 'PLAYING' && (
        <button 
          onClick={() => setGameState('PAUSED')}
          className="absolute bottom-6 right-6 p-4 bg-white/5 hover:bg-white/10 border border-white/10 rounded-full text-white/50 hover:text-white transition-all pointer-events-auto"
        >
          <Pause size={24} />
        </button>
      )}

      {/* Paused Screen */}
      {gameState === 'PAUSED' && (
        <div className="absolute inset-0 bg-slate-950/60 backdrop-blur-sm flex flex-col items-center justify-center p-4">
          <div className="text-6xl font-black mb-12 text-white italic uppercase tracking-tighter">
            PAUSED
          </div>
          <button
            onClick={() => setGameState('PLAYING')}
            className="group relative px-12 py-4 bg-blue-600 hover:bg-blue-500 transition-all rounded-full font-bold text-xl flex items-center gap-3 shadow-lg active:scale-95 pointer-events-auto"
          >
            <Play fill="currentColor" size={24} />
            RESUME
          </button>
        </div>
      )}
    </div>
  );
}
