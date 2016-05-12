var gameFunctions = require('./functions');

var Engine = function(framesPerSecond, width, height, maxBubbles) {
	this.FPS = framesPerSecond;
	this.width = width;
	this.height = height;
	this.maxBubbles = maxBubbles;
	this.bubbles = {};
	this.bubbleKeys = [];
	this.pellets = {};
	this.frame = 0;
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
		if(bubble.vector) {
			tmp = bubble.x + bubble.vector.dx;
			if(tmp >= 0 && tmp < this.width)
				bubble.x = tmp;
			tmp = bubble.y + bubble.vector.dy;
			if(tmp >= 0 && tmp < this.height)
				bubble.y = tmp;
			delete bubble.vector;
		}
	}

	//	next we check for collisions 						O(n^2)
	for(var i = 0; i < this.bubbleKeys.length; i++) {
		bubble = this.bubbles[this.bubbleKeys[i]];
		for(var j = i+1; j < this.bubbleKeys.length; j++) {
			bubble2 = this.bubbles[this.bubbleKeys[j]];
			if(gameFunctions.haveCollided(bubble, bubble2)) {
				tmp = gameFunctions.getCollisionResult(bubble, bubble2);
				if(tmp.winner) {
					tmp.winner.radius = gameFunctions.getPostGobbleRadius(bubble, bubble2);
					delete this.bubbles[tmp.loser.name];
					bubbleLost = true;
				}
			}
		}
	}

	//	reset bubbleKeys
	if(bubbleLost)
		this.bubbleKeys = Object.keys(this.bubbles);
};