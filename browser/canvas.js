// key events

var KEY_LEFT = 37;
var KEY_UP = 38;
var KEY_RIGHT = 39;
var KEY_DOWN = 40;
var WIDTH = 800;
var HEIGHT = 800;
var STATE = {
    x: 150,
    y: 150,
    radius: 70
};
var MAX_SPEED = 10;
var canvas;
var context;


// takes in a position x and y at its center and radius to create a circle
function drawCircle(centerX, centerY, radius, color) {
    context.beginPath();
    context.arc(centerX, centerY, radius, 0, 2 * Math.PI, false);
    context.fillStyle = color;
    context.fill();
    context.lineWidth = 5;
    context.strokeStyle = color;
    context.stroke();

}

function move(direction) {
    context.clearRect(STATE.x-STATE.radius-10,STATE.y-STATE.radius-10,STATE.x+STATE.radius+10,STATE.y+STATE.radius+10);
    if (direction === 'up') {
        drawCircle(STATE.x, STATE.y-=increment, STATE.radius, 'green');
    }
    if (direction === 'down') {
        drawCircle(STATE.x, STATE.y+=increment, STATE.radius, 'green');
    }
    if (direction === 'left') {
        drawCircle(STATE.x-=increment, STATE.y, STATE.radius, 'green');
    }
    if (direction === 'right') {
        drawCircle(STATE.x+=increment, STATE.y, STATE.radius, 'green');
    }
}

var getRandomColor = function() {
    var RR = Math.floor(Math.random()*256).toString(16);
    var GG = Math.floor(Math.random()*256).toString(16);
    var BB = Math.floor(Math.random()*256).toString(16);
    return '#'+RR+GG+BB;
};

var autoMove = function(bubble) {
    console.log("moving...");
    

    drawCircle(bubble.x+=bubble.dx, bubble.y+=bubble.dy, bubble.radius, bubble.color);
};

var generateBubble = function() {
    var radius = Math.floor(Math.random()*90+10);
    return {
        x: Math.floor(Math.random()*WIDTH),
        y: Math.floor(Math.random()*HEIGHT),
        radius: radius,
        dx: MAX_SPEED/Math.sqrt(radius)*(Math.floor(Math.random()*3)-1),
        dy: MAX_SPEED/Math.sqrt(radius)*(Math.floor(Math.random()*3)-1),
        color: getRandomColor()
    };
}

var seedBubbles = function(reps) {
    var ret = [];
    for(var i = 0; i < reps; i++) {
        var bubble = generateBubble();
        console.log(bubble.dx)
        ret.push(bubble);
    }
    return ret;
};

window.onload = function() {
    //drawCircle(STATE.x,STATE.y,STATE.radius);
    // bind some key listeners here
   canvas = document.getElementById('canvas');
    context = canvas.getContext('2d');

    window.addEventListener('keydown', function(e) {
        var key = e.which || e.keyCode;
        if (key === KEY_UP) {
            console.log('key up!');
            move('up');
        } 
        if (key === KEY_DOWN) {
           console.log('key down!'); 
           move('down');
        }
        if (key === KEY_RIGHT) {
            console.log('key right!');
            move('right');
        } 
        if (key === KEY_LEFT) {
            console.log('key left!');
            move('left');
        }
    }, false)

    var bubbles = seedBubbles(100);
    window.setInterval(function() {
        context.clearRect(0,0,900,900);
        bubbles.forEach(function(bubble) {
            autoMove(bubble);
        });
    }.bind(this), 35);
}

