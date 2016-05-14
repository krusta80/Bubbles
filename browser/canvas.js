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
var frame;
var now;
var then = Date.now();

/**  GAME-RELATED VARIABLES **/
var socket;                 //  socket.io connection to server
var hero;                   //  player's bubble
var bubbles = {};           //  ALL bubbles
var bubbleKeys = [];
var pellets = {};
var engine; 
var pelletImage;
var heroCoords = {};
var startingOver = true;

// takes in a position x and y at its center and radius to create a circle
function drawCircle(centerX, centerY, radius, color, context) {
    if(!context)
        var context = CONTEXT;
    context.beginPath();
    context.arc(centerX, centerY, radius, 0, 2 * Math.PI, false);
    context.fillStyle = color;
    context.fill();
    context.lineWidth = 5;
    //context.strokeStyle = '#003300';
    context.strokeStyle = color;
    context.stroke();
}

var getRandomColor = function() {
    var RR = Math.floor(Math.random()*256).toString(16);
    var GG = Math.floor(Math.random()*256).toString(16);
    var BB = Math.floor(Math.random()*256).toString(16);
    return '#'+RR+GG+BB;
};

var renderPellet = function(pellet) {
     if(pelletImage) {
        //console.log("pasting");
        CONTEXT.putImageData(pelletImage, pellet.x - heroCoords.x + CENTER.x - pellet.radius, pellet.y - heroCoords.y + CENTER.y - pellet.radius);
    }
     else {
        createOffscreenCircle(pellet);
        drawCircle(pellet.x - heroCoords.x + CENTER.x, pellet.y - heroCoords.y + CENTER.y, pellet.radius, pellet.color);
    }
};

var renderHero = function() {
    //  hero is always at the center of the canvas
    drawCircle(CENTER.x, CENTER.y, hero.radius, hero.color);
};

var renderBubbles = function() {
    //  This function must find all bubbles within canvas visual
    //  and transform their coordinates appropriately
    var canvasEdges = {
        left: heroCoords.x - CENTER.x,
        top: heroCoords.y - CENTER.y,
        right: heroCoords.x + CENTER.x,
        bottom: heroCoords.y + CENTER.y
    };

    bubbleKeys = Object.keys(bubbles);

    bubbleKeys.forEach(function(key) {
        var bubble = bubbles[key];
        if(inRange(bubble))
            renderBubble(bubble); 
    });
};

var renderBubble = function(bubble) {
    drawCircle(bubble.x - heroCoords.x + CENTER.x, bubble.y - heroCoords.y + CENTER.y, bubble.radius, bubble.color);
};

var renderPellets = function() {
    var leftEdge = heroCoords.x - CENTER.x;
    var topEdge = heroCoords.y - CENTER.y;
    var cellSide = RADIUS_WIDTH;
    var leftmostCell = Math.floor(leftEdge/cellSide);
    var topmostCell = Math.floor(topEdge/cellSide);
    var cellsWide = Math.ceil(WIDTH/cellSide);
    var cellsHigh = Math.ceil(HEIGHT/cellSide);

    for(var j = leftmostCell; j < leftmostCell + cellsWide; j++) 
        for(var i = topmostCell; i < topmostCell + cellsHigh; i++) {
            if(pellets[j+'-'+i])
                pellets[j+'-'+i].forEach(function(pellet) {
                    //console.log(pellet);
                    renderPellet(pellet);
                });
        }
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
    if(hero)
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
    var cellSide = RADIUS_WIDTH * 2.5;    

    var leftEdge = heroCoords.x - CENTER.x;
    var topEdge = heroCoords.y - CENTER.y;
    var leftmostGridLine = Math.ceil(leftEdge/cellSide)*cellSide - leftEdge;
    var topmostGridLine = Math.ceil(topEdge/cellSide)*cellSide - topEdge;


    for(var x = leftmostGridLine; x < WIDTH; x += cellSide)
        drawGridLine(x, 0, x, HEIGHT, context);
    for(var y = topmostGridLine; y < HEIGHT; y += cellSide)
        drawGridLine(0, y, WIDTH, y, context);

};

