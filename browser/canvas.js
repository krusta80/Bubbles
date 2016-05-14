/**  CANVAS-RELATED VARIABLES **/
var CANVAS;
var CONTEXT;
var WIDTH;
var HEIGHT;
var CENTER;
var RADIUS_WIDTH;
var GRID_WIDTH;
var GRID_HEIGHT;
var FPS;
var INTERVAL;
var now;
var then = Date.now();

/**  GAME-RELATED VARIABLES **/
var socket;                 //  socket.io connection to server
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

    bubbleKeys = Object.keys(bubbles);

    bubbleKeys.forEach(function(key) {
        var bubble = bubbles[key];
        if(inRange(bubble))
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
    updateHeroVector(e.clientX-CENTER.x, e.clientY-CENTER.y);
};

var updateHeroVector = function(mouseDx, mouseDy) {
    socket.emit('player.move', {id: hero.id, dx: mouseDx, dy: mouseDy});
    //hero.vector = gameFunctions.getPlayerVector(hero, mouseDx, mouseDy);
};

var initializeCanvas = function() {
    CANVAS = document.getElementById('canvas');
    CANVAS.width = window.innerWidth;
    CANVAS.height = window.innerHeight;
    WIDTH = CANVAS.width;
    HEIGHT = CANVAS.height;
    CENTER = {
        x: WIDTH/2,
        y: HEIGHT/2
    };
    CONTEXT = CANVAS.getContext('2d');
};

var inRange = function(bubble) {
    //  This is run on client side only from within the local engine
    return gameFunctions.getDistance(hero, bubble) <= Math.sqrt(WIDTH*WIDTH + HEIGHT*HEIGHT);
};

var renderGridLines = function(context) {
    var cellSide = RADIUS_WIDTH * 4;    

    var leftEdge = hero.x - CENTER.x;
    var topEdge = hero.y - CENTER.y;
    var leftmostGridLine = Math.ceil(leftEdge/cellSide)*cellSide - leftEdge;
    var topmostGridLine = Math.ceil(topEdge/cellSide)*cellSide - topEdge;


    for(var x = leftmostGridLine; x < WIDTH; x += cellSide)
        drawGridLine(x, 0, x, HEIGHT, context);
    for(var y = topmostGridLine; y < HEIGHT; y += cellSide)
        drawGridLine(0, y, WIDTH, y, context);

};
var createOffscreenGrid = function() {
    var offScreenCanvas = document.createElement('canvas');
    offScreenCanvas.width = WIDTH;
    offScreenCanvas.height = HEIGHT;
    var offScreenContext = offScreenCanvas.getContext('2d');

    renderGridLines(offScreenContext);

    var image = offScreenContext.getImageData(0,0,WIDTH, HEIGHT);
    CONTEXT.putImageData(image, 0, 0);
}

var drawGridLine = function(x1, y1, x2, y2, context) {
    context.lineWidth = 1;
    context.beginPath();
    context.moveTo(x1,y1);
    context.lineTo(x2,y2);
    context.strokeStyle = '#CCCCCC';
    context.stroke();
};

var initializeHero = function(serverHero) {
    //  for now, we just generate another random bubble
    hero = serverHero;
    bubbles[hero.name] = hero;
};

var initializeEnemies = function(enemyCount) {
    engine.addBubbles(seedBubbles(enemyCount));
    bubbles = engine.bubbles;
    bubbleKeys = engine.bubbleKeys;
};

var initializeEngine = function(gridWidth, gridHeight) {
    //  normally this will be run on and controlled by the server
    engine = new Engine(-1, RADIUS_WIDTH, gridWidth, gridHeight, true, true);
};

var run = function() {
    requestAnimationFrame(run);
    now = Date.now();
    delta = now - then;

    if (delta > INTERVAL) {
        then = now - (delta % INTERVAL);
        CONTEXT.clearRect(0,0,WIDTH,HEIGHT);
        // renderGridLines(CONTEXT);
        createOffscreenGrid();
        //engine.updateState();
        renderBubbles();
        //frame++;
    }
};

window.onload = function() {
    socket = io('http://localhost:1337', {query: "name=-1"});

    socket.on('welcome', function(vars) {
        console.log("Welcome package:", vars);
        RADIUS_WIDTH = vars.RADIUS_WIDTH;
        GRID_WIDTH = vars.GRID_WIDTH;
        GRID_HEIGHT = vars.GRID_HEIGHT;
        FPS = vars.FPS;
        INTERVAL = 1000/FPS;
        //initializeEngine();
        initializeCanvas();
        initializeHero(vars.hero);
        //initializeEnemies(5000);
        var frame = 0;
        run();
    });

    socket.on('state.update', function(serverBubbles) {
        bubbles = serverBubbles;
        hero = bubbles[hero.id];
    });
};


