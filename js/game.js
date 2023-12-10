let board = document.querySelector("#board");
let canva = document.createElement("canvas");
// resize the canvas
let c = canva.getContext("2d");
c.canvas.width = 500;
c.canvas.height = 500;
board.appendChild(c.canvas);
let currentColor = "red";

const players = {
    red: {
        name: "red",
        skin: "res/red.png",
    },
    blue: {
        name: "blue",
        skin: "res/blue.png",
    },
};

let ballSize = c.canvas.width / 8;
var balls = [];
var arrow = {
    color: null,
    x: null,
    y: null,
};
var animating = false;

possibleSkins = [
    "res/blue.png",
    "res/red.png",
    "res/colin.png",
    "res/ines.png",
];

const imagesUrl = {
    red: players.red.skin,
    blue: players.blue.skin,
    white: "res/white.png",
    grey: "res/black.png",
};

const images = {};
for (let color in imagesUrl) {
    images[color] = new Image();
    images[color].src = imagesUrl[color];
} // load images

var gameStarted = false;
var mouseDown = false;
var originX = 0;
var originY = 0;

// resize canvas
function resizeCanvas(factor) {
    if (c.canvas.width * factor > Math.min(window.innerHeight, window.innerWidth) || c.canvas.height * factor < Math.min(window.innerHeight, window.innerWidth)/2) {
        return;
    }

    c.canvas.width = c.canvas.width * factor;
    c.canvas.height = c.canvas.height * factor;
    ballSize = c.canvas.width / 8;

    // ball positions
    balls.forEach((ball) => {
        ball.position[0] *= factor;
        ball.position[1] *= factor;
    });
}

const blueSkin = document.querySelector(".skin-blue");
const redSkin = document.querySelector(".skin-red");

const blueName = document.querySelector(".name-blue");
const redName = document.querySelector(".name-red");

const blueScore = document.querySelector(".score-blue");
const redScore = document.querySelector(".score-red");

// local storage
if (localStorage.getItem("gameInfo")) {
    let gameInfo = JSON.parse(localStorage.getItem("gameInfo"));
    players.red.name = gameInfo.red.name || players.red.name;
    redName.innerText = players.red.name;
    players.blue.name = gameInfo.blue.name || players.blue.name;
    blueName.innerText = players.blue.name;

    players.red.skin = gameInfo.red.skin || players.red.skin;
    images.red.src = players.red.skin;
    imagesUrl.red = players.red.skin;
    redSkin.src = players.red.skin;
    players.blue.skin = gameInfo.blue.skin || players.blue.skin;
    images.blue.src = players.blue.skin;
    imagesUrl.blue = players.blue.skin;
    blueSkin.src = players.blue.skin;

    console.log("gameInfo: ", gameInfo);
} else {
    localStorage.setItem(
        "gameInfo",
        JSON.stringify({
            red: {
                name: players.red.name,
                skin: players.red.skin,
            },
            blue: {
                name: players.blue.name,
                skin: players.blue.skin,
            },
        })
    );
}

blueSkin.addEventListener("click", function () {
    let noRedSkin = possibleSkins.filter(el => !redSkin.src.includes(el));
    players.blue.skin = noRedSkin[noRedSkin.indexOf(players.blue.skin) + 1] || possibleSkins[0];
    images.blue.src = players.blue.skin;
    imagesUrl.blue = players.blue.skin;
    this.src = players.blue.skin;

    // add to local storage
    let gameInfo = JSON.parse(localStorage.getItem("gameInfo"));
    gameInfo.blue.skin = players.blue.skin;
    localStorage.setItem("gameInfo", JSON.stringify(gameInfo));

    // change the score images
    let blueScoreImages = document.querySelectorAll(".score-blue img");
    blueScoreImages.forEach((img) => {
        img.src = players.blue.skin;
    });
});

redSkin.addEventListener("click", function () {
    let noBlueSkin = possibleSkins.filter(el => !blueSkin.src.includes(el));
    players.red.skin = noBlueSkin[noBlueSkin.indexOf(players.red.skin) + 1] || possibleSkins[0];
    images.red.src = players.red.skin;
    imagesUrl.red = players.red.skin;
    this.src = players.red.skin;

    // add to local storage
    let gameInfo = JSON.parse(localStorage.getItem("gameInfo"));
    gameInfo.red.skin = players.red.skin;
    localStorage.setItem("gameInfo", JSON.stringify(gameInfo));

    // change the score images
    let redScoreImages = document.querySelectorAll(".score-red img");
    redScoreImages.forEach((img) => {
        img.src = players.red.skin;
    });
});

