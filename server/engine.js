var gameFunctions = require('./functions');

var Engine = function(framesPerSecond, radiusLength, width, height, bouncyWalls, clientSide) {
	gameFunctions.STARTING_RADIUS = radiusLength;
	gameFunctions.STARTING_MAX_SPEED = 2*radiusLength;
	this.FPS = framesPerSecond;
	this.MAX_PELLETS = 3000;
	this.width = width;
	this.height = height;
	this.bubbles = {};
	this.bubbleKeys = [];
	this.pellets = {};
	this.pelletCount = 0;
	this.eatenPellets = [];
	this.frame = 0;
	this.bouncyWalls = bouncyWalls;
	this.clientSide = clientSide;
	this.newestPellet = {};
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

Engine.prototype._spawnPellet = function() {
	var pellet = {
		x: Math.floor(Math.random()*this.width), 
		y: Math.floor(Math.random()*this.height), 
		radius: gameFunctions.STARTING_RADIUS/3,
		color: gameFunctions.getRandomColor()
	};

	while(!this.isClear(pellet)) {
		pellet.x = Math.floor(Math.random()*this.width);
		pellet.y = Math.floor(Math.random()*this.height);
	}
	var key = Math.ceil(pellet.x/gameFunctions.STARTING_RADIUS) + '-' + Math.ceil(pellet.y/gameFunctions.STARTING_RADIUS);
	if(!this.pellets[key])
		this.pellets[key] = [];
	this.pellets[key].push(pellet);
	this.pelletCount++;
	return pellet;
};

Engine.prototype.eatPellets = function(bubble) {
	//	need to check all new "starting radius cells" covered
	var leftEdge = bubble.x - bubble.radius;
    var topEdge = bubble.y - bubble.radius;
    var cellSide = gameFunctions.STARTING_RADIUS;
    var leftmostCell = Math.ceil(leftEdge/cellSide);
    var topmostCell = Math.ceil(topEdge/cellSide);
	var oldMaxSpeed = gameFunctions.getMaxSpeed(bubble.radius);
	var cellsWide = Math.ceil((2*bubble.radius)/gameFunctions.STARTING_RADIUS);
						
	var eatenPellets = [];

    for(var j = leftmostCell; j < leftmostCell + cellsWide; j++) 
    	for(var i = topmostCell; i < topmostCell + cellsWide; i++) 
    		if(this.pellets[j+'-'+i])
    			for(var p = 0; p < this.pellets[j+'-'+i].length; p++) {
    				var pellet = this.pellets[j+'-'+i][p];
    				if(gameFunctions.haveCollided(bubble, pellet)) {
    					bubble.radius = gameFunctions.getPostGobbleRadius(bubble, pellet);
    					bubble.score = bubble.radius*10;
    					this.pellets[j+'-'+i].splice(p,1); p--;
    					eatenPellets.push(pellet);
    					this.pelletCount--;
    				}
    			}
    var newMaxSpeed = gameFunctions.getMaxSpeed(bubble.radius);
    if(eatenPellets.length > 0) {
    	bubble.vector = {
			dx: bubble.vector.dx * newMaxSpeed / oldMaxSpeed,
			dy: bubble.vector.dy * newMaxSpeed / oldMaxSpeed
		};					
	}
	return eatenPellets;
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

Engine.prototype.updateState = function(spawnPellet) {
	//	We go through all bubbles and process their latest 
	//  vector info to update their positions
	var bubble, bubble2;
	var tmp; 
	var bubbleLost = false;
	this.eatenPellets = [];

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

	if(spawnPellet && this.pelletCount < this.MAX_PELLETS)
		this.newestPellet = this._spawnPellet();

	var marked = [];
	//	next we check for collisions 						O(n^2)
	for(var i = 0; i < this.bubbleKeys.length; i++) {
		bubble = this.bubbles[this.bubbleKeys[i]];
		
		if(!bubble)
			continue;

		if(bubble.markedForRemoval) {
			marked.push(bubble.id);
			continue;
		}
		else
			this.eatenPellets = this.eatenPellets.concat(this.eatPellets(bubble));

		for(var j = i+1; j < this.bubbleKeys.length; j++) {
			bubble2 = this.bubbles[this.bubbleKeys[j]];
			if(!bubble2)
				continue;

			if(bubble && bubble2 && gameFunctions.haveCollided(bubble, bubble2)) {
				tmp = gameFunctions.getCollisionResult(bubble, bubble2);
				if(tmp.winner) {
					var oldMaxSpeed = gameFunctions.getMaxSpeed(tmp.winner.radius);
					tmp.winner.radius = gameFunctions.getPostGobbleRadius(bubble, bubble2);
					tmp.winner.score = 10*tmp.winner.radius;
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