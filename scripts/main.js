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
    Vertices = Matter.Vertices,
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
        wireframes: true,
        width: 1400,
        height: 800,
        hasBounds: true,
        showBounds: true,
        showCollisions: true,
        showConstraints: true,
        showVertexNumber: true,
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


engine.positionIterations = 10;


// create two boxes and a ground
var boxA = Bodies.circle(600, 200, 80, 80);
boxA.friction = 0.15;
var boxB = Bodies.circle(800, 200, 80, 80);
boxB.friction = 0.15;

// function carMaker(xx, yy, width, height, wheelSize) {
//     var group = Body.nextGroup(true),
//         wheelBase = -20,
//         wheelAOffset = -width * 0.5 + wheelBase,
//         wheelBOffset = width * 0.5 - wheelBase,
//         wheelYOffset = 0;

//     var car = Composite.create({ label: 'Car' }),
//         body = Bodies.trapezoid(xx, yy, width, height, 0.3, {
//             collisionFilter: {
//                 group: group
//             },
//             friction: 0.01,
//             chamfer: {
//                 radius: 10
//             }
//         });

//     var wheelA = Bodies.circle(xx + wheelAOffset, yy + wheelYOffset, wheelSize, {
//         collisionFilter: {
//             group: group
//         },
//         friction: 0.8,
//         density: 0.01
//     });

//     var wheelB = Bodies.circle(xx + wheelBOffset, yy + wheelYOffset, wheelSize, {
//         collisionFilter: {
//             group: group
//         },
//         friction: 0.8,
//         density: 0.01
//     });

//     var axelA = Constraint.create({
//         bodyA: body,
//         pointA: { x: wheelAOffset, y: wheelYOffset },
//         bodyB: wheelA,
//         stiffness: 0.35
//     });

//     var axelB = Constraint.create({
//         bodyA: body,
//         pointA: { x: wheelBOffset, y: wheelYOffset },
//         bodyB: wheelB,
//         stiffness: 0.35
//     });

//     Composite.addBody(car, body);
//     Composite.addBody(car, wheelA);
//     Composite.addBody(car, wheelB);
//     Composite.addConstraint(car, axelA);
//     Composite.addConstraint(car, axelB);

//     return car;
// };

// function carMaker(xx, yy, width, height, wheelSize) {
//     var group = Body.nextGroup(true),
//         wheelBase = -20,
//         wheelAOffset = -width * 0.5 + wheelBase,
//         wheelBOffset = width * 0.5 - wheelBase,
//         wheelYOffset = 0;




//     var car = Composite.create({ label: 'Car' }),
//         body = Bodies.trapezoid(xx, yy, width, height, 0.3, {
//             collisionFilter: {
//                 group: group
//             },
//             friction: 0.01,
//             chamfer: {
//                 radius: 10
//             }
//         });

//     var wheelA = Bodies.circle(xx + wheelAOffset, yy + wheelYOffset, wheelSize, {
//         collisionFilter: {
//             group: group
//         },
//         friction: 0.8,
//         density: 0.01
//     });

//     var wheelB = Bodies.circle(xx + wheelBOffset, yy + wheelYOffset, wheelSize, {
//         collisionFilter: {
//             group: group
//         },
//         friction: 0.8,
//         density: 0.01
//     });

//     var axelA = Constraint.create({
//         bodyA: body,
//         pointA: { x: wheelAOffset, y: wheelYOffset },
//         bodyB: wheelA,
//         stiffness: 0.35
//     });

//     var axelB = Constraint.create({
//         bodyA: body,
//         pointA: { x: wheelBOffset, y: wheelYOffset },
//         bodyB: wheelB,
//         stiffness: 0.35
//     });

//     Composite.addBody(car, body);
//     Composite.addBody(car, wheelA);
//     Composite.addBody(car, wheelB);
//     Composite.addConstraint(car, axelA);
//     Composite.addConstraint(car, axelB);

//     return car;
// };

//World.add(engine.world, carMaker(300, 0, 50, 50, 30));

