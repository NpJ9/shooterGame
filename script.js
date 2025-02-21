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

const addEnemy = document.getElementById("addEnemy");
const minusEnemy = document.getElementById("minusEnemy");
const enemyNumContainer = document.getElementById("enemyNumContainer");
const enemyNumber = document.getElementById("enemyCount");

let enemiesArray = [];
let bullets = [];
let audioIndex = 0;
let totalShots = 0;
let hits = 0;
let score = 0;
let bulletSpeed = 7.5;
let numEnemies = 5;
let numBosses = 5;
let bulletSize = 10;
let numPickUps = 1;
let pickUpArray  = [];
let bossHealth = 5;
let bombArray = [];
let numBombs = 5;
let explosionParticleArray = [];
let bombParticleArray  =[];
let shotgunArray = [];
let shotgunPickUpNum = 1;
let gameStarted = false;
let gameOver = false;


let shotgunPickedUp = false;
// TO DO
// Add levels 

minusEnemy.addEventListener("click", (e) =>{
    if (numEnemies === 1 || gameStarted === true) return;
    numEnemies = numEnemies -  1;  
    enemyNumber.textContent = numEnemies
});

addEnemy.addEventListener("click", (e) =>{
    if(gameStarted === true) return;
    numEnemies += 1;
    enemyNumber.textContent = numEnemies
});

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
    enemyNumContainer.classList.add("turnOffDisplay"); 
    canvas.classList.add("startGame"); 
    generateEnemies();   
    generateBoss();
    generateSpeedBoost();
    generatePickUp();
    generateBomb();
    generateShotgun();
    drawLeftDoor();
    drawRightDoor();
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

canvas.addEventListener('click', (e) => { // Adds a bullet to array from posiiton of player to mouse position
    if (gameStarted === false) return;
    if (shotgunPickedUp === true){
        let randomNumber = 0;
        // need to select a number from -200 to 200
        // this number is added or taken away from the offset
        // gives gun spread
        for (let i = 0; i < 5 ; i ++) {
            let bullet = new Bullet(player.x, player.y, e.offsetX + 100, e.offsetY, bulletSize , "green", bulletSpeed);
            bullets.push(bullet);
            totalShots += 1; 
            playRandomNote();    
        }
    } else {
        let bullet = new Bullet(player.x, player.y, e.offsetX, e.offsetY, bulletSize , "green", bulletSpeed);
        bullets.push(bullet);
        totalShots += 1; 
        playRandomNote(); 
    }

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
        ctx.closePath();
    }
}

// New Enemy Class

class Enemy {
    constructor(x, y, radius, color, speed, hp){
        this.x = x;
        this.y = y;
        this.radius = radius;
        this.color = color;
        this.speed = speed;
        this.hp = hp;
        this.randomEnemyPosition();
        let angle = Math.random() * Math.PI * 2; // Randomizes velocity direction (-1 or 1)
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
        const margin = 40;
        do {
            this.x = Math.floor(Math.random() * (canvas.width - 2 * margin) + margin);
            this.y = Math.floor(Math.random() * (canvas.height - 2 * margin) + margin);
            let dx = player.x - this.x;
            let dy = player.y - this.y;
            var distance = Math.sqrt(dx * dx + dy * dy);
        } while (distance < 100 ); // Not spawn at same position of Player
    }
}

let player = new Player(500,500, 40, "black", 5);

class Pickup {
    constructor(x, y, width, height, color,type){
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.color = color;
        this.type = type;
        this.randomPickUpPosition();
    }

    randomPickUpPosition(){
        const margin = 40;
        do {
            this.x = Math.floor(Math.random() * (canvas.width - 2 * margin) + margin);
            this.y = Math.floor(Math.random() * (canvas.height - 2 * margin) + margin);
            let dx = player.x - this.x;
            let dy = player.y - this.y;
            var distance = Math.sqrt(dx * dx + dy * dy);
        } while (distance < 200 ); // Not spawn at same position of Player
    }

    drawPickup(){
        ctx.beginPath();
        ctx.rect(this.x , this.y, this.width, this.height, this.color);
        ctx.fillStyle = this.color;
        ctx.fill()  
        ctx.closePath();
    }
} 
 
class Hit_Animation {
    constructor(x, y,radius, color, speed){
        this.x = x;
        this.y = y;
        this.radius = radius;
        this.color = color;
        this.speed = speed;
        let angle = Math.random() * Math.PI * 2; // Randomizes velocity direction (-1 or 1)
        this.vx = Math.cos(angle) * this.speed;
        this.vy = Math.sin(angle) * this.speed;
    }