blueName.addEventListener("input", function () {
    players.blue.name = this.innerText;
    console.log("players.blue.name: ", players.blue.name);

    // add to local storage
    let gameInfo = JSON.parse(localStorage.getItem("gameInfo"));
    gameInfo.blue.name = players.blue.name;
    localStorage.setItem("gameInfo", JSON.stringify(gameInfo));
});

redName.addEventListener("input", function () {
    players.red.name = this.innerText;

    // add to local storage
    let gameInfo = JSON.parse(localStorage.getItem("gameInfo"));
    gameInfo.red.name = players.red.name;
    localStorage.setItem("gameInfo", JSON.stringify(gameInfo));
});

window.addEventListener("resize", function () {
    // check if width is bigger than height
    if (window.innerWidth > window.innerHeight) {
        this.document.body.style.flexDirection = "row";

        this.document.querySelector("aside").style.flexDirection = "column";
    } else {
        this.document.body.style.flexDirection = "column-reverse";

        this.document.querySelector("aside").style.flexDirection = "row";
    }
});

// wheel event on canva to make it bigger
c.canvas.addEventListener("wheel", function (event) {
    if (event.deltaY < 0) {
        resizeCanvas(1.02);
    } else {
        resizeCanvas(0.98);
    }
});

// initialize game
function init() {
    // check if width is bigger than height
    if (window.innerWidth > window.innerHeight) {
        this.document.body.style.flexDirection = "row";

        this.document.querySelector("aside").style.flexDirection = "column";
    } else {
        this.document.body.style.flexDirection = "column-reverse";

        this.document.querySelector("aside").style.flexDirection = "row";
    }
    
    // add balls to random positions
    balls.push({
        color: "white",
        position: [Math.random() * c.canvas.width, Math.random() * c.canvas.height],
        velocity: [0, 0],
        marked: false,
    });

    // push 2 blue balls and 8 black balls
    // they must not collide with the other balls
    for (let i = 0; i < 10; i++) {
        let ball = {
            color: i < 2 ? "blue" : "grey",
            position: [Math.random() * c.canvas.width, Math.random() * c.canvas.height],
            velocity: [0, 0],
            marked: false,
        };
        // check if ball is colliding with another ball
        let colliding = false;
        balls.forEach((b) => {
            let dx = ball.position[0] - b.position[0];
            let dy = ball.position[1] - b.position[1];
            let distance = Math.sqrt(dx * dx + dy * dy);
            if (distance <= ballSize) {
                colliding = true;
            }
        });
        if (colliding) {
            i--;
            continue;
        }
        balls.push(ball);
    }
}

// fill with dark green
c.fillStyle = "darkgreen";
c.fillRect(0, 0, c.canvas.width, c.canvas.height);
init();

// set event listeners
window.addEventListener("mousemove", function (event) {
    // record the offset of the mouse from the start of the movement
    if (mouseDown) {
        arrow.color = currentColor;
        arrow.x = originX - event.clientX;
        arrow.y = originY - event.clientY;

        // clamp arrow length to a maximum of 100
        // let length = Math.sqrt(arrow.x * arrow.x + arrow.y * arrow.y);
        // if (length > 100) {
        //     arrow.x = (arrow.x / length) * 100;
        //     arrow.y = (arrow.y / length) * 100;
        // }
    }
});

window.addEventListener("mousedown", function (event) {
    // if not animating and left click
    if (event.button === 0 && !animating) {
        originX = event.clientX;
        originY = event.clientY;
        mouseDown = true;
    }
});

window.addEventListener("mouseup", function (event) {
    // if not animating and left click
    if (event.button === 0 && !animating) {
        mouseDown = false;
        // calculate velocity
        let velocity = [
            (originX - event.clientX) / 10,
            (originY - event.clientY) / 10,
        ];
        // set velocity
        balls[0].velocity = velocity;

        // set animating to true
        animating = true;
    }
});

// touch events
window.addEventListener("touchstart", function (event) {
    // if player is not the current player, don't shoot
    if (currentColor !== myColor) {
        return;
    }

    // if not animating and left click
    if (!animating) {
        originX = event.touches[0].clientX;
        originY = event.touches[0].clientY;
        mouseDown = true;
    }
});

