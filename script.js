const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");
const scoreCounter = document.getElementById("score");

let circle = new Path2D();
let enemy = new Path2D();
let enemies = [];
let hits = 0;
let lines = [];
let score = 0;
let enemyX = 800;
let enemyY = 500;
let x = 500;
let y = 500;
const velocity = 5;
const keys = {};
let tooRight = false;
let tooLeft = false;
let tooHigh = false;
let tooLow = false;

canvas.height = window.innerHeight * 0.85;
canvas.width = window.innerWidth * 0.9;

// Resize canvas 

window.addEventListener('resize' ,resize, false)

function resize(){
    canvas.height = window.innerHeight * 0.9;
    canvas.width = window.innerWidth * 0.9;
    console.log("resizaed");
    drawCircle();
};

// Draw first circle 

function drawCircle() {
ctx.clearRect(0, 0, canvas.width, canvas.height);

    lines.forEach(line => {
        ctx.stroke(line);
    });

    circle = new Path2D();
    circle.arc(x, y, 20, 0, 2 * Math.PI);
    ctx.fillStyle ="black";
    ctx.strokeStyle= "#00ADB5"
    ctx.lineWidth = 8;
    ctx.stroke(circle);
    ctx.fill(circle);    
};

window.addEventListener("keydown", (e) =>{
    keys[e.key] = true;
});

window.addEventListener("keyup", (e) =>{
    keys[e.key] = false;
});

// Moves Circle on KeyPress

function moveCircle() {
    
    if (keys["d"] && tooRight === true){
        x = x;
    } else if(keys["d"] && tooRight === false){
        x += velocity
    };

    if (keys["a"] && tooLeft === true){
        x = x;
    } else if(keys["a"] && tooLeft === false){
        x -= velocity
    };

    if (keys["s"] && tooLow ===true){
        y = y
    } else if(keys["s"] && tooLow ===false){
        y += velocity;
    };

    if (keys["w"] && tooHigh ===true){
        y = y
    } else if(keys["w"] && tooHigh ===false){
        y -= velocity;
    };

    drawCircle();
    drawEnemy();
    checkCollisions();

    requestAnimationFrame(moveCircle);
};

function checkCollisions(){

    // console.log("X: " + x + "Y: " + y) : Checks circle positions

    // Checks X Axis For Collisions

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

    // Checks y Axis For Collisions
    
    if (y > (canvas.height - 20)){
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

// Draws Shooting Lines According to MouseDown Location

canvas.addEventListener('mousedown', function (e){
    e.preventDefault();
    let mouseX = e.offsetX;
    let mouseY = e.offsetY;

    let line = new Path2D();

    line.moveTo(mouseX, mouseY);
    line.lineTo(x, y);

    ctx.fillStyle ="black";
    ctx.strokeStyle= "black";
    ctx.stroke(line);

    lines.push(line);

    setTimeout(() => {
        lines.shift(); // Removes First Line after 50ms
    }, 50); 

});

// Checks If Enemy Is Hit

canvas.addEventListener('mousedown', function (e){
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
});

function drawEnemy(){
    let enemyRadius = 20;

    enemy = new Path2D();
    enemy.arc(enemyX, enemyY, enemyRadius, 0, 2 * Math.PI);

    ctx.fillStyle = "black";
    ctx.strokeStyle= "black"
    ctx.lineWidth = 8;

    ctx.fill(enemy);
    ctx.stroke(enemy);
};

// Get Random Enemy position after 3 hits

function getRandomEnemyPosition(){
    enemyX = Math.floor(Math.random() * (canvas.width - 20)) + 20;
    enemyY = Math.floor(Math.random() * (canvas.height - 20)) + 20;
    
}

moveCircle();
