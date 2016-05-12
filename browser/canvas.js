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

}

function move(direction) {
    var canvas = document.getElementById('canvas');
    var context = canvas.getContext('2d');

    context.clearRect(0,0,400,400);
    if (direction === 'up') {
        drawCircle(STATE.x, STATE.y--, 70);
    }
    if (direction === 'down') {
        drawCircle(STATE.x, STATE.y++, 70);
    }
    if (direction === 'left') {
        drawCircle(STATE.x--, STATE.y, 70);
    }
    if (direction === 'right') {
        drawCircle(STATE.x++, STATE.y, 70);
    }
}

window.onload = function() {
    drawCircle(150,150,70);


    // bind some key listeners here
    var canvas = document.getElementById('canvas');

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
}

