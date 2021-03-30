const SnakeGame = {
    TILE_SIZE: 10,
    tick: 0,
    apple: { x: 10, y: 10 },
    snake: {
        head: { x: 5, y: 5 },
        body: [{ x: 4, y: 5 }, { x: 3, y: 5 }, { x: 2, y: 5 }, { x: 1, y: 5 }],
        direction: 0,
        direction: "down"
    },
    renderPixel(x, y, ctx) {
        ctx.fillRect(x * this.TILE_SIZE, y * this.TILE_SIZE, this.TILE_SIZE, this.TILE_SIZE);
    },
    handleDeath(x, y) {
        let died = false;
        if (x < 0 || x > 29 || y < 0 || y > 29) {
            died = true;
        }
        this.snake.body.forEach(({ x: x2, y: y2 }) => {
            if (x === x2 && y === y2) {
                died = true;
            }
        })
        if (died) {
            this.apple = { x: 10, y: 10 },
                this.snake = {
                    head: { x: 5, y: 5 },
                    body: [{ x: 4, y: 5 }, { x: 3, y: 5 }, { x: 2, y: 5 }, { x: 1, y: 5 }],
                    direction: 0,
                    direction: "down"
                };
        }
    },
    reset() {
        this.apple = { x: 10, y: 10 },
            this.snake = {
                head: { x: 5, y: 5 },
                body: [{ x: 4, y: 5 }, { x: 3, y: 5 }, { x: 2, y: 5 }, { x: 1, y: 5 }],
                direction: 0,
                direction: "down"
            };
    },
    updateSnake() {
        if (!(this.snake.head.x === this.apple.x && this.snake.head.y === this.apple.y)) {
            this.snake.body.pop();
        } else {
            addCoins(1);
            this.apple.x = Math.floor(Math.random() * 29) + 1
            this.apple.y = Math.floor(Math.random() * 29) + 1
        }
        this.snake.body.unshift({
            x: this.snake.head.x,
            y: this.snake.head.y
        });
    },
    update(ctx) {
        ctx.fillStyle = "black";
        ctx.fillRect(0, 0, this.TILE_SIZE * 30, this.TILE_SIZE * 30);
        ctx.fillStyle = "green";
        this.renderPixel(this.apple.x, this.apple.y, ctx);
        ctx.fillStyle = "blue";
        this.renderPixel(this.snake.head.x, this.snake.head.y, ctx);
        this.snake.body.forEach(body => {
            this.renderPixel(body.x, body.y, ctx);
        })
        if (this.tick % 4 === 0) {
            switch (this.snake.direction) {
                case "right":
                    this.updateSnake();
                    this.handleDeath(
                        this.snake.head.x + 1,
                        this.snake.head.y);
                    this.snake.head.x += 1;
                    break;
                case "left":
                    this.updateSnake();
                    this.handleDeath(
                        this.snake.head.x - 1,
                        this.snake.head.y
                    );
                    this.snake.head.x -= 1;
                    break;
                case "up":
                    this.updateSnake();
                    this.handleDeath(
                        this.snake.head.x,
                        this.snake.head.y - 1
                    );
                    this.snake.head.y -= 1;
                    break;
                case "down":
                    this.updateSnake();
                    this.handleDeath(
                        this.snake.head.x,
                        this.snake.head.y + 1
                    );
                    this.snake.head.y += 1;
                    break;
            }
        }
        this.tick++;
    }
}

/*const canvas = document.getElementById('test');
const ctx = canvas.getContext("2d");
  
setInterval(() => {
  SnakeGame.update(ctx);
}, 33);
  
document.onkeydown = (e) => {
  if (e.key === "ArrowRight") {
        if (SnakeGame.snake.direction !== "left") {
            SnakeGame.snake.direction = "right";
        }
    }
    if (e.key === "ArrowLeft") {
        if (SnakeGame.snake.direction !== "right") {
            SnakeGame.snake.direction = "left";
        }
    }
    if (e.key === "ArrowUp") {
        if (SnakeGame.snake.direction !== "down") {
            SnakeGame.snake.direction = "up";
        }
    }
    if (e.key === "ArrowDown") {
        if (SnakeGame.snake.direction !== "up") {
            SnakeGame.snake.direction = "down";
        }
    }
}*/