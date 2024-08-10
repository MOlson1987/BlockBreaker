const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// Set canvas dimensions
canvas.width = 800;
canvas.height = 600;

// Game variables
let paddleWidth = 100;
let paddleHeight = 10;
let paddleX = (canvas.width - paddleWidth) / 2;

let ballRadius = 10;
let ballX = canvas.width / 2;
let ballY = canvas.height - 30;
let ballSpeedX = 3;
let ballSpeedY = -3;

let isRightPressed = false;
let isLeftPressed = false;

let score = 0;
let lives = 3;
let level = 1; // Starting level

// Brick variables
const brickRowCount = 5;
const brickColumnCount = 9;
const brickWidth = 75;
const brickHeight = 20;
const brickPadding = 10;
const brickOffsetTop = 30;
const brickOffsetLeft = 30;

// Levels array with different brick configurations
const levels = [
    {
        bricks: [],
        rowCount: 5,
        columnCount: 9
    },
    {
        bricks: [],
        rowCount: 7,
        columnCount: 11
    }
];

// Initialize the bricks array for the current level
function initBricks(level) {
    for (let c = 0; c < levels[level - 1].columnCount; c++) {
        levels[level - 1].bricks[c] = [];
        for (let r = 0; r < levels[level - 1].rowCount; r++) {
            levels[level - 1].bricks[c][r] = { x: 0, y: 0, status: 1 };
        }
    }
}

initBricks(level); // Initialize the first level

// Event listeners for paddle movement
document.addEventListener('keydown', keyDownHandler, false);
document.addEventListener('keyup', keyUpHandler, false);
document.addEventListener('mousemove', mouseMoveHandler, false);

function keyDownHandler(e) {
    if (e.key === "Right" || e.key === "ArrowRight") {
        isRightPressed = true;
    } else if (e.key === "Left" || e.key === "ArrowLeft") {
        isLeftPressed = true;
    }
}

function keyUpHandler(e) {
    if (e.key === "Right" || e.key === "ArrowRight") {
        isRightPressed = false;
    } else if (e.key === "Left" || e.key === "ArrowLeft") {
        isLeftPressed = false;
    }
}

function mouseMoveHandler(e) {
    let relativeX = e.clientX - canvas.getBoundingClientRect().left;
    if (relativeX > 0 && relativeX < canvas.width) {
        paddleX = relativeX - paddleWidth / 2;
    }
}

// Draw the paddle
function drawPaddle() {
    ctx.beginPath();
    ctx.rect(paddleX, canvas.height - paddleHeight - 10, paddleWidth, paddleHeight);
    ctx.fillStyle = "#0095DD";
    ctx.fill();
    ctx.closePath();
}

// Draw the ball
function drawBall() {
    ctx.beginPath();
    ctx.arc(ballX, ballY, ballRadius, 0, Math.PI * 2);
    ctx.fillStyle = "#0095DD";
    ctx.fill();
    ctx.closePath();
}

// Draw the bricks for the current level
function drawBricks() {
    const currentLevel = levels[level - 1];
    for (let c = 0; c < currentLevel.columnCount; c++) {
        for (let r = 0; r < currentLevel.rowCount; r++) {
            if (currentLevel.bricks[c][r].status == 1) {
                let brickX = (c * (brickWidth + brickPadding)) + brickOffsetLeft;
                let brickY = (r * (brickHeight + brickPadding)) + brickOffsetTop;
                currentLevel.bricks[c][r].x = brickX;
                currentLevel.bricks[c][r].y = brickY;

                ctx.beginPath();
                ctx.rect(brickX, brickY, brickWidth, brickHeight);
                ctx.fillStyle = "#0095DD";
                ctx.fill();
                ctx.closePath();
            }
        }
    }
}

// Detect collisions between the ball and the bricks
function collisionDetection() {
    const currentLevel = levels[level - 1];
    for (let c = 0; c < currentLevel.columnCount; c++) {
        for (let r = 0; r < currentLevel.rowCount; r++) {
            let b = currentLevel.bricks[c][r];
            if (b.status == 1) {
                if (
                    ballX > b.x &&
                    ballX < b.x + brickWidth &&
                    ballY > b.y &&
                    ballY < b.y + brickHeight
                ) {
                    ballSpeedY = -ballSpeedY;
                    b.status = 0;
                    score++;
                    if (score == currentLevel.rowCount * currentLevel.columnCount) {
                        if (level === levels.length) {
                            alert("YOU WIN, CONGRATS!");
                            document.location.reload();
                        } else {
                            level++;
                            initBricks(level);
                            ballX = canvas.width / 2;
                            ballY = canvas.height - 30;
                            ballSpeedX = 3;
                            ballSpeedY = -3;
                            paddleX = (canvas.width - paddleWidth) / 2;
                            score = 0;
                            alert("Level " + level);
                        }
                    }
                }
            }
        }
    }
}

// Display the score
function drawScore() {
    ctx.font = "16px Arial";
    ctx.fillStyle = "#fff";
    ctx.fillText("Score: " + score, 8, 20);
}

// Display the lives
function drawLives() {
    ctx.font = "16px Arial";
    ctx.fillStyle = "#fff";
    ctx.fillText("Lives: " + lives, canvas.width - 85, 20);
}

// Update positions and game state
function update() {
    // Move paddle based on input
    if (isRightPressed && paddleX < canvas.width - paddleWidth) {
        paddleX += 7;
    } else if (isLeftPressed && paddleX > 0) {
        paddleX -= 7;
    }

    // Move ball
    ballX += ballSpeedX;
    ballY += ballSpeedY;

    // Ball collision with side walls
    if (ballX + ballRadius > canvas.width || ballX - ballRadius < 0) {
        ballSpeedX = -ballSpeedX;
    }

    // Ball collision with top wall
    if (ballY - ballRadius < 0) {
        ballSpeedY = -ballSpeedY;
    }

    // Ball collision with bottom wall (missed paddle)
    else if (ballY + ballRadius > canvas.height) {
        if (
            ballX > paddleX &&
            ballX < paddleX + paddleWidth &&
            ballY + ballRadius > canvas.height - paddleHeight - 10
        ) {
            ballSpeedY = -ballSpeedY;
        } else {
            lives--;
            if (!lives) {
                alert("GAME OVER");
                document.location.reload();
            } else {
                // Reset ball and paddle positions
                ballX = canvas.width / 2;
                ballY = canvas.height - 30;
                ballSpeedX = 4;
                ballSpeedY = -4;
                paddleX = (canvas.width - paddleWidth) / 2;
            }
        }
    }
}

// Draw the game
function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawBricks();
    drawBall();
    drawPaddle();
    drawScore();
    drawLives();
    collisionDetection();
    update();
}

// Game loop
setInterval(draw, 10);
