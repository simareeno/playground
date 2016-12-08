var rendererR3 = PIXI.autoDetectRenderer(105, 200);
$('#tentacle-right-3').append(rendererR3.view);

// create the root of the scene graph
var stageR3 = new PIXI.Container();

var countR3 = 0;

// build a rope!
// var ropeLength = 918 / 20;
var ropeLengthR3 = 28;

var pointsR3 = [
//   {
//         x: -50,
//         y: 10,
//   },
//   {
//         x: 100,
//         y: -10
//   },
//   {
//         x: 200,
//         y: 10
//   },
//   {
//         x: 300,
//         y: -10
//   },
//   {
//         x: 400,
//         y: 10
//   },
];

for (var i = 0; i < 5; i++)
{
    pointsR3.push(new PIXI.Point(i * ropeLength, 0));
}

var stripR3 = new PIXI.mesh.Rope(PIXI.Texture.fromImage('tentacle-right-3.png'), pointsR3);

stripR3.position.x = 0;
stripR3.position.y = 100;

stageR3.addChild(stripR3);

var gR3 = new PIXI.Graphics();

gR3.x = stripR3.x;
gR3.y = stripR3.y;
stageR3.addChild(gR3);

// start animating
animateR3();

function animateR3() {

    countR3 += 0.025;

    // make the snake
    for (var i = 0; i < pointsR3.length; i++) {

			if (i === 0) {
				pointsR3[i].y = Math.sin((i * 1) + countR3) * 4;
				pointsR3[i].x = i * ropeLengthR3 + Math.cos((i * 300) + countR3) * 2;
			} else if (i === 1) {
				pointsR3[i].y = Math.sin((i * 1) + countR3) * 2;
				pointsR3[i].x = i * ropeLengthR3 + Math.cos((i * 150) + countR3) * 2;
			} else if (i === 4) {
				pointsR3[i].y = Math.sin((i * 1) + countR3) * 0;
				pointsR3[i].x = i * ropeLengthR3 + Math.cos((i * 0) + countR3) * 0;
			} else {
				pointsR3[i].y = Math.sin((i * 1) + countR3) * 1;
				pointsR3[i].x = i * ropeLengthR3 + Math.cos((i * 50) + countR3) * 1;
			}



    }

//   for (var i = 0; i < points.length; i++) {

//     var current = points[i].y;

//     console.log (points[i].y)
//     console.log (count);

//    }

    // render the stage
    rendererR3.render(stageR3);
    rendererR3.backgroundColor = 0x151517;

    // renderPoints();

    requestAnimationFrame(animateR3);
}

function renderPoints () {

    gR3.clear();

    gR3.lineStyle(2,0xffffff);
    gR3.moveTo(pointsR3[0].x,pointsR3[0].y);

    for (var i = 1; i < points.length; i++) {
        gR3.lineTo(pointsR3[i].x,pointsR3[i].y);
    };

    for (var i = 1; i < points.length; i++) {
        gR3.beginFill(0x000000);
        gR3.drawCircle(points[i].x,pointsR3[i].y,10);
        gR3.endFill();
    };
}
