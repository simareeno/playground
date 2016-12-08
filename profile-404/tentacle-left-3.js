var rendererL3 = PIXI.autoDetectRenderer(250, 200);
$('#tentacle-left-3').append(rendererL3.view);

// create the root of the scene graph
var stageL3 = new PIXI.Container();

var countL3 = 0;

// build a rope!
// var ropeLength = 918 / 20;
var ropeLengthL3 = 60;

var pointsL3 = [
  {
        x: 0,
        y: 0,
  },
  {
        x: 0,
        y: 0
  },
  {
        x: 0,
        y: 0
  },
  {
        x: 0,
        y: 0
  },
  {
        x: 0,
        y: 0
  },
];

// for (var i = 0; i < 5; i++)
// {
//     points.push(new PIXI.Point(i * ropeLength, 0));
// }

var stripL3 = new PIXI.mesh.Rope(PIXI.Texture.fromImage('tentacle-left-3.png'), pointsL3);

stripL3.position.x = 0;
stripL3.position.y = 100;

stageL3.addChild(stripL3);

var gL3 = new PIXI.Graphics();

gL3.x = stripL3.x;
gL3.y = stripL3.y;
stageL3.addChild(gL3);

// start animating
animateL3();

function animateL3() {

    countL3 += 0.03;

    // make the snake
    for (var i = 0; i < pointsL3.length; i++) {
				if (i === 4) {
					pointsL3[i].x = i * ropeLengthL3 + Math.cos((i * 10) + countL3) * 0;
					pointsL3[i].y = Math.sin((i * 5) + countL3) * 12;
				} else {
					pointsL3[i].x = i * ropeLengthL3 + Math.cos((i * 5.3) + countL3) * 0;
					pointsL3[i].y = Math.sin((i * 1) + countL3) * 3;
				}


    }

//   for (var i = 0; i < points.length; i++) {

//     var current = points[i].y;

//     console.log (points[i].y)
//     console.log (count);

//    }

    // render the stage
    rendererL3.render(stageL3);
    rendererL3.backgroundColor = 0x151517;

    // renderPoints();

    requestAnimationFrame(animateL3);
}

// function renderPoints () {
//
//     gL3.clear();
//
//     gL3.lineStyle(2,0xffffff);
//     gL3.moveTo(pointsL3[0].x,pointsL3[0].y);
//
//     for (var i = 1; i < points.length; i++) {
//         gL3.lineTo(pointsL3[i].x,pointsL3[i].y);
//     };
//
//     for (var i = 1; i < points.length; i++) {
//         gL3.beginFill(0x000000);
//         gL3.drawCircle(points[i].x,pointsL3[i].y,10);
//         gL3.endFill();
//     };
// }
