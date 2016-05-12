// key events

var KEY_LEFT = 37;
var KEY_UP = 38;
var KEY_RIGHT = 39;
var KEY_DOWN = 40;
var STATE = {
    x: 150,
    y: 150
};


// takes in a position x and y at its center and radius to create a circle
function drawCircle(centerX, centerY, radius) {
    var canvas = document.getElementById('canvas');
    var context = canvas.getContext('2d');
    context.beginPath();
    context.arc(centerX, centerY, radius, 0, 2 * Math.PI, false);
    context.fillStyle = 'green';
    context.fill();
    context.lineWidth = 5;
    context.strokeStyle = '#003300';
    context.stroke();
    STATE.x = centerX;
    STATE.y = centerY;

}

function move(direction) {
    var canvas = document.getElementById('canvas');
    var context = canvas.getContext('2d');

    context.clearRect(0,0,canvas.width,canvas.height);
    if (direction === 'up') {
        drawCircle(STATE.x, STATE.y-1, 70);
    }
    if (direction === 'down') {
        drawCircle(STATE.x, STATE.y+1, 70);
    }
    if (direction === 'left') {
        drawCircle(STATE.x-1, STATE.y, 70);
    }
    if (direction === 'right') {
        drawCircle(STATE.x+1, STATE.y, 70);
    }
}

function mouseMove(x,y, centralx, centraly) {
    var canvas = document.getElementById('canvas');
    var context = canvas.getContext('2d');
    // figure out which quadrant it's in...
    // topright ++ bottomright +- bottomleft -- topleft -+
    var quadrant;
    
    var speed = 2;
    var dy = y-STATE.y;
    var dx = x-STATE.x;
    console.log('dy/dx', dy, dx, dy/dx);
    // multiple by the ratio by a speed.
    var speed = 2;
    var radians = Math.atan2(dx, dy);
    console.log('radians: ', radians);
    // so the new x y would be along the same radian
    // so we'll use radian with a known hypotenuse which is or rate of 2.
    var newy = (speed * Math.sin(radians)) + STATE.y;
    var newx = (speed * Math.cos(radians)) + STATE.x;
    if (centralx > 0 && centraly > 0) {
        // top right
        newy = (speed * Math.sin(radians)) - STATE.y;
        newx = (speed * Math.cos(radians)) - STATE.x;
    }
    if (centralx > 0 && centraly < 0) {

    }
    if (centralx < 0 && centraly < 0) {
        // bottom left
        newy = (speed * Math.sin(radians)) - STATE.y;
        newx = (speed * Math.cos(radians)) - STATE.x;
    }
    if (centralx < 0 && centraly > 0) {

    }
    console.log('old y', STATE.y, 'old x', STATE.x, 'newy', newy, 'newx', newx );
    context.clearRect(0,0,canvas.width,canvas.height);
    drawCircle(newx, newy, 70);




}


window.onload = function() {
    // bind some key listeners here
    var canvas = document.getElementById('canvas');

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    drawCircle(canvas.width/2,canvas.height/2,70);


    // window.addEventListener('resize', function() {
    //     canvas.width = window.innerWidth;
    //     canvas.height = window.innerHeight;
    // }, false);

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

    canvas.addEventListener('mousemove', function(e) {
        // basically we're making the center of the canvas width the center 
        var posXfromCenter = e.clientX - (canvas.width/2);
        var posYfromCenter = (canvas.height/2) - e.clientY;
        console.log('mosue position is x : ', posXfromCenter, 'y is: ', posYfromCenter);
        // mouseMove(posXfromCenter, posYfromCenter);
        mouseMove(e.clientX, e.clientY,posXfromCenter, posYfromCenter)
    }, false);
}

