var screenWidth = 1000;
var screenHeight = 600;
var playerSize = 50;
var pisteHeight = 200
var startY = screenHeight / 3;
var endY = screenHeight / 3 + pisteHeight;
var fencerStartY = screenHeight / 2;
var jump = 10;

window.onload = function () {
    var canvas = document.getElementById("myCanvas");
    canvas.getContext("2d");
    redrawGameArea();
}

var game = {
    fencer1: fencer,
    fencer2: fencer
}

var myGameArea = {
    canvas: document.createElement("canvas"),
    start: function () {
        this.canvas.width = screenWidth;
        this.canvas.height = screenWidth;
        this.context = this.canvas.getContext("2d");
        document.body.insertBefore(this.canvas, document.body.childNodes[0]);
        this.interval = setInterval(updateGame, 20);
        window.addEventListener('keydown', function (e) {
            myGameArea.keys = (myGameArea.keys || []);
            myGameArea.keys[e.key] = true;
        })
        window.addEventListener('keyup', function (e) {
            myGameArea.keys[e.key] = false;
        })
    },
    clear: function () {
        this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
    },
    reset: function () {
        clearInterval(this.interval);
        this.interval = setInterval(updateGame, 20);
        game.fencer1.x = ctx.canvas.clientWidth / 3;
        game.fencer1.y = fencerStartY;
        game.fencer2.x = 2 * ctx.canvas.clientWidth / 3 - playerSize;
        game.fencer2.y = fencerStartY;
        window.addEventListener('keydown', function (e) {
            myGameArea.keys = (myGameArea.keys || []);
            myGameArea.keys[e.key] = true;
        })
        window.addEventListener('keyup', function (e) {
            myGameArea.keys[e.key] = false;
        })
    },
    stop: function () {
        clearInterval(this.interval);
        window.addEventListener('keydown', function (e) {
            console.log(this.interval);
            if (!this.interval) {
                if (e.key == 'Enter'){
                    this.myGameArea.reset();
                }
                if (e.key == 'Escape'){
                    this.game.fencer1.points = 0;
                    this.game.fencer2.points = 0;
                    this.myGameArea.reset();
                }
            }
        })
    }
}

function startGame() {
    myGameArea.start();
    ctx = myGameArea.context;
    game.fencer1 = new fencer(ctx.canvas.clientWidth / 3, fencerStartY, 1, playerSize);
    game.fencer2 = new fencer(2 * ctx.canvas.clientWidth / 3 - playerSize, fencerStartY, 2, playerSize);
}

function updateGame() {
    var speed = 2;

    game.fencer1.speedX = 0;
    game.fencer1.speedY = 0;
    game.fencer1.attacking = false;
    game.fencer1.parrying = false;
    game.fencer1.jumping = false;
    game.fencer2.speedX = 0;
    game.fencer2.speedY = 0;
    game.fencer2.attacking = false;
    game.fencer2.parrying = false;
    game.fencer2.jumping = false;

    if (myGameArea.keys && (myGameArea.keys['a'] || myGameArea.keys['A'])) { game.fencer1.speedX = -speed; }
    if (myGameArea.keys && (myGameArea.keys['s'] || myGameArea.keys['S'])) { game.fencer1.speedX = speed; }
    if (myGameArea.keys && (myGameArea.keys['d'] || myGameArea.keys['D'])) { game.fencer1.attacking = true }
    if (myGameArea.keys && (myGameArea.keys['f'] || myGameArea.keys['F'])) { game.fencer1.jumping = true; }
    if (myGameArea.keys && (myGameArea.keys['g'] || myGameArea.keys['G'])) { game.fencer1.parrying = true }
    if (myGameArea.keys && myGameArea.keys['ArrowLeft']) { game.fencer2.speedX = -speed; }
    if (myGameArea.keys && myGameArea.keys['ArrowRight']) { game.fencer2.speedX = speed; }
    if (myGameArea.keys && (myGameArea.keys['j'] || myGameArea.keys['J'])) { game.fencer2.attacking = true }
    if (myGameArea.keys && (myGameArea.keys['k'] || myGameArea.keys['K'])) { game.fencer2.jumping = true }
    if (myGameArea.keys && (myGameArea.keys['l'] || myGameArea.keys['L'])) { game.fencer2.parrying = true }
    if (myGameArea.keys && myGameArea.keys['Enter']) { this.myGameArea.reset(); }

    game.fencer1.actions();
    game.fencer2.actions();
    
    var hit1 = game.fencer1.hitOpponent(game.fencer2)
    var hit2 = game.fencer2.hitOpponent(game.fencer1)
    redrawGameArea();
    document.getElementById("fencer1").innerHTML = `Fencer 1 \n Offensive: ${game.fencer1.offensive} \n Defensive: ${game.fencer1.defensive}`;
    document.getElementById("fencer2").innerHTML = `Fencer 2 \n Offensive: ${game.fencer2.offensive} \n Defensive: ${game.fencer2.defensive}`;

    if (hit1 || hit2) {
        if (hit1) {
            drawFencerPoint(1)
        }
        if (hit2) {
            drawFencerPoint(2)
        }
        console.log("fencer 1: " + game.fencer1.points)
        console.log("fencer 2: " + game.fencer2.points)
        myGameArea.stop();
    }
}

