const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");
const scoreCounter = document.getElementById("score");
const soundsArray = ["1.wav", "2.wav",  "3.wav", "4.wav"];
const start = document.getElementById("start");
const reset = document.getElementById("reset");
const backgroundMusic = new Audio("backgroundmusic.wav");

let audioIndex = 0;
let hits = 0;
let score = 0;
const keys = {};
let tooRight = false; 
let tooLeft = false;
let tooHigh = false;
let tooLow = false;
let gameStarted = false;
let gameOver = false;

window.addEventListener('resize' ,resize, false) // Resize canvas 

resize();

function resize(){
    canvas.height = window.innerHeight * 0.9;
    canvas.width = window.innerWidth * 0.9;
};

class Player {
    constructor(x, y, radius, color, speed) {
        this.x = x;
        this.y = y;
        this.radius = radius;
        this.color = color;
        this.speed = speed;
        this.keys = {};

        // Event listeners for movement
        window.addEventListener("keydown", (e) => this.keys[e.key] = true); 
        window.addEventListener("keyup", (e) => this.keys[e.key] = false);
    }

    // New movement handler for player

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

const player = new Player(500,500, 40, "black", 5);


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
            this.x = Math.floor(Math.random() * (canvas.width - 20));
            this.y = Math.floor(Math.random() * (canvas.height - 20));
            let dx = player.x - this.x;
            let dy = player.y - this.y;
            var distance = Math.sqrt(dx * dx + dy * dy);
        } while (distance < 100); // Not spawn at same position of Player
        
    }
}


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

    outOfBound(canvas){ // removes bullets if leave the canvas
        return(
            this.x < 0 || this.x > canvas.width ||  // if x/y coordinates outside of canvas do this
            this.y < 0 || this.y > canvas.height
        );

    }
}

// CLICK TO CREATE BULLETS

let bullets = [];

canvas.addEventListener('click', (e) => { // Adds a bullet to array from posiiton of player to mouse position
    let bullet = new Bullet(player.x, player.y, e.offsetX, e.offsetY, 10 , "red", 10);
    bullets.push(bullet);
    console.log(bullets)
    playRandomNote();
    
});


// Enemy Generator

let enemiesArray = [];

function generateEnemies(numEnemies = 5) {
    enemiesArray = [];
    for (let i = 0; i < numEnemies; i ++){
        let enemy = new Enemy(Math.random() * canvas.width, Math.random() * canvas.height, 20, "red", 3); // Generate new enemy
        enemiesArray.push(enemy)
    }
    
}

function gameLoop(){
    
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
        }
    });

    checkPlayerCollision();
    checksBulletCollisions();
    requestAnimationFrame(gameLoop);
  
}


// Collisions Functions 

function checkCollisions(){    // Checks X Axis For Collisions
    if(player.x > (canvas.width - 40)){
        tooRight = true
    } else if (player.x < (40)){
        tooLeft = true;
    } else {
        tooLeft = false;
        tooRight = false;
    };

    if (player.y > (canvas.height - 40)){    // Checks y Axis For Collisions
        tooLow = true; 
    } else if (player.y < (40)){
        tooHigh = true;
    } else {
        tooHigh = false;
        tooLow = false;
    };
};

function checkPlayerCollision(){
    enemiesArray.forEach(enemy => { // For each enemy in enemy array check for collisions
    let dx = player.x - enemy.x;
    let dy = player.y - enemy.y;

    let distance = Math.sqrt(dx * dx + dy * dy);
    if (distance < player.radius && enemy.radius && !gameOver){// 40 player radius and 20 for enemy radius
        console.log("Collision");
        gameOver = true;
        endGame();
    } 
    })

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
}

// SOUNDS 

function playRandomNote() { // Plays Random Note On Click
    const newSound = new Audio(soundsArray[audioIndex]) 
    if (audioIndex === 3){audioIndex = 0};
    audioIndex = audioIndex + 1;
    newSound.currentime = 0;
    newSound.volume = 0.2;
    newSound.play();
    }

function playBackgroundMusic() { // Plays Background Music
    if(gameStarted) {
        backgroundMusic.loop = true;
        backgroundMusic.volume = 0.4;
        backgroundMusic.play();
    } else  {
        backgroundMusic.pause();
        backgroundMusic.currentTime = 0
    };
  
}

function endGameSound() { // Play Game End Sound 
    const endSound = new Audio("endGameSound.wav");
    endSound.currentime = 0;
    endSound.volume = 0.4;
    endSound.play();
};

// Win conditions

function winConditions(){ // Check Win Conditions
    if(score === 3){
        gameStarted = false;
        endGame();
        score = 0;
        enemiesArray =[];
        bullets = [];
        numEnemies = 0;
    }
}

start.addEventListener('click' ,(e) => { // Start Game
    gameStarted = true;
    generateEnemies();

    start.classList.add("turnOffDisplay"); 
    scoreCounter.classList.remove("turnOffDisplay"); 
    canvas.classList.add("startGame");    
    gameLoop();
    // getRandomEnemyPosition();
    playRandomNote();
    playBackgroundMusic();
 
});