var createOffscreenCircle = function(pellet) {
    var offScreenCanvas = document.createElement('canvas');
    offScreenCanvas.width = 2*pellet.radius;
    offScreenCanvas.height = 2*pellet.radius;
    var offScreenContext = offScreenCanvas.getContext('2d');

    drawCircle(pellet.radius, pellet.radius, pellet.radius*.7, '#00FF00', offScreenContext);
    //renderGridLines(offScreenContext);

    pelletImage = offScreenContext.getImageData(0,0, 2*pellet.radius, 2*pellet.radius);
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
    heroCoords = {x: hero.x, y: hero.y};
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
    now = Date.now();
    delta = now - then;

    if (delta > INTERVAL && hero) {
        if(frame % 100 == 0)
            console.log("delta:", delta);
        then = now - (delta % INTERVAL);
        CONTEXT.clearRect(0,0,WIDTH,HEIGHT);
        renderGridLines(CONTEXT);
        //createOffscreenGrid();
        //engine.updateState();
        renderPellets();
        renderBubbles();
        //frame++;
    }
    requestAnimationFrame(run);
};

var addPellet = function(pellet) {
    var key = Math.floor(pellet.x/RADIUS_WIDTH) + '-' + Math.floor(pellet.y/RADIUS_WIDTH);
    if(frame === 150) {
        console.log("Pellet sample:", pellet, key);
        frame = 0;
    }
    if(!pellets[key])
        pellets[key] = [];
    pellets[key].push(pellet);
    frame++;
};

var initializeVariables = function(vars) {
    console.log("Welcome package:", vars);
        RADIUS_WIDTH = vars.RADIUS_WIDTH;
        GRID_WIDTH = vars.GRID_WIDTH;
        GRID_HEIGHT = vars.GRID_HEIGHT;
        FPS = vars.FPS;
        INTERVAL = 1000/FPS;
        pellets = vars.pellets;
        //initializeEngine();
        initializeCanvas();
        initializeHero(vars.hero);
        //initializeEnemies(5000);
        frame = 0;
};

var startOver = function() {
    startingOver = true;
    setTimeout(function() {
        //  clear out variables
        bubbles = {};           //  ALL bubbles
        bubbleKeys = [];
        pellets = {};
        //engine; 
        socket.emit('iWannaPlay', {name: 'Test Player'});
    }.bind(this), 5000);
    console.log("Respawning in 5 seconds...");
};

window.onload = function() {
    socket = io(host, {query: "name=-1"});

    socket.on('acknowledged', function(connection) {
        setTimeout(function() {
            socket.emit('iWannaPlay', {name: 'Test Player'});
        }.bind(this), 5000);
        console.log("Respawning in 5 seconds...");
    });

    socket.on('welcome', function(vars) {
        initializeVariables(vars);
    });

    socket.on('state.update', function(stateVars) {
        addPellet(stateVars.newPellet);
        bubbles = stateVars.bubbles;
        if(hero && bubbles[hero.id]) {
            startingOver = false;
            hero = bubbles[hero.id];
            heroCoords = {x: hero.x, y: hero.y};
        }
        else if(!startingOver) {
            startOver();
        }
        stateVars.eatenPellets.forEach(function(pellet) {
            var key = Math.floor(pellet.x/RADIUS_WIDTH) + '-' + Math.floor(pellet.y/RADIUS_WIDTH);
            if(pellets[key])
                for(var i = 0; i < pellets[key].length; i++) {
                    var candidate = pellets[key][i];
                    if(candidate.x+'-'+candidate.y === pellet.x+'-'+pellet.y) {
                        pellets[key].splice(i,1); i--;
                    }
                }
        });
    });

    run();  //  this used to be in the on welcome listener
};


