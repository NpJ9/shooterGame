const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");
const scoreCounter = document.getElementById("score");
const start = document.getElementById("start");
const reset = document.getElementById("reset");
const points = document.getElementById("points");
const container = document.getElementById("container");
const percentage = document.getElementById("percentage");
const soundsArray = ["1.wav", "2.wav",  "3.wav", "4.wav"];
const backgroundMusic = new Audio("backgroundmusic.wav");
const keys = {};
let enemiesArray = [];
let bullets = [];

let audioIndex = 0;
let totalShots = 0;
let hits = 0;
let score = 0;
let numEnemies = 6;
let gameStarted = false;
let gameOver = false;

// Resize canvas 

window.addEventListener('resize' ,resize, false) // Resize canvas 

function resize(){
    canvas.height = window.innerHeight * 0.9;
    canvas.width = window.innerWidth * 0.9;
};

start.addEventListener('click' ,(e) => { // Start Game
    gameStarted = true;
    gameOver = false;
    score = 0;
    totalShots = 0;
    accuracy= 0;
    player.x = 500;
    player.y = 500;
    container.classList.add("turnOffDisplay"); 
    start.classList.add("turnOffDisplay"); 
    scoreCounter.classList.remove("turnOffDisplay"); 
    canvas.classList.add("startGame"); 
    generateEnemies();   
    gameLoop();
    playRandomNote();
    playBackgroundMusic();
});

reset.addEventListener('click' , (e) => {
    playRandomNote();
    container.classList.add("turnOffDisplay"); 
    canvas.classList.add("startGame"); 
    start.classList.remove("turnOffDisplay"); 
});

class Player {
    constructor(x, y, radius, color, speed) {
        this.x = x;
        this.y = y;
        this.radius = radius;
        this.color = color;
        this.speed = speed;
        this.keys = {};

        // Movement Event Listeners

        window.addEventListener("keydown", (e) => this.keys[e.key] = true); 
        window.addEventListener("keyup", (e) => this.keys[e.key] = false);
    }

    // New movement handler for player : Also handles collisions with canvas

    move(canvas) {
        if (this.keys["d"] && this.x + this.radius < canvas.width) {
            this.x += this.speed;
        }
        if (this.keys["a"] && this.x - this.radius > 0) {
            this.x -= this.speed;
        }
        if (this.keys["s"] && this.y + this.radius < canvas.height){
            this.y += this.speed
            
        }
        if (this.keys["w"] && this.y - this.radius > 0){
            this.y -= this.speed
        }
    }
        
    draw(ctx) {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.fillStyle = this.color;
        ctx.fill();
        ctx.strokeStyle ="black";
        ctx.lineWidth = 3;
        ctx.stroke();
        ctx.closePath();
    }
}

// New Enemy Class

class Enemy {
    constructor(x, y, radius, color, speed){
        this.x = x;
        this.y = y;
        this.radius = radius;
        this.color = color;
        this.speed = speed;
        this.randomEnemyPosition();
        let angle = Math.random() * Math.PI * 2; // Randomizes veclotu cirection (-1 or 1)
        this.enemyVX = Math.cos(angle) * this.speed;
        this.enemyVY = Math.sin(angle) * this.speed;
    }

    enemyMove(){
        this.x +=  this.enemyVX;
        this.y +=  this.enemyVY;
    
        if(this.x - this.radius <= 0 || this.x + this.radius >= canvas.width){
            this.enemyVX *= -1; // Reverse direction
        }
    
        if(this.y - this.radius <= 0 || this.y + this.radius >= canvas.height){
            this.enemyVY *= -1; // Reverse direction
        }
    }

    enemyDraw(){
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, 2 * Math.PI);
        ctx.fillStyle = this.color;
        ctx.fill();
        ctx.strokeStyle ="red";
        ctx.lineWidth = 3;
        ctx.stroke();
        ctx.closePath();
    }

    randomEnemyPosition(){
        do {
            this.x = Math.floor(Math.random() * (canvas.width - 30));
            this.y = Math.floor(Math.random() * (canvas.height - 30));
            let dx = player.x - this.x;
            let dy = player.y - this.y;
            var distance = Math.sqrt(dx * dx + dy * dy);
        } while (distance < 100); // Not spawn at same position of Player
        
    }
}

let player = new Player(500,500, 40, "black", 5);

class Bullet {
    constructor(x, y, targetX, targetY, radius, color, speed){
        this.x = x;
        this.y = y;
        this.radius = radius;
        this.color = color;
        this.speed = speed;
        let dx = targetX - this.x;
        let dy = targetY - this.y;
        let distance = Math.sqrt(dx * dx + dy * dy);
        this.vx = (dx / distance) * this.speed;
        this.vy = (dy / distance) * this.speed;
    }