function redrawGameArea() {
    myGameArea.clear();
    drawTribune();
    drawFloor();
    drawPodium();
    drawAudience();
    game.fencer1.redraw();
    game.fencer2.redraw();
    drawScore(game.fencer1.points, 1);
    drawScore(game.fencer2.points, 2);
}

function moveup() {
    myGamePiece.speedY -= 1;
}

function movedown() {
    myGamePiece.speedY += 1;
}

function moveleft() {
    myGamePiece.speedX -= 1;
}

function moveright() {
    myGamePiece.speedX += 1;
}

function fencer(x, y, number, size) {
    this.width = size;
    this.height = size;
    this.x = x;
    this.y = y;
    this.speedX = 0;
    this.speedY = 0;
    this.jumpFactor = 1;
    this.attacking = false;
    this.parrying = false;
    this.offensive = false;
    this.defensive = false;
    this.recovering = false;
    this.jumping = false;
    this.jumpRecovering = false;
    this.points = 0;
    this.parryingTimeout;
    this.attackingTimeout;
    this.offensiveTimeout;
    this.defensiveTimeout;
    this.color = number == 1 ? "#FF0000" : "#00FF00";

    var img = new Image();
    ctx = myGameArea.context;
    // img.src = `assets/fencer${number}.png`;
    img.src = `assets/person${number}.jpg`;

    this.redraw = function () {
        ctx.drawImage(img, this.x, this.y, this.width, this.height);
        ctx.beginPath();
        ctx.stroke();
        if (this.defensive) {
            ctx.strokeStyle = "rgba(0, 0, 0, 1)";
            ctx.lineWidth = 5;
            ctx.strokeRect(this.x, this.y, this.width, this.height);
            ctx.stroke();
        }
        if (this.offensive) {
            ctx.strokeStyle = this.color;
            ctx.lineWidth = 5;
            ctx.strokeRect(this.x, this.y, this.width, this.height);
            ctx.stroke();
        }
    }

    this.actions = function () {
        this.attack();
        this.parry();
        this.jump();
        this.newPos();
    }

    this.newPos = function () {    
        this.x += this.speedX * this.jumpFactor;
        this.y += this.speedY * this.jumpFactor;
        this.jumpFactor = 1;
        this.x = Math.min(this.x, screenWidth - playerSize);
        this.x = Math.max(this.x, 0);
        this.y = Math.min(this.y, screenHeight - playerSize);
        this.y = Math.max(this.y, 0);
        console.log(this.x)
    }

    this.hitOpponent = function (otherFencer) {
        var myleft = this.x;
        var myright = this.x + (this.width);
        var mytop = this.y;
        var mybottom = this.y + (this.height);
        var otherleft = otherFencer.x;
        var otherright = otherFencer.x + (otherFencer.width);
        var othertop = otherFencer.y;
        var otherbottom = otherFencer.y + (otherFencer.height);
        
        var point = false;
        if ((mybottom >= othertop) &&
            (mytop <= otherbottom) &&
            (myright >= otherleft) &&
            (myleft <= otherright)) {
            
            if (this.offensive && !otherFencer.defensive) {
                console.log(otherFencer);
                point = true;
                this.points++;
            }
            if (this.offensive && otherFencer.defensive) {                
                console.log("parried");
                this.recovering = true;
                clearTimeout(this.parryingTimeout);
                clearTimeout(this.attackingTimeout);
                this.attackingTimeout = setTimeout(function (fencer) { stopRecovering(fencer) }, 1000, this);
                this.parryingTimeout = setTimeout(function (fencer) { stopParrying(fencer) }, 1000, this);
            }
            if (this.defensive && otherFencer.offensive) {
                this.recovering = false;
                clearTimeout(this.offensiveTimeout);
                clearTimeout(this.defensiveTimeout);
            }
        }

        return point;
    }

    this.attack = function () {
        if (this.attacking && !this.recovering) {
            console.log("Attacking");
            this.attacking = false;
            this.offensive = true;
            this.recovering = true;
            this.speedX *= jump;
            this.speedY *= jump;

            this.offensiveTimeout = setTimeout(function (fencer) { stopOffensive(fencer) }, 100, this);
            this.attackingTimeout = setTimeout(function (fencer) { stopRecovering(fencer) }, 1000, this);
        }
    }

    this.parry = function () {
        if (this.parrying && !this.recovering) {
            console.log("Parrying");
            this.parrying = false;
            this.defensive = true;
            this.recovering = true
            this.defensiveTimeout = setTimeout(function (fencer) { stopDefensive(fencer) }, 300, this);
            this.parryingTimeout = setTimeout(function (fencer) { stopParrying(fencer) }, 1000, this);
        }
    }

    this.jump = function () {
        if (this.jumping && !this.jumpRecovering) {
            this.jumpFactor = jump;
            this.jumpRecovering = true;
            this.jumpRecoverTimeout = setTimeout(function (fencer) { stopJumpRecover(fencer) }, 300, this);
        }
    }
}

