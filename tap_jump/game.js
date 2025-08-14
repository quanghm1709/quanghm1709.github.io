const canvas = document.getElementById('flappy');
const ctx = canvas.getContext('2d');

const GRAVITY = 0.35;
const FLAP = -7;
const PIPE_WIDTH = 60;
const PIPE_GAP = 150;
const PIPE_SPEED = 2;
const BIRD_RADIUS = 18;

let bird = {
  x: canvas.width / 4,
  y: canvas.height / 2,
  velocity: 0,
};

let pipes = [];
let frame = 0;
let score = 0;
let best = 0;
let gameOver = false;

// Draw bird
function drawBird() {
  ctx.beginPath();
  ctx.arc(bird.x, bird.y, BIRD_RADIUS, 0, Math.PI * 2);
  ctx.fillStyle = "#ffe066";
  ctx.fill();
  ctx.strokeStyle = "#e1a200";
  ctx.stroke();
  // Simple eye
  ctx.beginPath();
  ctx.arc(bird.x + 7, bird.y - 5, 3, 0, Math.PI * 2);
  ctx.fillStyle = "#222";
  ctx.fill();
}

// Draw pipes
function drawPipes() {
  ctx.fillStyle = "#2ecc40";
  pipes.forEach(pipe => {
    // Top pipe
    ctx.fillRect(pipe.x, 0, PIPE_WIDTH, pipe.top);
    // Bottom pipe
    ctx.fillRect(pipe.x, pipe.bottom, PIPE_WIDTH, canvas.height - pipe.bottom);
  });
}

// Draw score
function drawScore() {
  ctx.fillStyle = "#fff";
  ctx.font = "32px Arial";
  ctx.fillText(score, canvas.width / 2 - 8, 50);
  ctx.font = "16px Arial";
  ctx.fillText(`Best: ${best}`, 10, 30);
  if (gameOver) {
    ctx.font = "bold 36px Arial";
    ctx.fillStyle = "#e74c3c";
    ctx.fillText("Game Over", canvas.width / 2 - 100, canvas.height / 2 - 40);
    ctx.font = "20px Arial";
    ctx.fillStyle = "#fff";
    ctx.fillText("Click or press Space to restart", canvas.width / 2 - 120, canvas.height / 2);
  }
}

// Reset game
function reset() {
  bird.y = canvas.height / 2;
  bird.velocity = 0;
  pipes = [];
  frame = 0;
  score = 0;
  gameOver = false;
}

// Main update function
function update() {
  if (gameOver) return;

  bird.velocity += GRAVITY;
  bird.y += bird.velocity;

  // Add pipes
  if (frame % 90 === 0) {
    let top = Math.random() * (canvas.height - PIPE_GAP - 100) + 50;
    pipes.push({
      x: canvas.width,
      top: top,
      bottom: top + PIPE_GAP,
      passed: false
    });
  }

  // Move pipes and check for collision
  pipes.forEach(pipe => {
    pipe.x -= PIPE_SPEED;

    // Score
    if (!pipe.passed && pipe.x + PIPE_WIDTH < bird.x - BIRD_RADIUS) {
      score++;
      pipe.passed = true;
      best = Math.max(best, score);
    }

    // Collision
    if (
      bird.x + BIRD_RADIUS > pipe.x && bird.x - BIRD_RADIUS < pipe.x + PIPE_WIDTH &&
      (bird.y - BIRD_RADIUS < pipe.top || bird.y + BIRD_RADIUS > pipe.bottom)
    ) {
      gameOver = true;
    }
  });

  // Remove offscreen pipes
  pipes = pipes.filter(pipe => pipe.x + PIPE_WIDTH > 0);

  // Ground and ceiling collision
  if (bird.y + BIRD_RADIUS > canvas.height || bird.y - BIRD_RADIUS < 0) {
    gameOver = true;
  }

  frame++;
}

// Draw everything
function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  drawPipes();
  drawBird();
  drawScore();
}

// Game loop
function loop() {
  update();
  draw();
  requestAnimationFrame(loop);
}

// Flap event
function flap() {
  if (gameOver) {
    reset();
    return;
  }
  bird.velocity = FLAP;
}

document.addEventListener('keydown', (e) => {
  if (e.code === 'Space') flap();
});
canvas.addEventListener('mousedown', flap);

reset();
loop();