function generateGround() {

    var ground = Bodies.rectangle(200, 400, 80, 20,
        { isStatic: true, angle: Math.PI * 0.0, friction: 1, chamfer: { radius: 9 }, restitution: 0 });
    var groundComp = Composite.create();

    if (rand < 0.5) {
        var pastGroundY = ground.bounds.max.y - 10;
    }
    else {
        var pastGroundY = ground.bounds.min.y + 10;
    }
    var previousTileBounds = Vector.create(ground.bounds.max.x, pastGroundY);


    var average = 0;
    floorTiles = [];
    for (i = 0; i < 1000; i++) {

        floorTiles[i] = Composite.create();
        var nextGroundTile = Bodies.rectangle(previousTileBounds.x + 30, previousTileBounds.y, 80, 20,
            { isStatic: true, friction: 1, chamfer: { radius: 9 } });
        Composite.add(floorTiles[i], nextGroundTile);

        var rand = Math.random() * ((i + 0.001) / 500.0) + (0.5 - (i / 1000));
        if (rand > 1) {
            rand = 0.9;
        }
        if (rand < 0) {
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
    return floorTiles;

};

var floorTiles = generateGround();
World.add(engine.world, Constraint.create({ bodyA: boxA, bodyB: boxB }));
// World.add(engine.world, Constraint.create({bodyA: boxA, bodyB: boxB}));
World.add(engine.world, Axes.fromVertices(boxA.vertices[1]));

//console.log(ground1.position.y, rand);
//World.add(engine.world, Composites.car(150, 100, 100 * 1, 40 * 1, 60 * 1));
// add all of the bodies to the world
World.add(engine.world, [boxA, boxB]);

carArray = [];
for (j = 0; j < 2; j++) {
    var vertexArray = [];
    wheelBase = -20,
        wheelAOffset = 0,
        wheelBOffset = 0,
        wheelYOffset = 0,
        wheelSize = 50;

    for (i = 0; i < 10; i++) {
        vertexArray[i] = Vector.create(Math.random() * 200, Math.random() * 200);
    }
    vertexArray = Vertices.clockwiseSort(vertexArray);
    var temp = Bodies.fromVertices(350, -100, vertexArray, {
        collisionFilter: {
            group: 'ok'
        }
    }, [flagInternal = false], [removeCollinear = 0.01], [minimumArea = 100]);

    console.log(temp.vertices);

    var wheelA = Bodies.circle(temp.vertices[4].x, temp.vertices[4].y, wheelSize, {
        collisionFilter: {
            group: 'ok'
        },
        friction: 0.2,
        density: 0.0001
    });

    var wheelB = Bodies.circle(temp.vertices[0].x, temp.vertices[0].y, wheelSize, {
        collisionFilter: {
            group: 'ok'
        },
        friction: 0.2,
        density: 0.0001
    });

    var axelA = Constraint.create({
        bodyA: temp,
        pointA: { x: - temp.position.x + temp.vertices[4].x, y: - temp.position.y + temp.vertices[4].y },
        bodyB: wheelA,
        stiffness: 0.2
    });

    var axelB = Constraint.create({
        bodyA: temp,
        pointA: { x: - temp.position.x + temp.vertices[0].x, y: - temp.position.y + temp.vertices[0].y },
        bodyB: wheelB,
        stiffness: 0.2
    });
    car = Composite.create();
    Composite.addBody(car, temp);
    Composite.addBody(car, wheelA);
    Composite.addBody(car, wheelB);
    Composite.addConstraint(car, axelA);
    Composite.addConstraint(car, axelB);
    carArray[j] = car;
    World.add(engine.world, car);
}


// run the engine
Engine.run(engine);

// run the renderer

Render.run(render);

var minimapCanvas = document.createElement('canvas'),
    ctx = minimapCanvas.getContext('2d');
minimapCanvas.width = 450;
minimapCanvas.height = 250;
minimapCanvas.id = "minimapCanvas";
document.body.appendChild(minimapCanvas);

function Minimap() {
    //  var ctx = document.getElementById("minimapCanvas").getContext("2d");
    ctx.lineWidth = 1;
    ctx.strokeStyle = 'black';
    ctx.beginPath();
    var xOff = minimapCanvas.width - 1;
    var yOff = 1;
    var size = 450;
    var scale = size / engine.width;
    ctx.fillStyle = 'white'
    ctx.rect(xOff, yOff, -448, 239);
    ctx.stroke();
    ctx.fill();

    ctx.fillStyle = 'red';
    ctx.fillRect(boxA.position.x / floorTiles[999].bodies[0].bounds.max.x * size - 3, (boxA.position.y / 50 + 125) - 3, 5, 5);
    ctx.fillStyle = 'black';
    ctx.closePath();

    ctx.beginPath();
    ctx.strokeStyle = 'black';
    // ctx.moveTo(floorTiles[0].bodies[0].bounds.min.x,floorTiles[0].bodies[0].bounds.min.y );

    for (i = 0; i < 1000; i++) {
        if (floorTiles[i].bodies[0].angle > Math.pi) {
            var tileRighty = floorTiles[i].bodies[0].bounds.max.y;
            var tileLefty = floorTiles[i].bodies[0].bounds.min.y;
        }
        else {
            var tileRighty = floorTiles[i].bodies[0].bounds.min.y;
            var tileLefty = floorTiles[i].bodies[0].bounds.max.y;
        }

        ctx.lineTo(floorTiles[i].bodies[0].bounds.min.x / floorTiles[999].bodies[0].bounds.max.x * size, floorTiles[i].bodies[0].bounds.min.y / 50 + 125);
        // ctx.fillRect(floorTiles[i].bodies[0].position.x / floorTiles[99].bodies[0].bounds.max.x * 320, tileRighty / 25 + 125, 3, 3);
    }
    ctx.stroke();
}


(function run() {

    window.requestAnimationFrame(run);
    Body.setAngularVelocity(boxA, Math.PI * 0.0);
    Body.setAngularVelocity(boxB, Math.PI * 0.0);

    for (i = 0; i < carArray.length; i++) {
        Body.setAngularVelocity(carArray[i].bodies[1], 0.1);
        Body.setAngularVelocity(carArray[i].bodies[2], 0.1);
    }

    //
    // var hero = boxA;
    render.bounds.min.x = boxA.bounds.min.x - 700;
    render.bounds.max.x = boxA.bounds.min.x + 700;

    render.bounds.min.y = boxA.bounds.min.y - 400;
    render.bounds.max.y = boxA.bounds.min.y + 400;
    // console.log(boxA.position.x);
    // // Update Mouse
    Mouse.setOffset(mouseConstraint.mouse, render.bounds.min);
    Minimap();
})();
