
module.exports = {

	STARTING_RADIUS: 25,				//	size of a newly-spawned bubble
	STARTING_MAX_SPEED: 100,			//	max speed of a newly-spawned bubble
	
	/**
		The following functions are used to generate and maintain
		bubbles.
	*/

	generateBubble: function(properties) {
	    if(properties.color)
	        var color = properties.color;
	    else
	        var color = this.getRandomColor();
	    if(properties.dx === undefined)
	        properties.dx = 0;
	    if(properties.dy === undefined)
	        properties.dy = 0;
	    if(properties.radius)
	        var radius = properties.radius;
	    else
	        var radius = this.STARTING_RADIUS;

	    return {
	        id: properties.id,
	        name: properties.name,
	        score: radius*10,
	        x: 1000,
	        y: 1000,
	        radius: radius,
	        vector: {
	            dx: properties.dx,
	            dy: properties.dx,
	        },
	        color: color
	    };
	},

	getRandomColor: function() {
	    var RR = Math.floor(Math.random()*256).toString(16);
	    var GG = Math.floor(Math.random()*256).toString(16);
	    var BB = Math.floor(Math.random()*256).toString(16);
	    return '#'+RR+GG+BB;
	},

	/**
		The following functions are used to identify and handle
		bubble collisions.
	*/

	haveCollided: function(bubble1, bubble2) {
		return this.getDistance(bubble1, bubble2) < bubble1.radius + bubble2.radius;
	},

	getPostGobbleRadius: function(bubble1, bubble2) {
		//	The larger of the two (of course)
		var radius1 = bubble1.radius;
		var radius2 = bubble2.radius;
		return Math.sqrt(radius1*radius1 + radius2*radius2);
	},

	getCollisionResult: function(bubble1, bubble2) {
		if(bubble1.radius === bubble2.radius)
			return {winner: undefined, loser: undefined};
		else if(bubble1.radius > bubble2.radius)  
			return {winner: bubble1, loser: bubble2};
		else
			return {winner: bubble2, loser: bubble1};
	},


	/**
		The following functions are used to determine a player's 
		speed and bearing.
	*/

	getPlayerVector: function(bubble, mouseDx, mouseDy) {
		//	mouseDx and mouseDy are assumed to be measured in pixels relative to 
		//	the center of the player's bubble, which is assigned coordinates (0,0)
		
		var mouseDistance = Math.sqrt(mouseDx*mouseDx + mouseDy*mouseDy);
		var playerSpeed = this.getPlayerSpeed(bubble, mouseDistance);

		return {
			dx: playerSpeed * mouseDx / mouseDistance,
			dy: playerSpeed * mouseDy / mouseDistance
		};
	},

	getPlayerSpeed: function(bubble, mouseDistance) {
		return this.getMaxSpeed(bubble.radius) * this.getSpeedFraction(mouseDistance);
	},

	getMaxSpeed: function(radius) {
		return this.STARTING_MAX_SPEED/Math.sqrt(radius);
	},

	getSpeedFraction: function(distanceFromCenter) {
		distanceFromCenter /= this.STARTING_RADIUS;
		var pers = [0, .3, 1, 1, 1];
		var floored = Math.floor(distanceFromCenter);
		if(floored > 4)
			floored = 4;
		return pers[floored];
	},


	/**
		The following functions are used to measure two objects'
		relative distance.
	*/

	getDistanceAndComponents: function(object1, object2) {
		//	assumes that passed object will have properties x and y
		//  and is from object1's perspective
		return {
			dx: this.getDx(object1, object2),
			dy: this.getDy(object1, object2),
			distance: this.getDistance(object1, object2)
		};
	},
	
	getDistance: function(object1, object2) {
		var dx = this.getDx(object1, object2);
		var dy = this.getDy(object1, object2);
		return Math.sqrt(dx*dx + dy*dy);
	},

	getDx: function(object1, object2) {
		return object2.x - object1.x;
	},

	getDy: function(object1, object2) {
		return object2.y - object1.y;
	}
};

var testIt = function() {
	var playerBubble = {name: "hero", radius: 20, x: 5, y: 5};
	var bubble2 = {name: "villain", radius: 12, x: 10, y: 5};

	console.log("Player Bubble   :", playerBubble);
	console.log("Bubble 2        :", bubble2);
	console.log("Collision?      :", module.exports.haveCollided(playerBubble, bubble2));
	console.log("Winner          :", module.exports.getCollisionResult(playerBubble, bubble2).winner.name);
	console.log("Winner's Radius :", module.exports.getPostGobbleRadius(playerBubble, bubble2));
};

