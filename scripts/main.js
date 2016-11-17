// module aliases
var Engine = Matter.Engine,
    Render = Matter.Render,
    World = Matter.World,
    Bodies = Matter.Bodies,
    Composites = Matter.Composites,
    Composite = Matter.Composite,
    Constraint = Matter.Constraint,
    Axes = Matter.Axes,
    Body = Matter.Body,
    Bounds = Matter.Bounds,
    Vector = Matter.Vector,
    Mouse = Matter.Mouse,
    MouseConstraint = Matter.MouseConstraint;

// create an engine
var engine = Engine.create();

// create a renderer
var render = Render.create({
    element: document.body,
    engine: engine,
    options: {
        showAngleIndicator: true,
        showShadows: true,
        wireframes: false,
        width: 1000,
        height: 800,
        hasBounds: true,
        showBounds: true,
        showCollisions: true
    }
});

mouseConstraint = MouseConstraint.create(engine, {
    element: render.canvas
});
mouseConstraint.constraint.stiffness = 0.01;


engine.world.bounds.min.x = -100000;
engine.world.bounds.min.y = -100000;
engine.world.bounds.max.x = 100000;
engine.world.bounds.max.y = 100000;



World.add(engine.world, mouseConstraint);
// create two boxes and a ground
var boxA = Bodies.circle(400, 200, 80, 80);
boxA.friction = 0.15;
var boxB = Bodies.circle(200, 200, 80, 80);
boxB.friction = 0.15;
var ground = Bodies.rectangle(200, 400, 400, 30,
    { isStatic: true, angle: Math.PI * 0.0, friction: 1, chamfer: { radius: 15 }, restitution: 0 });

var rand = Math.random() * 0.5 + 0.25;

if (rand < 0.5) {
    var offset = 1 - rand;
}
else {
    var offset = rand
}

if (rand > 0.5) {
    var yoffset = rand;
}
var groundComp = Composite.create();
var groundComp2 = Composite.create();
var ground1 = Bodies.rectangle(ground.bounds.max.x + 180, ground.position.y, 400, 30,
    { isStatic: true, friction: 1, chamfer: { radius: 15 } });
Composite.add(groundComp, ground1);

Composite.rotate(groundComp, -Math.PI * rand + (Math.PI / 2), { x: ground1.bounds.min.x, y: ground1.position.y });


if (rand < 0.5) {
    var pastGroundY = ground1.bounds.max.y - 15;
}
else {
    var pastGroundY = ground1.bounds.min.y + 15;
}
var previousTileBounds = Vector.create(ground1.bounds.max.x, pastGroundY);

console.log(previousTileBounds);
console.log("ok");

var average = 0;
floorTiles = [groundComp2];
for (i = 0; i < 100; i++) {

    floorTiles[i] = Composite.create();
    var nextGroundTile = Bodies.rectangle(previousTileBounds.x + 90, previousTileBounds.y, 200, 20,
        { isStatic: true, friction: 1, chamfer: { radius: 9 } });
    Composite.add(floorTiles[i], nextGroundTile);

    var rand = Math.random()* ((i + 0.001)/50.0) + (0.5-(i/100));
    if(rand>1)
    {
        rand = 0.9;
    }
    if(rand<0)
    {
        rand = 0.1;
    }
    Composite.rotate(floorTiles[i], -Math.PI * rand + (Math.PI / 2), { x: nextGroundTile.bounds.min.x, y: nextGroundTile.position.y });

    if (rand < 0.5) {
        var pastGroundY = nextGroundTile.bounds.max.y - 10;
    }
    else {
        var pastGroundY = nextGroundTile.bounds.min.y + 10;
    }
    previousTileBounds.x = nextGroundTile.bounds.max.x;
    previousTileBounds.y = pastGroundY;
   average += rand;
    World.add(engine.world, floorTiles[i]);
}
console.log(average/100);


World.add(engine.world, Constraint.create({ bodyA: boxA, bodyB: boxB }));
// World.add(engine.world, Constraint.create({bodyA: boxA, bodyB: boxB}));
World.add(engine.world, Axes.fromVertices(boxA.vertices[1]));

//console.log(ground1.position.y, rand);
//World.add(engine.world, Composites.car(150, 100, 100 * 1, 40 * 1, 60 * 1));
// add all of the bodies to the world
World.add(engine.world, [boxA, boxB, ground, groundComp, groundComp2]);


// run the engine
Engine.run(engine);

// run the renderer

Render.run(render);

var minimapCanvas = document.createElement('canvas'),
    ctx = minimapCanvas.getContext('2d');
minimapCanvas.width = 350;
minimapCanvas.height = 250;
minimapCanvas.id = "minimapCanvas";
document.body.appendChild(minimapCanvas);

function Minimap() {
    //  var ctx = document.getElementById("minimapCanvas").getContext("2d");
    ctx.lineWidth = 1;
    ctx.strokeStyle = '#88f';
    ctx.beginPath();
    var xOff = minimapCanvas.width - 5;
    var yOff = 10;
    var size = 300;
    var scale = size / engine.width;
    ctx.fillStyle = 'rgba(0, 0, 50, 0.5)'
    ctx.rect(xOff, yOff, -350, 350);
    ctx.stroke();
    ctx.fill();

    ctx.fillStyle = '#aaf';
    ctx.fillRect(boxA.position.x / floorTiles[99].bodies[0].bounds.max.x * 320,  (boxB.position.y/25 + 125), 5, 5);
    ctx.fillStyle = 'orange';
    for(i =0; i<100; i++)
    {
        if(floorTiles[i].bodies[0].angle > Math.pi)
        {
            var tiley = floorTiles[i].bodies[0].bounds.max.y;
        }
        else
        {
            var tiley = floorTiles[i].bodies[0].bounds.min.y;
        }
        ctx.fillRect(floorTiles[i].bodies[0].position.x/floorTiles[99].bodies[0].bounds.max.x * 320, tiley/25 + 125, 3, 3);
    }
}




(function run() {
    window.requestAnimationFrame(run);
    Body.setAngularVelocity(boxA, Math.PI * 0.04);
    Body.setAngularVelocity(boxB, Math.PI * 0.04);

    //
    // var hero = boxA;
    render.bounds.min.x = boxA.bounds.min.x - 500;
    render.bounds.max.x = boxA.bounds.min.x + 500;

    render.bounds.min.y = boxA.bounds.min.y - 400;
    render.bounds.max.y = boxA.bounds.min.y + 400;
   // console.log(boxA.position.x);
    // // Update Mouse
    Mouse.setOffset(mouseConstraint.mouse, render.bounds.min);
    Minimap();
})();