reset.addEventListener('click' , (e) => {
    circle = null;
    enemy = null;
    playRandomNote();
    gameStarted = false;
    reset.classList.add("turnOffDisplay"); 
    canvas.classList.add("startGame"); 
})

function endGame(bullet) { // End Game
    if (!gameOver) return
    gameStarted = false;
    start.classList.remove("turnOffDisplay"); 
    scoreCounter.classList.add("turnOffDisplay"); 
    reset.classList.remove("turnOffDisplay"); 
    canvas.classList.remove("startGame"); 
    playBackgroundMusic();
    setTimeout(() => {
        if (!gameOver) {  // Ensure it plays only once
            endGameSound();
            gameOver = true; // Mark game as ended
        }
    }, 400); 
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    scoreCounter.innerHTML = "0";
    gameOver = false;
};



// TO DO
// Check if player collides with enemy 
// Learn about classes to add bullets that when collide with enemy remove points
// Refactor and make player into class too 
// Make circle function into game loop 




// function drawCircle() { // Draw Character Circle
// ctx.clearRect(0, 0, canvas.width, canvas.height);

//     circle = new Path2D();
//     circle.arc(x, y, 40, 0, 2 * Math.PI);
//     ctx.fillStyle ="#FC5185";
//     ctx.strokeStyle= "#FC5185"
//     ctx.lineWidth = 8; 
//     ctx.stroke(circle);
//     ctx.fill(circle);    
// };


    // if(gameStarted === false) return;
    // if (keys["d"] && !tooRight){
    //     x += velocity
    // };

    // if (keys["a"] && !tooLeft){
    //     x -= velocity
    // };

    // if (keys["s"] && !tooLow){
    //     y += velocity;
    // };

    // if (keys["w"] && !tooHigh){
    //     y -= velocity;
    // };


    

// function drawEnemy(){ // Draws enemy
//     let enemyRadius = 20;
//     enemy = new Path2D();
//     enemy.arc(enemyX, enemyY, enemyRadius, 0, 2 * Math.PI);
//     ctx.fillStyle = "#FC5185";
//     ctx.strokeStyle= "#FC5185"
//     ctx.lineWidth = 8;
//     ctx.fill(enemy);
//     ctx.stroke(enemy);
// };

// function moveEnemy(){
//     enemyX += enemyVX;
//     enemyY += enemyVY;

//     if(enemyX - enemyRadius <= 0 || enemyX + enemyRadius >= canvas.width){
//         enemyVX *= -1; // Reverse direction
//     }

//     if(enemyY - enemyRadius <= 0 || enemyY + enemyRadius >= canvas.height){
//         enemyVY *= -1; // Reverse direction
//     }
// }


// Old event listeners for movement 
// window.addEventListener("keydown", (e) => this.keys[e.key] = true);

// window.addEventListener("keyup", (e) => this.keys[e.key] = false);



// function moveCircle() { // Moves Circle on KeyPress Also Acts As Game Loop
//     // if(gameStarted === false) return;
//     // if (keys["d"] && !tooRight){
//     //     x += velocity
//     // };

//     // if (keys["a"] && !tooLeft){
//     //     x -= velocity
//     // };

//     // if (keys["s"] && !tooLow){
//     //     y += velocity;
//     // };

//     // if (keys["w"] && !tooHigh){
//     //     y -= velocity;
//     // };

  
//     // drawEnemy(); 
//     // moveEnemy();
//     checkCollisions();
//     requestAnimationFrame(moveCircle);
//     checkPlayerCollision();
//     winConditions();

// };






// canvas.addEventListener('mousedown', function (e) {// Draws Shooting Lines According to MouseDown Location
//     e.preventDefault();
//     if(gameStarted === false) return;
//     let mouseX = e.offsetX;
//     let mouseY = e.offsetY;
//     let line = new Path2D();
//     line.moveTo(mouseX, mouseY);
//     line.lineTo(player.x, player.y);
//     ctx.fillStyle ="#FC5185";
//     ctx.strokeStyle= "#FC5185";
//     ctx.stroke(line);
//     lines.push(line);
//     setTimeout(() => {
//         lines.shift(); // Removes First Line after 50ms
//     }, 50); 

// });


// canvas.addEventListener('mousedown', function (e){ // Checks If Enemy Is Hit
//     if(gameStarted === false) return;
//     let mouseX = e.offsetX;
//     let mouseY = e.offsetY;

//     if (enemy && ctx.isPointInPath(enemy, mouseX , mouseY)){
//         console.log("Hit the enemy")
//         hits +=1 ;
//         console.log("Total enemy hits: " + hits);
//     }

//     if (hits === 3){
//         getRandomEnemyPosition();
//         hits = 0;
//         score += 1;
//         scoreCounter.innerText = score;
//     }    
//     playRandomNote();
// });