window.addEventListener("touchmove", function (event) {
    // record the offset of the mouse from the start of the movement
    if (mouseDown) {
        arrow.color = myColor;
        arrow.x = originX - event.touches[0].clientX;
        arrow.y = originY - event.touches[0].clientY;

        // clamp arrow length to a maximum of 100
        // let length = Math.sqrt(arrow.x * arrow.x + arrow.y * arrow.y);
        // if (length > 100) {
        //     arrow.x = (arrow.x / length) * 100;
        //     arrow.y = (arrow.y / length) * 100;
        // }
    }
});

window.addEventListener("touchend", function (event) {
    // if player is not the current player, don't shoot
    if (currentColor !== myColor) {
        mouseDown = false;
        return;
    }

    // if not animating and left click
    if (!animating) {
        mouseDown = false;
        // calculate velocity
        let velocity = [
            (originX - event.changedTouches[0].clientX) / 10,
            (originY - event.changedTouches[0].clientY) / 10,
        ];
        // set velocity
        balls[0].velocity = velocity;

        // set animating to true
        animating = true;
    }
});

// start game loop
gameStarted = true;
gameLoop();

function gameLoop() {
    if (!gameStarted) return;

    // clear canvas
    c.clearRect(0, 0, c.canvas.width, c.canvas.height);
    drawScene();

    if (animating) {
        // move balls
        moveBalls();
        // check collision
        wallCollision();
        // check if balls are colliding
        ballsCollision();
        // decrease velocity
        decreaseVelocity();
        // check if balls are still
        let still = true;
        balls.forEach((ball) => {
            // ignore marked balls
            if (ball.marked) {
                return;
            }

            if (ball.velocity[0] !== 0 || ball.velocity[1] !== 0) {
                still = false;
            }
        });
        if (still) {
            animating = false;
            // change current player
            currentColor = currentColor === "red" ? "blue" : "red";
        }
    }
    // draw arrow (a line from the edge of the white ball, of height x and width y)
    else if (arrow.color) {
        c.beginPath();
        c.moveTo(
            (balls[0].position[0] / c.canvas.width) * (c.canvas.width - ballSize) +
                ballSize / 2,
            (balls[0].position[1] / c.canvas.height) *
                (c.canvas.height - ballSize) +
                ballSize / 2
        );
        c.lineTo(
            (balls[0].position[0] / c.canvas.width) * (c.canvas.width - ballSize) +
                ballSize / 2 +
                arrow.x,
            (balls[0].position[1] / c.canvas.height) *
                (c.canvas.height - ballSize) +
                ballSize / 2 +
                arrow.y
        );
        c.strokeStyle = arrow.color;
        c.lineWidth = 5;
        c.stroke();
    }

    window.requestAnimationFrame(gameLoop);
}

function decreaseVelocity() {
    balls.forEach((ball) => {
        // ignore marked balls
        if (ball.marked) {
            return;
        }

        // ball.velocity[0] *= 0.99;
        // ball.velocity[1] *= 0.99;
        // more natural decrease with this function (the less velocity, the more decrease)
        ball.velocity[0] *= 0.95;
        ball.velocity[1] *= 0.95;
        if (
            Math.abs(ball.velocity[0]) < 0.02 &&
            Math.abs(ball.velocity[1]) < 0.02
        ) {
            ball.velocity[0] = 0;
            ball.velocity[1] = 0;
        }
    });
}

function ballsCollision() {
    for (let i = 0; i < balls.length; i++) {
        // ignore marked balls
        if (balls[i].marked) {
            continue;
        }

        for (let j = i + 1; j < balls.length; j++) {
            // ignore marked balls
            if (balls[j].marked) {
                continue;
            }

            let dx = balls[i].position[0] - balls[j].position[0];
            let dy = balls[i].position[1] - balls[j].position[1];
            let distance = Math.sqrt(dx * dx + dy * dy);
            if (distance <= ballSize * 0.9) {
                // collision
                // if the balls are going separate ways, don't calculate collision
                let angle1 = Math.atan2(
                    balls[i].velocity[1],
                    balls[i].velocity[0]
                );
                let angle2 = Math.atan2(
                    balls[j].velocity[1],
                    balls[j].velocity[0]
                );
                if (Math.abs(angle1 - angle2) < 0) {
                    continue;
                }

                // change color
                if (balls[i].color === "white") {
                    // if white ball is colliding with another ball, change color of the other ball
                    if (balls[j].color === "grey") {
                        balls[j].color = currentColor;
                    } else if (balls[j].color === currentColor) {
                        // remove ball and add 1 point to the player
                        balls[j].marked = true;
                        updateScore();
                    } else {
                        balls[j].color = "grey";
                    }
                } else if (balls[j].color === "white") {
                    balls[j].color = balls[i].color;
                }

                // calculate new velocities
                let nx = dx / distance;
                let ny = dy / distance;
                let p =
                    (2 *
                        (balls[i].velocity[0] * nx +
                            balls[i].velocity[1] * ny -
                            balls[j].velocity[0] * nx -
                            balls[j].velocity[1] * ny)) /
                    (ballSize + ballSize);
                balls[i].velocity[0] =
                    balls[i].velocity[0] - p * ballSize * nx;
                balls[i].velocity[1] =
                    balls[i].velocity[1] - p * ballSize * ny;
                balls[j].velocity[0] =
                    balls[j].velocity[0] + p * ballSize * nx;
                balls[j].velocity[1] =
                    balls[j].velocity[1] + p * ballSize * ny;
            }
        }
    }
}

