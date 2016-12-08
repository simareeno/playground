var rendererR2 = PIXI.autoDetectRenderer(390, 170);
$('#tentacle-right-2').append(rendererR2.view);

// create the root of the scene graph
var stageR2 = new PIXI.Container();

var countR2 = 0;

// build a rope!
// var ropeLength = 918 / 20;
var ropeLengthR2 = 100;

var pointsR2 = [
  {
        x: -50,
        y: 10,
  },
  {
        x: 100,
        y: -10
  },
  {
        x: 200,
        y: 10
  },
  {
        x: 300,
        y: -10
  },
  {
        x: 400,
        y: 10
  },
];

// for (var i = 0; i < 5; i++)
// {
//     points.push(new PIXI.Point(i * ropeLength, 0));
// }

var stripR2 = new PIXI.mesh.Rope(PIXI.Texture.fromImage('tentacle-right-2.png'), pointsR2);

stripR2.position.x = 0;
stripR2.position.y = 80;

stageR2.addChild(stripR2);

var gR2 = new PIXI.Graphics();

gR2.x = stripR2.x;
gR2.y = stripR2.y;
stageR2.addChild(gR2);

// start animating
animateR2();

function animateR2() {

    countR2 += 0.025;

    // make the snake
    for (var i = 0; i < pointsR2.length; i++) {

        pointsR2[i].y = Math.sin((i * 2) + countR2) * 5;
        pointsR2[i].x = i * ropeLengthR2 + Math.cos((i * 5.3) + countR2) * 2;

    }

//   for (var i = 0; i < points.length; i++) {

//     var current = points[i].y;

//     console.log (points[i].y)
//     console.log (count);

//    }

    // render the stage
    rendererR2.render(stageR2);
    rendererR2.backgroundColor = 0x151517;

    // renderPoints();

    requestAnimationFrame(animateR2);
}

// function renderPoints () {
//
//     gR2.clear();
//
//     gR2.lineStyle(2,0xffffff);
//     gR2.moveTo(pointsR2[0].x,pointsR2[0].y);
//
//     for (var i = 1; i < points.length; i++) {
//         gR2.lineTo(pointsR2[i].x,pointsR2[i].y);
//     };
//
//     for (var i = 1; i < points.length; i++) {
//         gR2.beginFill(0x000000);
//         gR2.drawCircle(points[i].x,pointsR2[i].y,10);
//         gR2.endFill();
//     };
// }
