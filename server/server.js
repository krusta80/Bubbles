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

console.log("Socket.io listening on port", port);

io.on('connection', function (socket) {
	console.log("	---> NEW CONNECTION DETECTED");
	var newBubble = gameFunctions.generateBubble({id: socket.id, name: socket.handshake.query.name});
	engine.addBubbles([newBubble]);
	
	socket.emit('welcome', {
		FPS: FPS,
		RADIUS_WIDTH: RADIUS_WIDTH,
		GRID_WIDTH: GRID_WIDTH,
		GRID_HEIGHT: GRID_HEIGHT,
		hero: newBubble
	});

	socket.on('disconnect', function(socket) {
		engine.removeBubble(socket.id);
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

setInterval(function() {
	engine.updateState();
	io.emit('state.update', bubbles);
}.bind(this), 1000/FPS);