function wallCollision() {
    balls.forEach((ball) => {
        // left wall
        if (ball.position[0] < 0) {
            ball.position[0] = 0;
            ball.velocity[0] *= -1;
        }

        // right wall
        else if (ball.position[0] > c.canvas.width) {
            ball.position[0] = c.canvas.width;
            ball.velocity[0] *= -1;
        }
        // top wall
        if (ball.position[1] < 0) {
            ball.position[1] = 0;
            ball.velocity[1] *= -1;
        }

        // bottom wall
        else if (ball.position[1] > c.canvas.height) {
            ball.position[1] = c.canvas.height;
            ball.velocity[1] *= -1;
        }
    });
}

function moveBalls() {
    balls.forEach((ball) => {
        ball.position[0] += ball.velocity[0];
        ball.position[1] += ball.velocity[1];
    });
}

function drawScene() {
    // draw balls
    balls.forEach((ball) => {
        // ignore marked balls
        if (ball.marked) {
            return;
        }

        drawBall(ball);
    });

    // draw corner balls
    // drawBall({
    //     color: "red",
    //     position: [0, 0],
    // });
    // drawBall({
    //     color: "blue",
    //     position: [800, 0],
    // });
    // drawBall({
    //     color: "white",
    //     position: [0, 800],
    // });
    // drawBall({
    //     color: "grey",
    //     position: [800, 800],
    // });

    function drawBall(ball) {
        c.drawImage(
            images[ball.color],
            (ball.position[0] / c.canvas.width) * (c.canvas.width - ballSize),
            (ball.position[1] / c.canvas.height) * (c.canvas.height - ballSize),
            ballSize,
            ballSize
        );
    }
}

function updateScore() {
    // update score
    let redScore = document.querySelector(".score-red");
    let blueScore = document.querySelector(".score-blue");
    let redPoints = 0;
    let bluePoints = 0;
    balls.forEach((ball) => {
        if (ball.color === "red" && ball.marked) {
            redPoints++;
        } else if (ball.color === "blue" && ball.marked) {
            bluePoints++;
        }
    });

    // score hold images of the balls captured
    redScore.innerHTML = "";
    blueScore.innerHTML = "";
    for (let i = 0; i < redPoints; i++) {
        let img = document.createElement("img");
        img.src = imagesUrl.red;
        redScore.appendChild(img);
    }

    for (let i = 0; i < bluePoints; i++) {
        let img = document.createElement("img");
        img.src = imagesUrl.blue;
        blueScore.appendChild(img);
    }

    if (redPoints >= 5) {
        document.querySelector(".player-red").classList.add("winner");
        winAnimation();
    } else if (bluePoints >= 5) {
        document.querySelector(".player-blue").classList.add("winner");
        winAnimation();
    }
}

function winAnimation() {
    // animation celebrating the winner. It uses the player's skin and the player's name
    let winner = document.querySelector(".winner").classList[1];
    let winnerColor = winner.split("-")[1];
    let winnerSkin = players[winnerColor].skin;
    let winnerName = players[winnerColor].name;

    // start the animation on the canvas
    // TODO: make a real animation
    c.fillStyle = "darkgreen";
    c.fillRect(0, 0, c.canvas.width, c.canvas.height);
    c.fillStyle = winnerColor;
    c.font = "30px Arial";
    c.fillText(winnerName + " won!", 10, 50);
    c.drawImage(images[winnerColor], 10, 60, 50, 50);
    c.drawImage(images[winnerColor], 70, 60, 50, 50);
    c.drawImage(images[winnerColor], 130, 60, 50, 50);
    c.drawImage(images[winnerColor], 190, 60, 50, 50);
    c.drawImage(images[winnerColor], 250, 60, 50, 50);

    gameStarted = false;
}
