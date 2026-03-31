class LetterGame {
    constructor() {
        this.stage = document.getElementById('stage');
        this.collectionBar = document.getElementById('collection-bar');
        this.timerBar = document.getElementById('timer-bar');
        this.phaseLabel = document.getElementById('phase-label');
        this.statusMsg = document.getElementById('status-msg');
        this.waveCounter = document.getElementById('wave-counter');
        this.overlay = document.getElementById('game-overlay');
        this.overlayTitle = document.getElementById('overlay-title');
        this.overlayDesc = document.getElementById('overlay-desc');

        this.letters = [];
        this.collected = [];
        this.wave = 1;
        this.phase = 'prep'; // 'prep' or 'action'
        this.timer = 0;
        this.interval = null;
        this.isPlaying = false;

        window.addEventListener('keydown', (e) => this.handleInput(e));
    }

    start() {
        this.overlay.style.display = 'none';
        this.wave = 1;
        this.isPlaying = true;
        this.startWave();
    }

    startWave() {
        this.waveCounter.textContent = `WAVE ${this.wave}`;
        this.letters = this.generateLetters(6);
        this.collected = [];
        this.collectionBar.innerHTML = '';
        this.renderLetters();
        this.startPhase('prep');
    }

    generateLetters(count) {
        const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
        const result = [];
        const used = new Set();
        while (result.length < count) {
            const char = alphabet[Math.floor(Math.random() * alphabet.length)];
            if (!used.has(char)) {
                used.add(char);
                result.push({
                    char: char,
                    x: 20 + Math.random() * 300,
                    y: 20 + Math.random() * 300,
                    rotation: Math.random() * 360,
                    element: null,
                    isCollected: false
                });
            }
        }
        return result;
    }

    renderLetters() {
        // Remove old letters
        const oldLetters = this.stage.querySelectorAll('.letter');
        oldLetters.forEach(el => el.remove());

        this.letters.forEach(l => {
            const el = document.createElement('div');
            el.className = 'letter';
            el.textContent = l.char;
            el.style.left = `${l.x}px`;
            el.style.top = `${l.y}px`;
            el.style.transform = `rotate(${l.rotation}deg)`;
            this.stage.appendChild(el);
            l.element = el;
        });
    }

    startPhase(phase) {
        this.phase = phase;
        this.timer = 5.0;
        document.body.className = `${phase}-mode`;
        
        if (phase === 'prep') {
            this.phaseLabel.textContent = 'PREPARATION';
            this.statusMsg.textContent = 'MEMORIZE!';
        } else {
            this.phaseLabel.textContent = 'ACTION';
            this.statusMsg.textContent = 'TYPE NOW!';
        }

        if (this.interval) clearInterval(this.interval);
        this.interval = setInterval(() => this.tick(), 100);
    }

    tick() {
        this.timer -= 0.1;
        if (this.timer <= 0) {
            this.timer = 0;
            if (this.phase === 'prep') {
                this.startPhase('action');
            } else {
                this.gameOver();
            }
        }
        this.updateTimerUI();
    }

    updateTimerUI() {
        const percent = (this.timer / 5) * 100;
        this.timerBar.style.width = `${percent}%`;
    }

    handleInput(e) {
        if (!this.isPlaying || this.phase !== 'action') return;

        const char = e.key.toUpperCase();
        const target = this.letters.find(l => l.char === char && !l.isCollected);

        if (target) {
            this.collectLetter(target);
        }
    }

    collectLetter(letter) {
        letter.isCollected = true;
        this.collected.push(letter);
        
        const el = letter.element;
        el.classList.add('letter-collected');
        this.collectionBar.appendChild(el);

        if (this.collected.length === this.letters.length) {
            this.winWave();
        }
    }

    winWave() {
        clearInterval(this.interval);
        this.statusMsg.textContent = 'WAVE COMPLETE!';
        this.wave++;
        setTimeout(() => this.startWave(), 1000);
    }

    gameOver() {
        this.isPlaying = false;
        clearInterval(this.interval);
        this.statusMsg.textContent = 'TIME OUT!';
        this.overlay.style.display = 'flex';
        this.overlayTitle.textContent = 'GAME OVER';
        this.overlayDesc.textContent = `You reached Wave ${this.wave}`;
        document.querySelector('.btn-start').textContent = 'RETRY';
    }
}

const game = new LetterGame();
