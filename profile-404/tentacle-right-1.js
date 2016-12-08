var rendererR1 = PIXI.autoDetectRenderer(270, 200);
$('#tentacle-right-1').append(rendererR1.view);

// create the root of the scene graph
var stageR1 = new PIXI.Container();

var countR1 = 0;

// build a rope!
// var ropeLength = 918 / 20;
var ropeLengthR1 = 70;

var pointsR1 = [
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

var stripR1 = new PIXI.mesh.Rope(PIXI.Texture.fromImage('tentacle-right-1.png'), pointsR1);

stripR1.position.x = 0;
stripR1.position.y = 100;

stageR1.addChild(stripR1);

var gR1 = new PIXI.Graphics();

gR1.x = stripR1.x;
gR1.y = stripR1.y;
stageR1.addChild(gR1);

// start animating
animateR1();

function animateR1() {

    countR1 += 0.025;

    // make the snake
    for (var i = 0; i < pointsR1.length; i++) {

        pointsR1[i].y = Math.sin((i * 2) + countR1) * 5;
        pointsR1[i].x = i * ropeLengthR1 + Math.cos((i * 5.3) + countR1) * 2;

    }

//   for (var i = 0; i < points.length; i++) {

//     var current = points[i].y;

//     console.log (points[i].y)
//     console.log (count);

//    }

    // render the stage
    rendererR1.render(stageR1);
    rendererR1.backgroundColor = 0x151517;

    // renderPoints();

    requestAnimationFrame(animateR1);
}

// function renderPoints () {
//
//     gR1.clear();
//
//     gR1.lineStyle(2,0xffffff);
//     gR1.moveTo(pointsR1[0].x,pointsR1[0].y);
//
//     for (var i = 1; i < points.length; i++) {
//         gR1.lineTo(pointsR1[i].x,pointsR1[i].y);
//     };
//
//     for (var i = 1; i < points.length; i++) {
//         gR1.beginFill(0x000000);
//         gR1.drawCircle(points[i].x,pointsR1[i].y,10);
//         gR1.endFill();
//     };
// }