function stopOffensive(fencer) {
    fencer.offensive = false;
    console.log("stopped offensive");
}

function stopDefensive(fencer) {
    fencer.defensive = false;
    console.log("stopped defensive");
}

function stopRecovering(fencer) {
    fencer.recovering = false;
    fencer.offensive = false;
    console.log("stopped recovering");
}

function stopParrying(fencer) {
    fencer.recovering = false;
    fencer.defensive = false;
    console.log("Stop parrying");
}

function stopJumpRecover(fencer) {
    fencer.jumpRecovering = false;
    console.log("Stop jump recovering");
}

function drawAudience() {
    ctx = myGameArea.context;
    var audienceImg = new Image();
    audienceImg.src = `assets/audience.jpg`;
    ctx.beginPath();
    ctx.drawImage(audienceImg, 0, 0, ctx.canvas.clientWidth, startY);
    ctx.stroke();
}

function drawTribune() {
    ctx = myGameArea.context;
    ctx.beginPath();
    ctx.rect(0, startY, ctx.canvas.clientWidth, endY - startY);
    ctx.strokeStyle = "rgba(0, 0, 0, 1)";
    ctx.lineWidth = 2;
    ctx.stroke();
    ctx.closePath();

    var linePos = ctx.canvas.clientWidth / 7;

    for (let i = 1; i < 8; i++) {
        ctx.moveTo(linePos * i, startY);
        ctx.lineTo(linePos * i, endY);
        ctx.stroke();
    }
}

function drawPodium() {
    ctx = myGameArea.context;
    ctx.beginPath();
    ctx.rect(0, fencerStartY + playerSize, ctx.canvas.clientWidth, endY - fencerStartY - playerSize);
    ctx.fillStyle = "#808080";
    ctx.strokeStyle = "#000000"
    ctx.fill();
    ctx.stroke();
}

function drawFloor() {
    ctx = myGameArea.context;
    ctx.beginPath();
    ctx.rect(0, endY, ctx.canvas.clientWidth, 300);
    ctx.fillStyle = "#0000FF";
    ctx.fill();
}

function drawFencerPoint(number) {
    ctx = myGameArea.context;
    var x = number * screenWidth / 3;
    var acrSize = 50;
    ctx.beginPath();
    ctx.arc(x,  2 * screenWidth / 3 + 1.5 * acrSize, acrSize, 0, 2 * Math.PI);
    ctx.fillStyle = number == 1 ? "#FF0000" : "#00FF00";
    ctx.fill();
}

function drawScore(score, number) {
    ctx = myGameArea.context;
    ctx.font = "30px Arial";
    ctx.fillStyle = 'black';
    ctx.fillText(score, number * screenWidth / 3 - 10, 2 * screenWidth / 3);
}