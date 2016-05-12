const FPS = 30;									

const STARTING_RADIUS = 1;							//	size of a newly-spawned bubble
const STARTING_MAX_SPEED = STARTING_RADIUS*5;		//	max speed of a newly-spawned bubble

var playerBubble = {name: "hero", radius: 20, x: 5, y: 5};
var bubble2 = {name: "villain", radius: 12, x: 10, y: 5};


/**
	The following functions are used to identify and handle
	bubble collisions.
*/

var haveCollided = function(bubble1, bubble2) {
	return getDistance(bubble1, bubble2) < bubble1.radius + bubble2.radius;
};

var getPostGobbleRadius = function(bubble1, bubble2) {
	//	The larger of the two (of course)
	var radius1 = bubble1.radius;
	var radius2 = bubble2.radius;
	return Math.sqrt(radius1*radius1 + radius2*radius2);
};

var getCollisionResult = function(bubble1, bubble2) {
	if(bubble1.radius === bubble2.radius)
		return {winner: undefined, loser: undefined};
	else if(bubble1.radius > bubble2.radius)  
		return {winner: bubble1, loser: bubble2};
	else
		return {winner: bubble2, loser: bubble1};
};


/**
	The following functions are used to determine a player's 
	speed and bearing.
*/

var getPlayerVector = function(bubble, mouseDx, mouseDy) {
	//	mouseDx and mouseDy are assumed to be measured in pixels relative to 
	//	the center of the player's bubble, which is assigned coordinates (0,0)
	
	var mouseDistance = Math.sqrt(mouseDx*mouseDx + mouseDy*mouseDy);
	var playerSpeed = getPlayerSpeed(bubble, mouseDistance);

	return {
		dx: playerSpeed * mouseDx / mouseDistance,
		dy: playerSpeed * mouseDx / mouseDistance
	};
};

var getPlayerSpeed = function(bubble, mouseDistance) {
	return getMaxSpeed(bubble.radius) * getSpeedFraction(mouseDistance);
};

var getMaxSpeed = function(radius) {
	return STARTING_MAX_SPEED/Math.sqrt(radius);
};

var getSpeedFraction = function(distanceFromCenter) {
	//	assuming distanceFromCenter measured in STARTING_RADIUS increments
	var pers = [0, .1, .4, .8, 1];
	var floored = Math.floor(distanceFromCenter);
	if(floored > 4)
		floored = 4;
	return pers[floored];
};


/**
	The following functions are used to measure two objects'
	relative distance.
*/

var getDistanceAndComponents = function(object1, object2) {
	//	assumes that passed object will have properties x and y
	//  and is from object1's perspective
	return {
		dx: getDx(object1, object2),
		dy: getDy(object1, object2),
		distance: getDistance(object1, object2)
	};
};

var getDistance = function(object1, object2) {
	var dx = getDx(object1, object2);
	var dy = getDy(object1, object2);
	return Math.sqrt(dx*dx + dy*dy);
};

var getDx = function(object1, object2) {
	return object2.x - object1.x;
};

var getDy = function(object1, object2) {
	return object2.y - object1.y;
};

console.log("Player Bubble   :", playerBubble);
console.log("Bubble 2        :", bubble2);
console.log("Collision?      :", haveCollided(playerBubble, bubble2));
console.log("Winner          :", getCollisionResult(playerBubble, bubble2).winner.name);
console.log("Winner's Radius :", getPostGobbleRadius(playerBubble, bubble2));

