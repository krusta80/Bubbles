'use strict';
/** 
		This is a socket.io server used to host real-time multiplayer
		games.  In this instance, the game is called Bubbles, which 
		is a blatant albeit well-intentioned ripoff of agar.io
**/

var port = process.env.PORT || 1337;
var express = require('express');
var app = express();
var server = require('http').createServer(app);
var io = require('socket.io').listen(server);

var Engine = require('./engine');''
var gameFunctions = require('./functions');
var path = require('path');

server.listen(port);

var FPS = 80;
var leaderBoard = [];

const RADIUS_WIDTH = gameFunctions.STARTING_RADIUS;
const GRID_WIDTH = 10000;
const GRID_HEIGHT = 10000;

var engine = new Engine(-1, RADIUS_WIDTH, GRID_WIDTH, GRID_HEIGHT, false);
var bubbles = engine.bubbles;
var playerCount = 0;


var rootPath = path.join(__dirname, '../');
var indexPath = path.join(rootPath, './browser/index.html');
app.use(express.static(path.join(rootPath, './browser')));
app.use('/node_modules',express.static(path.join(rootPath, './node_modules')));

app.use('/*',function(req,res) {
	res.sendFile(indexPath);
});


console.log("Socket.io listening on port", port);

io.on('connection', function (socket) {
	
	socket.emit('acknowledged', {connected: true});

	socket.on('iWannaPlay', function(name) {
		console.log("	--->", name.name, "has joined the game!");
		console.log("	   >", socket.id);
		var newBubble = gameFunctions.generateBubble({id: socket.id, name: name.name});
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
	})
	
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

var updateLeaderBoard = function() {
	var scoreHash = {};
	var scoreKeys = Object.keys(bubbles).map(function(key) {
		var bubble = bubbles[key];
		//console.log("bubble is", bubble);
		if(bubble && !isNaN(bubble.score))
			scoreHash[bubble.score + '-' + bubble.name] = bubble;
		return bubble.score + '-' + bubble.name;
	});
	if(scoreKeys) {
		scoreKeys.sort();
		leaderBoard = scoreKeys.map(function(scoreKey) {
			var bubble = scoreHash[scoreKey];
			return {name: bubble.name, id: bubble.id, score: bubble.score};
		});
		io.emit('leaderBoard', leaderBoard);
	}
};

var tic, toc, runningTotal, frame;
frame = 0;
runningTotal = 0;

setInterval(function() {
	var spawnPellet = false;
	if(frame % 12 === 0)
		spawnPellet = true;
	tic = Date.now();
	engine.updateState(spawnPellet);
	toc = Date.now();
	runningTotal += (toc-tic);
	if(frame % 10 === 0) 
		updateLeaderBoard();
	if(frame === 299) {
		frame = 0;
		console.log("MAX FPS:", 300000/runningTotal);
		console.log("Total Pellets:", engine.pelletCount);
		console.log("Leader Board:", leaderBoard);
		runningTotal = 0;
	}
	io.emit('state.update', {bubbles: bubbles, eatenPellets: engine.eatenPellets, newPellet: engine.newestPellet});
	frame++;
}.bind(this), 1000/FPS);


