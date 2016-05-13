/** 
		This is a socket.io server used to host real-time multiplayer
		games.  In this instance, the game is called Bubbles, which 
		is a blatant albeit well-intentioned ripoff of agar.io
**/

var io = require('socket.io').listen(1337);
var Engine = require('./engine');''
var gameFunctions = require('./functions');
var FPS = 30;

const RADIUS_WIDTH = gameFunctions.STARTING_RADIUS;
const GRID_WIDTH = 20000;
const GRID_HEIGHT = 20000;

var engine = new Engine(-1, RADIUS_WIDTH, GRID_WIDTH, GRID_HEIGHT, true);
var bubbles = engine.bubbles;

io.sockets.on('connection', function (socket) {
	
	socket.on('connect', function(newPlayer) {
		engine.addBubbles([gameFunctions.generateBubble({name: socket.id})]);
		io.to(socket.id).emit('welcome', newBubble);
	});

	socket.on('disconnect', function() {
		engine.removeBubble(socket.id);
	});

	socket.on('player.move', function(move) {
		if(bubbles[move.id] && !isNaN(move.dx) && !isNaN(move.dy))
			bubbles[move.id].vector = gameFunctions.getPlayerVector(bubbles[move.id], move.dx, move.dy);
  	});

  	setInterval(function() {
  		engine.updateState();
  		socket.emit('state.update', bubbles);
  	}.bind(this), 1000/FPS);

});
