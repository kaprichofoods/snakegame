class SnakeGame {
    constructor() {
        this.boardWidth = 40;
        this.boardHeight = 50;
        this.cellSize = 12;
        
        // Estado del juego
        this.gameRunning = false;
        this.gamePaused = false;
        this.score = 0;
        this.level = 1;
        this.speed = 150; // ms entre movimientos
        
        // Serpiente
        this.snake = [
            { x: 20, y: 25 },
            { x: 19, y: 25 },
            { x: 18, y: 25 }
        ];
        this.direction = { x: 1, y: 0 };
        this.nextDirection = { x: 1, y: 0 };
        
        // Manzana
        this.apple = { x: 30, y: 20 };
        
        // Colores
        this.snakeColors = ['snake-green', 'snake-blue', 'snake-red', 'snake-black', 'snake-fuchsia', 'snake-yellow'];
        this.currentSnakeColor = 'snake-green';
        this.backgroundColors = ['level-1', 'level-2', 'level-3'];
        
        // Elementos DOM
        this.gameBoard = document.getElementById('gameBoard');
        this.gameOverlay = document.getElementById('gameOverlay');
        this.overlayTitle = document.getElementById('overlayTitle');
        this.overlaySubtitle = document.getElementById('overlaySubtitle');
        this.scoreElement = document.getElementById('score');
        this.levelElement = document.getElementById('level');
        
        this.init();
    }
    
    init() {
        this.createBoard();
        this.setupEventListeners();
        this.updateDisplay();
        this.showOverlay('Snake Game', 'Presiona ESPACIO para comenzar');
    }
    
    createBoard() {
        this.gameBoard.innerHTML = '';
        this.gameBoard.style.gridTemplateColumns = `repeat(${this.boardWidth}, ${this.cellSize}px)`;
        this.gameBoard.style.gridTemplateRows = `repeat(${this.boardHeight}, ${this.cellSize}px)`;
        
        for (let y = 0; y < this.boardHeight; y++) {
            for (let x = 0; x < this.boardWidth; x++) {
                const cell = document.createElement('div');
                cell.className = 'cell';
                cell.dataset.x = x;
                cell.dataset.y = y;
                this.gameBoard.appendChild(cell);
            }
        }
    }
    
    setupEventListeners() {
        document.addEventListener('keydown', (e) => {
            if (!this.gameRunning && e.code === 'Space') {
                this.startGame();
                return;
            }
            
            if (this.gameRunning) {
                switch (e.code) {
                    case 'ArrowUp':
                        if (this.direction.y === 0) {
                            this.nextDirection = { x: 0, y: -1 };
                        }
                        break;
                    case 'ArrowDown':
                        if (this.direction.y === 0) {
                            this.nextDirection = { x: 0, y: 1 };
                        }
                        break;
                    case 'ArrowLeft':
                        if (this.direction.x === 0) {
                            this.nextDirection = { x: -1, y: 0 };
                        }
                        break;
                    case 'ArrowRight':
                        if (this.direction.x === 0) {
                            this.nextDirection = { x: 1, y: 0 };
                        }
                        break;
                    case 'Space':
                        this.togglePause();
                        break;
                }
            }
        });
    }
    
    startGame() {
        this.gameRunning = true;
        this.gamePaused = false;
        this.hideOverlay();
        this.gameLoop();
    }
    
    togglePause() {
        this.gamePaused = !this.gamePaused;
        if (this.gamePaused) {
            this.showOverlay('Juego Pausado', 'Presiona ESPACIO para continuar');
        } else {
            this.hideOverlay();
            this.gameLoop();
        }
    }
    
    gameLoop() {
        if (!this.gameRunning || this.gamePaused) return;
        
        this.update();
        this.render();
        
        setTimeout(() => {
            this.gameLoop();
        }, this.speed);
    }
    
    update() {
        // Actualizar dirección
        this.direction = { ...this.nextDirection };
        
        // Calcular nueva posición de la cabeza
        const head = { ...this.snake[0] };
        head.x += this.direction.x;
        head.y += this.direction.y;
        
        // Verificar colisiones con bordes
        if (head.x < 0 || head.x >= this.boardWidth || 
            head.y < 0 || head.y >= this.boardHeight) {
            this.gameOver();
            return;
        }
        
        // Verificar colisión consigo misma
        if (this.snake.some(segment => segment.x === head.x && segment.y === head.y)) {
            this.gameOver();
            return;
        }
        
        // Agregar nueva cabeza
        this.snake.unshift(head);
        
        // Verificar si comió la manzana
        if (head.x === this.apple.x && head.y === this.apple.y) {
            this.score += 10;
            this.generateApple();
            this.checkLevelUp();
        } else {
            // Remover cola si no comió
            this.snake.pop();
        }
    }
    
    render() {
        // Limpiar tablero
        const cells = this.gameBoard.querySelectorAll('.cell');
        cells.forEach(cell => {
            cell.className = 'cell';
        });
        
        // Dibujar serpiente
        this.snake.forEach((segment, index) => {
            const cell = this.getCell(segment.x, segment.y);
            if (cell) {
                cell.classList.add('snake', this.currentSnakeColor);
            }
        });
        
        // Dibujar manzana
        const appleCell = this.getCell(this.apple.x, this.apple.y);
        if (appleCell) {
            appleCell.classList.add('apple');
        }
    }
    
    getCell(x, y) {
        return this.gameBoard.querySelector(`[data-x="${x}"][data-y="${y}"]`);
    }
    
    generateApple() {
        let newApple;
        do {
            newApple = {
                x: Math.floor(Math.random() * this.boardWidth),
                y: Math.floor(Math.random() * this.boardHeight)
            };
        } while (this.snake.some(segment => 
            segment.x === newApple.x && segment.y === newApple.y
        ));
        
        this.apple = newApple;
    }
    
    checkLevelUp() {
        const newLevel = Math.floor(this.score / 100) + 1;
        if (newLevel > this.level) {
            this.level = newLevel;
            this.increaseSpeed();
            this.changeSnakeColor();
            this.changeBackground();
            this.updateDisplay();
        }
    }
    
    increaseSpeed() {
        this.speed = Math.max(50, this.speed * 0.9); // Aumentar velocidad 10%
    }
    
    changeSnakeColor() {
        const availableColors = this.snakeColors.filter(color => color !== this.currentSnakeColor);
        this.currentSnakeColor = availableColors[Math.floor(Math.random() * availableColors.length)];
    }
    
    changeBackground() {
        const body = document.body;
        body.className = this.backgroundColors[(this.level - 1) % this.backgroundColors.length];
    }
    
    gameOver() {
        this.gameRunning = false;
        this.showOverlay(
            'Game Over',
            `Puntuación: ${this.score} | Nivel: ${this.level}`,
            'Presiona ESPACIO para jugar de nuevo'
        );
        this.resetGame();
    }
    
    resetGame() {
        this.score = 0;
        this.level = 1;
        this.speed = 150;
        this.snake = [
            { x: 20, y: 25 },
            { x: 19, y: 25 },
            { x: 18, y: 25 }
        ];
        this.direction = { x: 1, y: 0 };
        this.nextDirection = { x: 1, y: 0 };
        this.currentSnakeColor = 'snake-green';
        this.generateApple();
        this.updateDisplay();
        this.changeBackground();
    }
    
    showOverlay(title, subtitle, extra = '') {
        this.overlayTitle.textContent = title;
        this.overlaySubtitle.textContent = subtitle;
        
        if (extra) {
            const controlsInfo = this.gameOverlay.querySelector('.controls-info');
            if (controlsInfo) {
                controlsInfo.innerHTML = `<p>${extra}</p>`;
            }
        }
        
        this.gameOverlay.classList.remove('hidden');
    }
    
    hideOverlay() {
        this.gameOverlay.classList.add('hidden');
    }
    
    updateDisplay() {
        this.scoreElement.textContent = this.score;
        this.levelElement.textContent = this.level;
    }
}

// Inicializar el juego cuando se carga la página
document.addEventListener('DOMContentLoaded', () => {
    new SnakeGame();
});
