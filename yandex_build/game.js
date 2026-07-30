// Game state management
let gameState = 'loading'; // loading, ready, playing
let yandexSDK = null;
let loadingProgress = 0;
let canvas = null;
let ctx = null;

// Game constants
const TANK_WIDTH = 60;
const TANK_HEIGHT = 32;
const TANK_SPEED = 6;
const BULLET_WIDTH = 6;
const BULLET_HEIGHT = 18;
const BULLET_SPEED = 10;
const ENEMY_WIDTH = 48;
const ENEMY_HEIGHT = 28;
const ENEMY_SPEED = 2;
const ENEMY_INTERVAL = 60; // frames per new enemy

// Game variables
let tank = {};
let bullets = [];
let enemies = [];
let score = 0;
let best = 0;
let gameOver = false;
let frames = 0;
let TANK_Y = 0;

// Loading screen elements
const loadingScreen = document.getElementById('loadingScreen');
const gameContainer = document.getElementById('gameContainer');
const loadingProgressBar = document.getElementById('loadingProgress');
const loadingText = document.getElementById('loadingText');

// Initialize Yandex SDK and loading sequence
async function initGame() {
  try {
    // Simulate loading steps
    await updateLoadingProgress(10, 'Connecting to Yandex Games...');
    
    // Try to initialize Yandex SDK
    try {
      if (typeof YaGames !== 'undefined') {
        yandexSDK = await YaGames.init();
        await updateLoadingProgress(30, 'SDK initialized...');
      } else {
        // Fallback for local development
        console.log('Yandex SDK not available, running in development mode');
        await updateLoadingProgress(30, 'Running in development mode...');
      }
    } catch (sdkError) {
      console.log('Yandex SDK initialization failed, continuing without SDK');
      await updateLoadingProgress(30, 'Running without SDK...');
    }
    
    // Initialize canvas after HTML is loaded
    canvas = document.getElementById('tankgame');
    if (!canvas) {
      throw new Error('Canvas not found');
    }
    ctx = canvas.getContext('2d');
    TANK_Y = canvas.height - TANK_HEIGHT - 10;
    
    await updateLoadingProgress(50, 'Loading game assets...');
    
    // Simulate asset loading
    await new Promise(resolve => setTimeout(resolve, 500));
    await updateLoadingProgress(70, 'Preparing game world...');
    
    await new Promise(resolve => setTimeout(resolve, 300));
    await updateLoadingProgress(90, 'Starting game...');
    
    // Initialize game state
    initGameState();
    
    await updateLoadingProgress(100, 'Ready!');
    
    // Wait a moment before hiding loading screen
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Hide loading screen and show game
    hideLoadingScreen();
    
  } catch (error) {
    console.error('Game initialization failed:', error);
    loadingText.textContent = 'Failed to load game. Please refresh the page.';
  }
}

// Update loading progress
function updateLoadingProgress(progress, text) {
  return new Promise(resolve => {
    loadingProgress = Math.min(progress, 100);
    loadingProgressBar.style.width = loadingProgress + '%';
    loadingText.textContent = text;
    
    // Smooth animation
    setTimeout(resolve, 200);
  });
}

// Hide loading screen and show game
function hideLoadingScreen() {
  loadingScreen.style.display = 'none';
  gameContainer.style.display = 'block';
  gameState = 'ready';
  
  // Start game loop
  loop();
}

// Initialize game state
function initGameState() {
  tank = {
    x: canvas.width / 2 - TANK_WIDTH / 2,
    y: TANK_Y,
    width: TANK_WIDTH,
    height: TANK_HEIGHT,
    moveLeft: false,
    moveRight: false
  };
  
  bullets = [];
  enemies = [];
  score = 0;
  gameOver = false;
  frames = 0;
}

// Draw tank
function drawTank() {
  ctx.save();
  ctx.fillStyle = "#48d1cc";
  ctx.fillRect(tank.x, tank.y + 10, tank.width, tank.height - 10);
  ctx.fillStyle = "#198b8c";
  ctx.fillRect(tank.x + tank.width / 2 - 10, tank.y, 20, 20);
  // Barrel
  ctx.fillStyle = "#fff";
  ctx.fillRect(tank.x + tank.width / 2 - 4, tank.y - 10, 8, 24);
  ctx.restore();
}

// Draw bullets
function drawBullets() {
  ctx.fillStyle = "#ffd700";
  bullets.forEach(bullet => {
    ctx.fillRect(bullet.x, bullet.y, BULLET_WIDTH, BULLET_HEIGHT);
  });
}

