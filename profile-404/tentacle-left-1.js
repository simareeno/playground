var renderer = PIXI.autoDetectRenderer(150, 200);
$('#tentacle-left-1').append(renderer.view);

// create the root of the scene graph
var stage = new PIXI.Container();

var count = 0;

// build a rope!
// var ropeLength = 918 / 20;
var ropeLength = 34;

var points = [];

// var points = [
//   {
//         x: -10,
//         y: 0,
//   },
//   {
//         x: 30,
//         y: 20
//   },
//   {
//         x: 70,
//         y: 30
//   },
//   {
//         x: 120,
//         y: -50
//   },
// ];
//
for (var i = 0; i < 5; i++)
{
    points.push(new PIXI.Point(i * ropeLength, 0));
}

console.log(points)

var strip = new PIXI.mesh.Rope(PIXI.Texture.fromImage('tentacle-left-1.png'), points);

strip.position.x = 0;
strip.position.y = 80;

stage.addChild(strip);

var g = new PIXI.Graphics();

g.x = strip.x;
g.y = strip.y;
stage.addChild(g);

// start animating
animate();

function animate() {

    count += 0.03;

    // make the snake



    for (var i = 0; i < points.length; i++) {

        points[i].y = Math.sin((i * 2) + count) * 2;
        points[i].x = i * ropeLength + Math.cos((i * 300) + count) * 1;

    }

//   for (var i = 0; i < points.length; i++) {

//     var current = points[i].y;

//     console.log (points[i].y)
//     console.log (count);

//    }

    // render the stage
    renderer.render(stage);
    renderer.backgroundColor = 0x151517;

    // renderPoints();

    requestAnimationFrame(animate);
}

function renderPoints () {

    g.clear();

    g.lineStyle(2,0xffffff);
    g.moveTo(points[0].x,points[0].y);

    for (var i = 1; i < points.length; i++) {
        g.lineTo(points[i].x,points[i].y);
    };

    for (var i = 1; i < points.length; i++) {
        g.beginFill(0x000000);
        g.drawCircle(points[i].x,points[i].y,10);
        g.endFill();
    };
}