    hitAnimationMove(){
        this.x +=  this.vx;
        this.y +=  this.vy;
    }

    hitAnimationDraw(){
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.fillStyle = this.color;
        ctx.fill();
        ctx.closePath();
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
        ctx.fillStyle = "green";
        ctx.fill();
        ctx.closePath();
    }

    outOfBound(canvas){ // Removes Bullets When They Leave Canvas
        return(
            this.x < 0 || this.x > canvas.width ||
            this.y < 0 || this.y > canvas.height
        );
    };
};

// Enemy Generator

let  speedBoostArray = [];
function generateEnemies() {
    enemiesArray = [];
    for (let i = 0; i < numEnemies; i ++){
        let enemy = new Enemy(Math.random() * canvas.width, Math.random() * canvas.height, 20, "red", 3, 1); // Generate new enemy
        enemiesArray.push(enemy)
    };
};

function generateSpeedBoost(){
    let speedBoost = new Pickup(Math.random() * canvas.width, Math.random() * canvas.height, 20, 20, "green");
    speedBoostArray.push(speedBoost);
};

function generateShotgun(){
    let shotgun = new Pickup(Math.random() * canvas.width, Math.random() * canvas.height, 20, 20, "purple");
    shotgunArray.push(shotgun);
}

function generatePickUp(){ // Generates one pickup
    let pickUp = new Pickup(Math.random() * canvas.width, Math.random() * canvas.height, 20, 20, "white");
    pickUpArray.push(pickUp)
}

function generateBomb(){
    for (let i = 0; i < numBombs; i++){
    let bomb = new Pickup(Math.random() * canvas.width, Math.random() * canvas.height, 30, 30, "black");
    bombArray.push(bomb)
    }
}

function generateBoss(){
    enemyBoss = [];
    for (let i = 0; i < numBosses; i++){
    let boss = new Enemy(Math.random() * canvas.width - 20, Math.random() * canvas.height - 20, 50, "red", 2, 5);
    enemyBoss.push(boss)
    };
}


// Main Game Loop Handles Drawing/Animation

function gameLoop(){
    if (gameStarted === false) return
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    player.move(canvas);
    player.draw(ctx);

    drawLeftDoor(); // DRAW LEFT DOOR
    drawRightDoor();

    pickUpArray.forEach((pickUp) => {
        pickUp.drawPickup() 
    });

    speedBoostArray.forEach((speedBoost) => {
        speedBoost.drawPickup();
    })

    shotgunArray.forEach((shotgun) => {
        shotgun.drawPickup();
    })

    bombArray.forEach((bomb) => {
        bomb.drawPickup() 
    });

    enemyBoss.forEach((boss) => {
        boss.enemyMove();
        boss.enemyDraw();
        // drawBossHealthBar(boss)
    });

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

    explosionParticleArray.forEach((explosionParticles) => {
        explosionParticles.hitAnimationMove();
        explosionParticles.hitAnimationDraw();
    });

    
    bombParticleArray.forEach((bombParticles) => {
        bombParticles.hitAnimationMove();
        bombParticles.hitAnimationDraw();
    });

    checkPlayerCollision();
    checksBulletCollisions();
    requestAnimationFrame(gameLoop);
    winConditions();
};

// CHECK PLAYER COLLISIONS