// Draw enemies
function drawEnemies() {
  enemies.forEach(enemy => {
    ctx.save();
    ctx.fillStyle = "#d9534f";
    ctx.fillRect(enemy.x, enemy.y, enemy.width, enemy.height);
    ctx.fillStyle = "#fff";
    ctx.fillRect(enemy.x + 8, enemy.y + 7, 32, 4);
    ctx.restore();
  });
}

// Draw score
function drawScore() {
  ctx.fillStyle = "#fff";
  ctx.font = "28px Arial";
  ctx.fillText(`Score: ${score}`, 18, 36);
  ctx.font = "16px Arial";
  ctx.fillText(`Best: ${best}`, canvas.width - 100, 28);
  if (gameOver) {
    ctx.font = "bold 38px Arial";
    ctx.fillStyle = "#d9534f";
    ctx.fillText("GAME OVER", canvas.width / 2 - 120, canvas.height / 2 - 20);
    ctx.font = "20px Arial";
    ctx.fillStyle = "#fff";
    ctx.fillText("Press Space to Restart", canvas.width / 2 - 110, canvas.height / 2 + 30);
  }
}

// Update game state
function update() {
  if (gameState !== 'ready' || gameOver) return;

  // Move tank
  if (tank.moveLeft) tank.x -= TANK_SPEED;
  if (tank.moveRight) tank.x += TANK_SPEED;
  tank.x = Math.max(0, Math.min(canvas.width - tank.width, tank.x));

  // Move bullets
  bullets.forEach(bullet => {
    bullet.y -= BULLET_SPEED;
  });
  bullets = bullets.filter(bullet => bullet.y + BULLET_HEIGHT > 0);

  // Spawn enemies
  if (frames % ENEMY_INTERVAL === 0) {
    let ex = Math.random() * (canvas.width - ENEMY_WIDTH);
    enemies.push({x: ex, y: -ENEMY_HEIGHT, width: ENEMY_WIDTH, height: ENEMY_HEIGHT});
  }

  // Move enemies
  enemies.forEach(enemy => {
    enemy.y += ENEMY_SPEED;
  });

  // Collision: bullet vs enemy
  bullets.forEach((bullet, bIdx) => {
    enemies.forEach((enemy, eIdx) => {
      if (
        bullet.x < enemy.x + enemy.width &&
        bullet.x + BULLET_WIDTH > enemy.x &&
        bullet.y < enemy.y + enemy.height &&
        bullet.y + BULLET_HEIGHT > enemy.y
      ) {
        // Remove enemy and bullet
        enemies.splice(eIdx, 1);
        bullets.splice(bIdx, 1);
        score++;
        best = Math.max(best, score);
      }
    });
  });

  // Remove offscreen enemies
  enemies = enemies.filter(enemy => enemy.y < canvas.height);

  // Game over: enemy reaches bottom
  enemies.forEach(enemy => {
    if (enemy.y + enemy.height >= tank.y + 4) {
      gameOver = true;
    }
  });

  frames++;
}

// Draw everything
function draw() {
  if (gameState !== 'ready' || !ctx) return;
  
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  drawTank();
  drawBullets();
  drawEnemies();
  drawScore();
}

// Game loop
function loop() {
  if (gameState === 'ready') {
    update();
    draw();
  }
  requestAnimationFrame(loop);
}

// Controls
document.addEventListener('keydown', (e) => {
  if (gameState !== 'ready') return;
  
  if (e.code === 'ArrowLeft' || e.key === 'a' || e.key === 'A') tank.moveLeft = true;
  if (e.code === 'ArrowRight' || e.key === 'd' || e.key === 'D') tank.moveRight = true;
  if (e.code === 'Space') {
    if (gameOver) {
      reset();
    } else {
      // Shoot bullet
      bullets.push({
        x: tank.x + tank.width / 2 - BULLET_WIDTH / 2,
        y: tank.y - BULLET_HEIGHT,
        width: BULLET_WIDTH,
        height: BULLET_HEIGHT
      });
    }
  }
});

document.addEventListener('keyup', (e) => {
  if (gameState !== 'ready') return;
  
  if (e.code === 'ArrowLeft' || e.key === 'a' || e.key === 'A') tank.moveLeft = false;
  if (e.code === 'ArrowRight' || e.key === 'd' || e.key === 'D') tank.moveRight = false;
});

// Reset game
function reset() {
  bullets = [];
  enemies = [];
  score = 0;
  gameOver = false;
  tank.x = canvas.width / 2 - TANK_WIDTH / 2;
  frames = 0;
}

// Start the initialization when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  initGame();
});

// If DOM is already loaded, start immediately
if (document.readyState === 'loading') {
  // DOM not ready, wait for it
} else {
  // DOM is ready
  initGame();
}