    bulletMove(){
        this.x +=  this.vx;
        this.y +=  this.vy;
    }

    bulletDraw(){
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.fillStyle = "red";
        ctx.fill();
        ctx.closePath();
    }

    outOfBound(canvas){ // Removes Bullets When They Leave Canvas
        return(
            this.x < 0 || this.x > canvas.width ||
            this.y < 0 || this.y > canvas.height
        );
    }
}

// Enemy Generator

function generateEnemies() {
    enemiesArray = [];
    for (let i = 0; i < numEnemies; i ++){
        let enemy = new Enemy(Math.random() * canvas.width, Math.random() * canvas.height, 20, "red", 3); // Generate new enemy
        enemiesArray.push(enemy)
    }
}

// Main Game Loop Handles Drawing/Animation

function gameLoop(){
    if (gameStarted === false) return
    
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    player.move(canvas);
    player.draw(ctx);
    enemiesArray.forEach((enemy) => {
        enemy.enemyMove();
        enemy.enemyDraw();
    });

    bullets.forEach((bullet, index) => { // For each bullet move/draw and check if out of bounds
        bullet.bulletMove();
        bullet.bulletDraw(ctx);

        if (bullet.outOfBound(canvas)) {
            bullets.splice(index, 1);
        };
    });
    checkPlayerCollision();
    checksBulletCollisions();
    requestAnimationFrame(gameLoop);
    winConditions();
}


function checkPlayerCollision(){
    enemiesArray.forEach(enemy => { // For each enemy in enemy array check for collisions
    let dx = player.x - enemy.x;
    let dy = player.y - enemy.y;
    let distance = Math.sqrt(dx * dx + dy * dy);
    if (distance < player.radius && enemy.radius && !gameOver){ // 40 player radius and 20 for enemy radius
        console.log("Collision");
        gameOver = true;
        endGame();
    }; 
    });
}

function checksBulletCollisions(){
    bullets.forEach((bullet, bulletIndex) => { // for each bullet and enemie check their relative positions 
        enemiesArray.forEach((enemy, enemyIndex) => {
            let dx = enemy.x - bullet.x;
            let dy = enemy.y - bullet.y;
            let distance = Math.sqrt(dx * dx + dy * dy);    
    
        if (distance < bullet.radius + enemy.radius){ // Check collision condition 
            console.log("You hit an enemy!");
            score += 1;
            enemiesArray.splice(enemyIndex, 1); // Removes enemy on collision 
            bullets.splice(bulletIndex, 1); // Removes bullet on collision
            scoreCounter.innerText = score;
            }
        });
    });
};

// Check Win Conditions

function winConditions(){ 
    if(score === numEnemies){
        score = 0;
        gameOver = true;
        endGame();
    };
};

function calculateAccuracy(){
    let accuracy = score / totalShots * 100;
    accuracy = parseInt(accuracy);
    percentage.innerText = accuracy + "%";
    switch(true) {

        case (isNaN(accuracy)):
            percentage.style.color = "red";
            percentage.innerText = "0%";
            break;
        case (accuracy >= 80):
            percentage.style.color = "green";
            break;
        case (accuracy < 80 && accuracy >= 60):
            percentage.style.color = "orange";
            break;
        case (accuracy < 60):
            percentage.style.color = "red";
        break;
    };
};


// End Game

function endGame() {
    if (!gameOver) return
    calculateAccuracy();
    gameStarted = false;
    gameOver = false;
    playBackgroundMusic();
    container.classList.remove("turnOffDisplay"); 
    scoreCounter.classList.add("turnOffDisplay"); 
    canvas.classList.remove("startGame"); 
    scoreCounter.innerHTML = "0";
    setTimeout(() => {
        if (!gameOver) {  // Ensure it plays only once
            gameOver = true; // Mark game as ended
            endGameSound();
        };
    }, 200); 
    ctx.clearRect(0, 0, canvas.width, canvas.height);
};

// Game Sounds 

function playRandomNote() { 
    const newSound = new Audio(soundsArray[audioIndex]) 
    if (audioIndex === 3){audioIndex = 0};
    audioIndex = audioIndex + 1;
    newSound.currentime = 0;
    newSound.volume = 0.2;
    newSound.play();
    }

function playBackgroundMusic() {
    if(gameStarted) {
        backgroundMusic.loop = true;
        backgroundMusic.volume = 0.4;
        backgroundMusic.play();
    } else  {
        backgroundMusic.pause();
        backgroundMusic.currentTime = 0
    };
}

function endGameSound() { 
    let endSound = new Audio("endGameSound.wav");
    endSound.pause();
    endSound.currentime = 0;
    endSound.volume = 0.4;
    endSound.play();
};

resize();