function checkPlayerCollision(){
    enemiesArray.forEach(enemy => { 
    let dx = player.x - enemy.x;
    let dy = player.y - enemy.y;
    let distance = Math.sqrt(dx * dx + dy * dy);
    if (distance < player.radius + 20 && enemy.radius && !gameOver ){
        gameOver = true;
        endGame();
        }; 
    });

    enemyBoss.forEach(boss => { 
        let dx = player.x - boss.x;
        let dy = player.y - boss.y;
        let distance = Math.sqrt(dx * dx + dy * dy);
        if (distance < player.radius + 40 && boss.radius && !gameOver ){ 
            gameOver = true;
            endGame();
        }; 
    });

    pickUpArray.forEach((pickUp, pickUpIndex) => { 
        let dx = player.x - pickUp.x;
        let dy = player.y - pickUp.y;
        let distance = Math.sqrt(dx * dx + dy * dy);
        if (distance < player.radius + 40 && pickUp.width && pickUp.height && !gameOver ){ 
            // pickUpArray = [];
            player.color = "blue"; 
            bulletSize = 15;
            pickUpArray.splice(pickUpIndex, 1); 
            generatePickUpSound();
        }; 
    });

    speedBoostArray.forEach((speedBoost, speedBoostIndex) => { 
        let dx = player.x - speedBoost.x;
        let dy = player.y - speedBoost.y;
        let distance = Math.sqrt(dx * dx + dy * dy);
        if (distance < player.radius + 40 && speedBoost.width && speedBoost.height && !gameOver ){ 
            bulletSpeed = 15;
            speedBoostArray.splice(speedBoostIndex, 1); 
            generatePickUpSound();
        }; 
    });

    // MAKE SHOTGUN 


    shotgunArray.forEach((shotgun, shotgunArrayIndex) => { 
        let dx = player.x - shotgun.x;
        let dy = player.y - shotgun.y;
        let distance = Math.sqrt(dx * dx + dy * dy);
        if (distance < player.radius + 40 && shotgun.width && shotgun.height && !gameOver ){ 
            // MAKE SHOTGUN BULLET IN HERE
            shotgunPickedUp = true;

            shotgunArray.splice(shotgunArrayIndex, 1); 
            generateShotgunSound();
        }; 
    });

    bombArray.forEach((bomb,bombIndex) => { 
        let dx = player.x - bomb.x;
        let dy = player.y - bomb.y;
        let distance = Math.sqrt(dx * dx + dy * dy);
        if (distance < player.radius + 40 && bomb.height && bomb.width && !gameOver ){ 
            bombArray.splice(bombIndex, 1); 
            generateBombParticles(bomb);
            generateBombSound();
        }; 
    });
};

// GENERATE PARTICLE ANIMATION EFFECTS 

function generateExplosionParticles(enemy) {
    for (let i = 0; i < 8; i ++){
        let explosionParticles = new Hit_Animation(enemy.x, enemy.y, 4, "blue", 5);
        explosionParticleArray.push(explosionParticles);
    } 
};


function generateBombParticles(bomb){
    for (let i = 0; i < 40; i ++){
        let bombParticles = new Hit_Animation(bomb.x, bomb.y, 15, "orange", 10);
        bombParticleArray.push(bombParticles);
    } 
}


// CHECK BULLET COLLISIONS

function checksBulletCollisions(){
    bullets.forEach((bullet, bulletIndex) => { // for each bullet and enemie check their relative positions 
        enemiesArray.forEach((enemy, enemyIndex) => {
            let dx = enemy.x - bullet.x;
            let dy = enemy.y - bullet.y;
            let distance = Math.sqrt(dx * dx + dy * dy);    
        if (distance < bullet.radius + enemy.radius){ // Check collision condition 
            score += 1;
            hits += 1;
            enemiesArray.splice(enemyIndex, 1); 
            bullets.splice(bulletIndex, 1); 
            generateExplosionParticles(enemy); 
            scoreCounter.innerText = score;
            }
        });
    });

    bombParticleArray.forEach((bombParticles, bombParticlesIndex) => { // for each bullet and enemie check their relative positions 
        enemiesArray.forEach((enemy, enemyIndex) => {
            let dx = enemy.x - bombParticles.x;
            let dy = enemy.y - bombParticles.y;
            let distance = Math.sqrt(dx * dx + dy * dy);    
        if (distance < bombParticles.radius + enemy.radius){ // Check collision condition 
            enemiesArray.splice(enemyIndex, 1); 
            bombParticleArray.splice(bombParticlesIndex, 1); 
            generateExplosionParticles(enemy); 
            score += 1;
            scoreCounter.innerText = score;
            }
        });
    });

    bombParticleArray.forEach((bombParticles, bombParticlesIndex) => { // for each bullet and enemie check their relative positions 
        enemyBoss.forEach((boss, bossIndex) => {
            let dx = boss.x - bombParticles.x;
            let dy = boss.y - bombParticles.y;
            let distance = Math.sqrt(dx * dx + dy * dy);    

        if (distance < bombParticles.radius + boss.radius){ // Check collision condition 
            boss.hp -= 1;
            boss.radius = boss.radius * 0.85;
            bombParticleArray.splice(bombParticlesIndex, 1); 
            generateExplosionParticles(boss); 
            if (boss.hp === 0){
                enemyBoss.splice(bossIndex, 1); 
                score += 1;
            }
            scoreCounter.innerText = score;
            }
        });
    });

// Boss Bullet detection 

    bullets.forEach((bullet, bulletIndex) => { 
        enemyBoss.forEach((boss, bossIndex) => {
            let dx = boss.x - bullet.x;
            let dy = boss.y - bullet.y;
            let distance = Math.sqrt(dx * dx + dy * dy);   
            
        if (distance < bullet.radius + boss.radius){ 
            boss.hp -= 1;
            hits += 1;
            boss.radius = boss.radius * 0.85;
            bullets.splice(bulletIndex, 1); 
            generateExplosionParticles(boss);  
            if (boss.hp === 0){
                enemyBoss.splice(bossIndex, 1); 
                score += 1;
            }
            scoreCounter.innerText = score;
            }
        });
    });
};

