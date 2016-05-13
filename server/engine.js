var gameFunctions = require('./functions');

var Engine = function(framesPerSecond, radiusLength, width, height, bouncyWalls, clientSide) {
	gameFunctions.STARTING_RADIUS = radiusLength;
	gameFunctions.STARTING_MAX_SPEED = 4*radiusLength;
	this.FPS = framesPerSecond;
	this.width = width;
	this.height = height;
	this.bubbles = {};
	this.bubbleKeys = [];
	this.pellets = {};
	this.frame = 0;
	this.bouncyWalls = bouncyWalls;
	this.clientSide = clientSide;
};

Engine.prototype.addBubbles = function(newBubbles) {
	newBubbles.forEach(function(newBubble) {
		this._spawnBubble(newBubble);
	}.bind(this));
};

Engine.prototype.removeBubble = function(id) {
	if(this.bubbles[id])
		this.bubbles[id].markedForRemoval = true;
};

Engine.prototype._spawnBubble = function(newBubble) {
	while(!this.isClear(newBubble)) {
		newBubble.x = Math.floor(Math.random()*this.width);
		newBubble.y = Math.floor(Math.random()*this.height);
	}
	this.bubbles[newBubble.id] = newBubble;
	this.bubbleKeys.push(newBubble.id);
};

Engine.prototype.isClear = function(bubble) {
	var bubble2;
	for(var i = 0; i < this.bubbleKeys.length; i++) {
		bubble2 = this.bubbles[this.bubbleKeys[i]];
		if(gameFunctions.haveCollided(bubble, bubble2))
			return false;
	}
	return true;
};

Engine.prototype.updateState = function() {
	//	We go through all bubbles and process their latest 
	//  vector info to update their positions
	var bubble, bubble2;
	var tmp; 
	var bubbleLost = false;
	
	//	first we update the positions 						O(n)
	for(var i = 0; i < this.bubbleKeys.length; i++) {
		bubble = this.bubbles[this.bubbleKeys[i]];
		
		//console.log(bubble.id, bubble.x, bubble.y);
		if(bubble.vector && !this.bouncyWalls) {
			tmp = bubble.x + bubble.vector.dx;
			if(tmp >= 0 && tmp < this.width)
				bubble.x = tmp;
			tmp = bubble.y + bubble.vector.dy;
			if(tmp >= 0 && tmp < this.height)
				bubble.y = tmp;
			//bubble.vector;
		}
		else {
			tmp = bubble.x + bubble.vector.dx;
			if(tmp >= 0 && tmp < this.width)
				bubble.x = tmp;
			else 
				bubble.vector.dx *= -1;
			tmp = bubble.y + bubble.vector.dy;
			if(tmp >= 0 && tmp < this.height)
				bubble.y = tmp;
			else
				bubble.vector.dy *= -1;
		}
	}

	var marked = [];
	//	next we check for collisions 						O(n^2)
	for(var i = 0; i < this.bubbleKeys.length; i++) {
		bubble = this.bubbles[this.bubbleKeys[i]];
		if(bubble.markedForRemoval) {
			marked.push(bubble.id);
			continue;
		}

		for(var j = i+1; j < this.bubbleKeys.length; j++) {
			bubble2 = this.bubbles[this.bubbleKeys[j]];
			if(bubble && bubble2 && gameFunctions.haveCollided(bubble, bubble2)) {
				tmp = gameFunctions.getCollisionResult(bubble, bubble2);
				if(tmp.winner) {
					var oldMaxSpeed = gameFunctions.getMaxSpeed(tmp.winner.radius);
					tmp.winner.radius = gameFunctions.getPostGobbleRadius(bubble, bubble2);
					var newMaxSpeed = gameFunctions.getMaxSpeed(tmp.winner.radius);
					tmp.winner.vector = {
						dx: tmp.winner.vector.dx * newMaxSpeed / oldMaxSpeed,
						dy: tmp.winner.vector.dy * newMaxSpeed / oldMaxSpeed
					};
					//	need code to handle post-collision slowdown of winner!
					delete this.bubbles[tmp.loser.id];
					bubbleLost = true;
				}
			}
		}
	}

	marked.forEach(function(id) {
		bubbleLost = true;
		delete this.bubbles[id];
	}.bind(this))

	//	reset bubbleKeys
	if(bubbleLost)
		this.bubbleKeys = Object.keys(this.bubbles);
};

module.exports = Engine;