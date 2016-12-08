var rendererL1 = PIXI.autoDetectRenderer(480, 200);
$('#tentacle-left-2').append(rendererL1.view);

// create the root of the scene graph
var stageL1 = new PIXI.Container();

var countL1 = 0;

// build a rope!
// var ropeLength = 918 / 20;
var ropeLengthL1 = 115;

var pointsL1 = [
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

var stripL1 = new PIXI.mesh.Rope(PIXI.Texture.fromImage('tentacle-left-2.png'), pointsL1);

stripL1.position.x = 0;
stripL1.position.y = 100;

stageL1.addChild(stripL1);

var gL1 = new PIXI.Graphics();

gL1.x = stripL1.x;
gL1.y = stripL1.y;
stageL1.addChild(gL1);

// start animating
animateL1();

function animateL1() {

    countL1 += 0.025;

    // make the snake
    for (var i = 0; i < pointsL1.length; i++) {

        pointsL1[i].y = Math.sin((i * 2) + countL1) * 5;
        pointsL1[i].x = i * ropeLengthL1 + Math.cos((i * 5.3) + countL1) * 2;

    }

//   for (var i = 0; i < points.length; i++) {

//     var current = points[i].y;

//     console.log (points[i].y)
//     console.log (count);

//    }

    // render the stage
    rendererL1.render(stageL1);
    rendererL1.backgroundColor = 0x151517;

    // renderPoints();

    requestAnimationFrame(animateL1);
}

// function renderPoints () {
//
//     gL1.clear();
//
//     gL1.lineStyle(2,0xffffff);
//     gL1.moveTo(pointsL1[0].x,pointsL1[0].y);
//
//     for (var i = 1; i < points.length; i++) {
//         gL1.lineTo(pointsL1[i].x,pointsL1[i].y);
//     };
//
//     for (var i = 1; i < points.length; i++) {
//         gL1.beginFill(0x000000);
//         gL1.drawCircle(points[i].x,pointsL1[i].y,10);
//         gL1.endFill();
//     };
// }