// Check Win Conditions

function winConditions(){ 
    let totalEnemies = numEnemies + numBosses
    if(score === totalEnemies){
        gameOver = true;
        endGame(); 
        score = 0;
        hits = 0;
    };
};

function calculateAccuracy(){
    let accuracy = hits / totalShots * 100;
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

// function drawBossHealthBar(boss){
//     ctx.fillStyle ="green";
//     ctx.fillRect(boss.x - 25, boss.y - 40, (boss.hp / 5) * 60, 10)
// }

// End Game

function endGame() {
    if (!gameOver) return
    calculateAccuracy();
    gameStarted = false;
    gameOver = false;
    explosionParticleArray = [];
    bombParticleArray = [];
    pickUpArray = [];
    bullets = [];
    bombArray = [];
    shotgunPickedUp = false;
    player.color = "black";
    bulletSize = 10;
    player.speed = 5;
    bulletSpeed = 7.5;
    playBackgroundMusic();
    container.classList.remove("turnOffDisplay"); 
    scoreCounter.classList.add("turnOffDisplay"); 
    enemyNumContainer.classList.remove("turnOffDisplay"); 
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

function generateBombSound(){
    const bombSound = new Audio("bomb.wav")
    bombSound.play();
    bombSound.volume = 0.4;
};

function generatePickUpSound(){
    const pickUpSound = new Audio("pickUpSound.wav")
    pickUpSound.play();
    pickUpSound.volume = 0.6;
};

function generateShotgunSound(){
    const shotgunSound = new Audio("shotgunSound.wav");
    shotgunSound.play();
}

function endGameSound() { 
    let endSound = new Audio("endGameSound.wav");
    endSound.pause();
    endSound.currentime = 0;
    endSound.volume = 0.4;
    endSound.play();
};

// TO DO ADD levels: User enters in either door
// Leads to a different set of enemies (Number/speed)
// Randomise the level 

function drawLeftDoor(){ 
    ctx.beginPath();
    ctx.rect(0 , canvas.height / 2  - 50, 100, 100);
    ctx.fillStyle = "black"
    ctx.fill()  
    ctx.closePath(); 
}

function drawRightDoor(){ 
    ctx.beginPath();
    ctx.rect(canvas.width - 100 , canvas.height / 2 - 50, 100, 100);
    ctx.fillStyle = "black" 
    ctx.fill()  
    ctx.closePath(); 
}


resize();


// IDEAS

// BOMB ENEMY: BLOWS UP WHEN KILLED AND CAN DAMAGE OTHER ENEMIES 

// When explosion particles leave screen delete them
// Change colour on array pickups

// Game ideas
// Pickups: Speed boost, bigger bullet, shotgun style bullet

// Rogue Like
// Entrance either side : takes to next level
// Randomize pickups on entrance: enter a new screen with 2-3 options 
// Increase difficulty: Increase Num of enemies/speed
// After 3 levels: boss level
// Boss also can shoot: Larger: can take more hits 

//     randomEnemyPosition(){
//         let minDistance = 100;
//         let maxDistance = Math.min(canvas.width, canvas.height); 

//         let validPosition = false;

//         while (!validPosition){
//         let angle = Math.random() * Math.PI * 2;
//         let distance = minDistance + Math.random() * (maxDistance - minDistance);

//         this.x = player.x + Math.cos(angle) * distance;
//         this.y = player.y + Math.sin(angle) * distance;

//         if(this.x >= 0 && this.x <= canvas.width - 30 && this.y >= 0 && this.y <= canvas.height - 30){
//             validPosition = true
//         }
//     }
// }