const STARTING_RADIUS = 1;
var unitSpeed = STARTING_RADIUS*5;

var circle1 = {radius: 20, x: 5, y: 5};
var circle2 = {radius: 12, x: 10, y: 5};


var haveCollided = function(circle1, circle2) {
	var dx = circle1.x - circle2.x;
	var dy = circle1.y - circle2.y;
	var distance = Math.sqrt(dx * dx + dy * dy);
	return distance < circle1.radius + circle2.radius;
};

var getMaxSpeed = function(radius) {
	return unitSpeed/Math.sqrt(radius);
};

var getSpeedFraction = function(distanceFromCenter) {
	//	assuming distanceFromCenter measured in STARTING_RADIUS increments
	var pers = [0, .1, .4, .8, 1];
	var floored = Math.floor(distanceFromCenter);
	if(floored > 4)
		floored = 4;
	return pers[floored];
};

var getPostGobbleRadius = function(radius1, radius2) {
	//	The larger of the two (of course)
	return Math.sqrt(radius1*radius1 + radius2*radius2);
};

var getVector = function(circle, mouseDx, mouseDy) {
	var maxSpeed = getMaxSpeed(circle.radius);
	//	might have to implement some inverse trig functions here to keep
	//  changes in distance constance (too tired to work out the formulas right now)
	return {
		dx: getSpeedFraction(Math.abs(mouseDx))*maxSpeed*mouseDx/Math.abs(mouseDx),
		dy: getSpeedFraction(Math.abs(mouseDy))*maxSpeed*mouseDy/Math.abs(mouseDy)
	};
};

console.log("Circle 1:", circle1);
console.log("Circle 2:", circle2);
console.log("Have they collided?", haveCollided(circle1, circle2));
console.log("Potential post-collision radius of bigger circle:", getPostGobbleRadius(circle1.radius, circle2.radius));
