/**  CANVAS-RELATED VARIABLES **/
var CANVAS;
var CONTEXT;
var WIDTH;
var HEIGHT;
var CENTER;
var RADIUS_WIDTH = 25;
var FPS = 30;

/**  GAME-RELATED VARIABLES **/
var hero;                   //  player's bubble
var bubbles = {};           //  ALL bubbles
var bubbleKeys = [];
var engine; 

// takes in a position x and y at its center and radius to create a circle
function drawCircle(centerX, centerY, radius, color) {
    CONTEXT.beginPath();
    CONTEXT.arc(centerX, centerY, radius, 0, 2 * Math.PI, false);
    CONTEXT.fillStyle = color;
    CONTEXT.fill();
    CONTEXT.lineWidth = 5;
    //CONTEXT.strokeStyle = '#003300';
    CONTEXT.strokeStyle = color;
    CONTEXT.stroke();
}

var getRandomColor = function() {
    var RR = Math.floor(Math.random()*256).toString(16);
    var GG = Math.floor(Math.random()*256).toString(16);
    var BB = Math.floor(Math.random()*256).toString(16);
    return '#'+RR+GG+BB;
};

var renderBubble = function(bubble) {
    drawCircle(bubble.x, bubble.y, bubble.radius, bubble.color);
};

var renderHero = function() {
    //  hero is always at the center of the canvas
    drawCircle(CENTER.x, CENTER.y, hero.radius, hero.color);
};

var renderBubbles = function() {
    //  This function must find all bubbles within canvas visual
    //  and transform their coordinates appropriately
    var canvasEdges = {
        left: hero.x - CENTER.x,
        top: hero.y - CENTER.y,
        right: hero.x + CENTER.x,
        bottom: hero.y + CENTER.y
    };

    bubbles = engine.bubbles;
    bubbleKeys = engine.bubbleKeys;

    bubbleKeys.forEach(function(key) {
        var bubble = bubbles[key];
        if(gameFunctions.getDistance(hero, bubble) <= Math.sqrt(WIDTH*WIDTH + HEIGHT*HEIGHT))
            renderBubble(bubble); 
    });
};

var renderBubble = function(bubble) {
    drawCircle(bubble.x - hero.x + CENTER.x, bubble.y - hero.y + CENTER.y, bubble.radius, bubble.color);
};

var generateBubble = function(properties) {
    if(properties.name)
        var name = properties.name;
    if(properties.color)
        var color = properties.color;
    else
        var color = getRandomColor();
    if(properties.dx === undefined)
        properties.dx = 0;
    if(properties.dy === undefined)
        properties.dy = 0;
    if(properties.radius)
        var radius = properties.radius;
    else
        var radius = gameFunctions.STARTING_RADIUS;

    return {
        name: name,
        x: 0,
        y: 0,
        radius: radius,
        vector: {
            //dx: MAX_SPEED/Math.sqrt(radius)*(Math.floor(Math.random()*3)-1),
            //dy: MAX_SPEED/Math.sqrt(radius)*(Math.floor(Math.random()*3)-1)
            dx: properties.dx,
            dy: properties.dx,
        },
        color: color
    };
};

var seedBubbles = function(reps) {
    var ret = [];
    for(var i = 0; i < reps; i++) {
        var bubble = generateBubble({name: i+1});
        ret.push(bubble);
    }
    return ret;
};

var getMouseCoords = function(e) {
    //  client will eventually be "transmitting" these coordinates to the server
    updateHeroVector(e.clientX-CENTER.x, e.clientY-CENTER.y);
};

var updateHeroVector = function(mouseDx, mouseDy) {
    hero.vector = gameFunctions.getPlayerVector(hero, mouseDx, mouseDy);
};

var initializeCanvas = function() {
    CANVAS = document.getElementById('canvas');
    WIDTH = CANVAS.width;
    HEIGHT = CANVAS.height;
    CENTER = {
        x: WIDTH/2,
        y: HEIGHT/2
    };
    CONTEXT = CANVAS.getContext('2d');
};

var renderGridLines = function() {
    var cellSide = RADIUS_WIDTH * 3;    

    var leftEdge = hero.x - CENTER.x;
    var topEdge = hero.y - CENTER.y;
    var leftmostGridLine = Math.ceil(leftEdge/cellSide)*cellSide - leftEdge;
    var topmostGridLine = Math.ceil(topEdge/cellSide)*cellSide - topEdge;

    for(var x = leftmostGridLine; x < WIDTH; x += cellSide)
        drawGridLine(x, 0, x, HEIGHT);
    for(var y = topmostGridLine; y < HEIGHT; y += cellSide)
        drawGridLine(0, y, WIDTH, y);
};

var drawGridLine = function(x1, y1, x2, y2) {
    CONTEXT.lineWidth = 1;
    CONTEXT.beginPath();
    CONTEXT.moveTo(x1,y1);
    CONTEXT.lineTo(x2,y2);
    CONTEXT.strokeStyle = '#CCCCCC';
    CONTEXT.stroke();
};

var initializeHero = function() {
    //  for now, we just generate another random bubble
    hero = generateBubble({name: -1, color: 'green', x: 50, y: 50, radius: gameFunctions.STARTING_RADIUS+1});   //  cheating to see gobble effect
    engine.addBubbles([hero]);
    bubbles[hero.name] = hero;
};

var initializeEnemies = function(enemyCount) {
    engine.addBubbles(seedBubbles(enemyCount));
    bubbles = engine.bubbles;
    bubbleKeys = engine.bubbleKeys;
};

var initializeEngine = function(gridWidth, gridHeight) {
    //  normally this will be run on and controlled by the server
    engine = new Engine(-1, RADIUS_WIDTH, gridWidth, gridHeight, true);
};

window.onload = function() {
    initializeEngine(20000, 20000);
    initializeCanvas();
    initializeHero();
    initializeEnemies(250);
    var frame = 0;
    
    window.setInterval(function() {
        CONTEXT.clearRect(0,0,WIDTH,HEIGHT);
        renderGridLines();
        engine.updateState();
        renderBubbles();
        frame++;
    }.bind(this), Math.floor(1000/FPS));
}

