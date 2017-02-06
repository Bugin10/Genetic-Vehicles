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
        showAngleIndicator: false,
        showShadows: true,
        wireframes: false,
        width: 1400,
        height: 800,
        hasBounds: true,
        showBounds: false,
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
    for (i = 0; i < 500; i++) {

        floorTiles[i] = Composite.create();
        var nextGroundTile = Bodies.rectangle(previousTileBounds.x + 60, previousTileBounds.y, 150, 20,
            { isStatic: true, friction: 1, chamfer: { radius: 9 } });
        Composite.add(floorTiles[i], nextGroundTile);

        var rand = Math.random() * ((i + 0.001) / 125) + (0.5 - (i / 250));
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


carArray = [];
for (j = 0; j < 20; j++) {
    var vertexArray = [];
    wheelBase = -20,
        wheelAOffset = 0,
        wheelBOffset = 0,
        wheelYOffset = 0,
        wheelSize = 50;

    for (i = 0; i < 15; i++) {
        vertexArray[i] = Vector.create(Math.random() * 200, Math.random() * 200);
    }
    vertexArray = Vertices.clockwiseSort(vertexArray);
    var temp = Bodies.fromVertices(500, 0, vertexArray, {
        collisionFilter: {
            group: 'ok'
        },
        density: 1,
        driction: 0.15
    }, [flagInternal = false], [removeCollinear = 0.01], [minimumArea = 100]);
    if (temp.vertices.length <= 4) {
        j--
        continue
    }


    var wheelA = Bodies.circle(temp.vertices[4].x, temp.vertices[4].y, wheelSize, {
        collisionFilter: {
            group: 'ok'
        },
        friction: 0.25,
        density: 0.9
    });

    var wheelB = Bodies.circle(temp.vertices[0].x, temp.vertices[0].y, wheelSize, {
        collisionFilter: {
            group: 'ok'
        },
        friction: 0.25,
        density: 0.9
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



// ------------------------- Initialisation--------------------------//
render.bounds.min.x = carArray[0].bodies[0].bounds.min.x - 700;
render.bounds.max.x = carArray[0].bodies[0].bounds.min.x + 700;

render.bounds.min.y = carArray[0].bodies[0].bounds.min.y - 400;
render.bounds.max.y = carArray[0].bodies[0].bounds.min.y + 400;

maxXArray = [];
carHealth = []
currentAlive = 20
for (i = 0; i < 20; i++) {
    maxXArray[i] = -10000000
    carHealth[i] = 1000
}


console.log(carArray[0])
// run the engine
Engine.run(engine);
// run the renderer
Render.run(render);

linebreak = document.createElement("br");
document.body.appendChild(linebreak);

var minimapCanvas = document.createElement('canvas'),
    ctx = minimapCanvas.getContext('2d');
minimapCanvas.width = 450;
minimapCanvas.height = 250;
minimapCanvas.id = "minimapCanvas";
document.body.appendChild(minimapCanvas);



var healthDisplay = document.createElement('canvas'),
    cth = healthDisplay.getContext('2d');
healthDisplay.width = 450;
healthDisplay.height = 250;
healthDisplay.id = "healthDisplay";
document.body.appendChild(healthDisplay);



function DisplayHealth() {
    cth.lineWidth = 1;
    cth.strokeStyle = 'black';
    cth.beginPath();
    var xOff = healthDisplay.width - 1;
    var yOff = 1;
    var size = 450;
    var scale = size / engine.width;
    cth.fillStyle = 'white'
    cth.rect(10, yOff, 299, 239);
    cth.stroke();
    cth.fill();


    for (h = 0; h < 20; h++) {
        if (carHealth[h] <= 0) {
            cth.strokeStyle = 'black'
        }
        else {
            cth.strokeStyle = 'green'
        }
        cth.beginPath();
        cth.lineWidth = 15

        cth.moveTo(17 + (h * 15), healthDisplay.height - 10);
        cth.lineTo(17 + (h * 15), (1000 - carHealth[h]) / 4.2 +1 );
        cth.stroke();
        cth.closePath();
    }
}


function Minimap(hero) {
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
    ctx.fillRect(hero.bodies[0].position.x / floorTiles[499].bodies[0].bounds.max.x * size - 3, (hero.bodies[0].position.y / 50 + 125) - 3, 5, 5);
    ctx.fillStyle = 'black';
    ctx.closePath();

    ctx.beginPath();
    ctx.strokeStyle = 'black';

    for (i = 0; i < 500; i++) {
        if (floorTiles[i].bodies[0].angle > Math.pi) {
            var tileRighty = floorTiles[i].bodies[0].bounds.max.y;
            var tileLefty = floorTiles[i].bodies[0].bounds.min.y;
        }
        else {
            var tileRighty = floorTiles[i].bodies[0].bounds.min.y;
            var tileLefty = floorTiles[i].bodies[0].bounds.max.y;
        }

        ctx.lineTo(floorTiles[i].bodies[0].bounds.min.x / floorTiles[499].bodies[0].bounds.max.x * size, floorTiles[i].bodies[0].bounds.min.y / 50 + 125);

    }
    ctx.stroke();
    ctx.closePath();

    for (h = 0; h < 20; h++) {
        if (carHealth[h] <= 0) {
            ctx.strokeStyle = 'black'
        }
        else {
            ctx.strokeStyle = 'gold'
        }
        ctx.beginPath();

        ctx.moveTo(carArray[h].bodies[0].position.x / floorTiles[499].bodies[0].bounds.max.x * size, 1);
        ctx.lineTo(carArray[h].bodies[0].position.x / floorTiles[499].bodies[0].bounds.max.x * size, 240);
        ctx.stroke();
        ctx.closePath();
    }
}


(function run() {

    window.requestAnimationFrame(run);

    for (i = 0; i < carArray.length; i++) {
        if (carHealth[i] > 0) {
            Body.setAngularVelocity(carArray[i].bodies[1], 0.4);
            Body.setAngularVelocity(carArray[i].bodies[2], 0.4);
        }
    }

    for (i = 0; i < 20; i++) {
        if ((carArray[i].bodies[0].bounds.max.x < maxXArray[i] + 4) && (carHealth[i] > 0)) {
            carHealth[i] -= 3;

        }
        else if (carHealth[i] > 0) {
            carHealth[i] = 1000
        }

        if (carHealth[i] <= 0) {
            for (j = 0; j < carArray[i].bodies.length; j++) {
                carArray[i].bodies[j].render.fillStyle = '#333'
            }
        }
    }


    var hero = carArray[0]
    for (i = 0; i < 20; i++) {
        if ((carArray[i].bodies[0].bounds.max.x > hero.bodies[0].bounds.max.x) && (carHealth[i] > 0)) {
            hero = carArray[i]
        }
        if (maxXArray[i] < carArray[i].bodies[0].bounds.max.x) {
            maxXArray[i] = carArray[i].bodies[0].bounds.max.x;
        }
    
    }


    diffx = (render.bounds.min.x - hero.bodies[0].bounds.min.x + 600) / 20

    render.bounds.min.x -= diffx;
    render.bounds.max.x -= diffx;

    diffy = (render.bounds.min.y - hero.bodies[0].bounds.min.y + 400) / 20
    render.bounds.min.y -= diffy
    render.bounds.max.y -= diffy
    // console.log(boxA.position.x);
    // // Update Mouse
    Mouse.setOffset(mouseConstraint.mouse, render.bounds.min);
    Minimap(hero);
    DisplayHealth();
})();
