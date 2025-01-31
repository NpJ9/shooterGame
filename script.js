const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");
const scoreCounter = document.getElementById("score");
const soundsArray = ["1.wav", "2.wav",  "3.wav", "4.wav"];
const start = document.getElementById("start");
const reset = document.getElementById("reset");
const backgroundMusic = new Audio("backgroundmusic.wav");

let audioIndex = 0;
let circle = new Path2D();
let enemy = new Path2D();
let enemies = [];
let hits = 0;
let lines = [];
let score = 0;
let enemyX = 800 ;
let enemyY = 500;
let enemyRadius = 20;
let enemySpeed = 5;
let enemyVX = enemySpeed;
let enemyVY = enemySpeed;
let x = 500;
let y = 500;
const velocity = 5;
const keys = {};
let tooRight = false; 
let tooLeft = false;
let tooHigh = false;
let tooLow = false;
let gameStarted = false;

window.addEventListener('resize' ,resize, false) // Resize canvas 
resize()
function resize(){
    canvas.height = window.innerHeight * 0.9;
    canvas.width = window.innerWidth * 0.9;
};

function drawCircle() { // Draw Character Circle
ctx.clearRect(0, 0, canvas.width, canvas.height);
    lines.forEach(line => {
        ctx.stroke(line);
    });
    circle = new Path2D();
    circle.arc(x, y, 40, 0, 2 * Math.PI);
    ctx.fillStyle ="#FC5185";
    ctx.strokeStyle= "#FC5185"
    ctx.lineWidth = 8;
    ctx.stroke(circle);
    ctx.fill(circle);    
};





function drawEnemy(){ // Draws enemy
    let enemyRadius = 20;
    enemy = new Path2D();
    enemy.arc(enemyX, enemyY, enemyRadius, 0, 2 * Math.PI);
    ctx.fillStyle = "#FC5185";
    ctx.strokeStyle= "#FC5185"
    ctx.lineWidth = 8;
    ctx.fill(enemy);
    ctx.stroke(enemy);
};

function moveEnemy(){
    enemyX += enemyVX;
    enemyY += enemyVY;

    if(enemyX - enemyRadius <= 0 || enemyX + enemyRadius >= canvas.width){
        enemyVX *= -1; // Reverse direction
    }

    if(enemyY - enemyRadius <= 0 || enemyY + enemyRadius >= canvas.height){
        enemyVY *= -1; // Reverse direction
    }
}

function getRandomEnemyPosition(){ // Get Random Enemy position after 3 hits
    enemyX = Math.floor(Math.random() * (canvas.width - 20));
    enemyY = Math.floor(Math.random() * (canvas.height - 20));
};


window.addEventListener("keydown", (e) =>{
    keys[e.key] = true;
});

window.addEventListener("keyup", (e) =>{
    keys[e.key] = false;
});

function moveCircle() { // Moves Circle on KeyPress Also Acts As Game Loop
    if(gameStarted === false) return;
    if (keys["d"] && !tooRight){
        x += velocity
    };

    if (keys["a"] && !tooLeft){
        x -= velocity
    };

    if (keys["s"] && !tooLow){
        y += velocity;
    };

    if (keys["w"] && !tooHigh){
        y -= velocity;
    };

    moveEnemy();
    drawCircle();
    drawEnemy();
    checkCollisions();
    requestAnimationFrame(moveCircle);
    winConditions();
};

function checkCollisions(){    // Checks X Axis For Collisions
    if(x > (canvas.width - 20)){
        console.log("Too far right")
        tooRight = true
    } else if (x < (20)){
        console.log("Too far left")
        tooLeft = true;
    } else {
        tooLeft = false;
        tooRight = false;
    };

    if (y > (canvas.height - 20)){    // Checks y Axis For Collisions
        console.log("Too far down")
        tooLow = true; 
    } else if (y < (20)){
        console.log("Too far up")
        tooHigh = true;
    } else {
        tooHigh = false;
        tooLow = false;
    };
};

canvas.addEventListener('mousedown', function (e) {// Draws Shooting Lines According to MouseDown Location
    e.preventDefault();
    if(gameStarted === false) return;
    let mouseX = e.offsetX;
    let mouseY = e.offsetY;
    let line = new Path2D();
    line.moveTo(mouseX, mouseY);
    line.lineTo(x, y);
    ctx.fillStyle ="#FC5185";
    ctx.strokeStyle= "#FC5185";
    ctx.stroke(line);
    lines.push(line);
    setTimeout(() => {
        lines.shift(); // Removes First Line after 50ms
    }, 50); 

});


canvas.addEventListener('mousedown', function (e){ // Checks If Enemy Is Hit
    if(gameStarted === false) return;
    let mouseX = e.offsetX;
    let mouseY = e.offsetY;

    if (enemy && ctx.isPointInPath(enemy, mouseX , mouseY)){
        console.log("Hit the enemy")
        hits +=1 ;
        console.log("Total enemy hits: " + hits);
    }

    if (hits === 3){
        getRandomEnemyPosition();
        hits = 0;
        score += 1;
        scoreCounter.innerText = score;
    }    
    playRandomNote();
});


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

function winConditions(){ // Check Win Conditions
    if(score === 3){
        gameStarted = false;
        endGame();
        score = 0;
    }
}

start.addEventListener('click' ,(e) => { // Start Game
    gameStarted = true;
    playRandomNote();
    playBackgroundMusic();
    moveCircle();
    start.classList.add("turnOffDisplay"); 
    scoreCounter.classList.remove("turnOffDisplay"); 
    canvas.classList.add("startGame");
});

reset.addEventListener('click' , (e) => {
    playRandomNote();
    gameStarted = false;
    reset.classList.add("turnOffDisplay"); 
    canvas.classList.add("startGame"); 
})

function endGame() { // End Game
    gameStarted = false;
    playBackgroundMusic();
    setTimeout(function() {endGameSound()}, 800); // Plays Win Audio On Slight Delay
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    start.classList.remove("turnOffDisplay"); 
    scoreCounter.classList.add("turnOffDisplay"); 
    reset.classList.remove("turnOffDisplay"); 
    canvas.classList.remove("startGame"); 
    scoreCounter.innerHTML = "0";
};