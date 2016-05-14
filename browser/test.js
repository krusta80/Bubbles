
var OFFCONTEXT;
var CONTEXT;
function renderPelletPallete () {
  var cvs = document.getElementById('canvas');
  cvs.width = 240;
  cvs.height = 240;
  var ctx = cvs.getContext('2d');
  ctx.fillStyle="rgba(255, 255, 255, 0)";
  ctx.fillRect(0, 0, 240, 240);
  

  var radiusOfCircle = 10;
  for (var x = radiusOfCircle; x < cvs.width-radiusOfCircle; x+=((2*radiusOfCircle))) {
    for (var y = radiusOfCircle; y < cvs.height-radiusOfCircle; y+=((2*radiusOfCircle))) {
      drawCircle(x,y,radiusOfCircle - 1.7, getRandomColor(), ctx);
    }
  }

  OFFCONTEXT = ctx;

}
var getRandomColor = function() {
    var RR = Math.floor(Math.random()*256).toString(16);
    var GG = Math.floor(Math.random()*256).toString(16);
    var BB = Math.floor(Math.random()*256).toString(16);
    return '#'+RR+GG+BB;
};

function drawCircle(centerX, centerY, radius, color, context) {
    context.beginPath();
    context.arc(centerX, centerY, radius, 0, 2 * Math.PI, false);
    context.fillStyle = color;
    context.fill();
    context.lineWidth = 0;
    context.strokeStyle = color;
    context.stroke();
}

function getRandomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1) + min);
}

function cutRandomCircle() {
  var randomx = getRandomInt(0,8);
  var randomy = getRandomInt(0,8);

  pelletImage = OFFCONTEXT.getImageData(randomx*20,randomy*20,20,20);


  var cvs = document.getElementById('canvas2');
  cvs.width = 200;
  cvs.height = 200;
  var CONTEXT = cvs.getContext('2d');
  CONTEXT.putImageData(pelletImage, 5,5);

}

window.onload = function() {
  renderPelletPallete();
  cutRandomCircle();
}