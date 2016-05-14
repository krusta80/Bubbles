/** 
		This is a socket.io server used to host real-time multiplayer
		games.  In this instance, the game is called Bubbles, which 
		is a blatant albeit well-intentioned ripoff of agar.io
**/

var port = process.env.PORT || 1337;
var io = require('socket.io').listen(port);
var Engine = require('./engine');''
var gameFunctions = require('./functions');
var FPS = 30;

const RADIUS_WIDTH = gameFunctions.STARTING_RADIUS;
const GRID_WIDTH = 20000;
const GRID_HEIGHT = 20000;

var engine = new Engine(-1, RADIUS_WIDTH, GRID_WIDTH, GRID_HEIGHT, false);
var bubbles = engine.bubbles;
var playerCount = 0;

console.log("Socket.io listening on port", port);

io.on('connection', function (socket) {
	console.log("	--->", socket.handshake.query.name, "has joined the game!");
	console.log("	   >", socket.id);
	var newBubble = gameFunctions.generateBubble({id: socket.id, name: socket.handshake.query.name});
	engine.addBubbles([newBubble]);
	console.log("There are now", ++playerCount, "players.");

	socket.emit('welcome', {
		FPS: FPS,
		RADIUS_WIDTH: RADIUS_WIDTH,
		GRID_WIDTH: GRID_WIDTH,
		GRID_HEIGHT: GRID_HEIGHT,
		hero: newBubble,
		pellets: engine.pellets
	});

	socket.on('disconnect', function() {
		if(bubbles[socket.id]) {
			console.log("	--->", bubbles[socket.id].name, "has left the game!");
			console.log("	   >", socket.id);
			engine.removeBubble(socket.id);
			console.log("There are now", --playerCount, "players.");	
		}
	});

	socket.on('player.move', function(move) {
		//console.log("Move request:", move);
		if(bubbles[move.id] && !isNaN(move.dx) && !isNaN(move.dy)) {
			var newVector = gameFunctions.getPlayerVector(bubbles[move.id], move.dx, move.dy);
			bubbles[move.id].vector.dx = newVector.dx;
			bubbles[move.id].vector.dy = newVector.dy;
		}
  	});
});

var tic, toc, runningTotal, frame;
frame = 0;
runningTotal = 0;

setInterval(function() {
	tic = Date.now();
	engine.updateState();
	toc = Date.now();
	io.emit('pellet', engine.newestPellet);
	runningTotal += (toc-tic);
	if(frame === 299) {
		frame = 0;
		console.log("MAX FPS:", 300000/runningTotal);
		runningTotal = 0;
	}
	io.emit('state.update', {bubbles: bubbles, eatenPellets: engine.eatenPellets});
	frame++;
}.bind(this), 1000/FPS);


