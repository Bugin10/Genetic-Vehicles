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
        width: 800,
        height: 400,
        hasBounds: true,
        showBounds: false,
        showCollisions: true,
        showConstraints: true,
        showVertexNumber: true,
        showPositions: false,
        showFPS: true,
        background: '#fafafa'
    }
});


// add mouse control
mouseConstraint = MouseConstraint.create(engine, {
    element: render.canvas
});
mouseConstraint.constraint.stiffness = 0.01;
World.add(engine.world, mouseConstraint);


// define world boundary
engine.world.bounds.min.x = -100000;
engine.world.bounds.min.y = -100000;
engine.world.bounds.max.x = 100000;
engine.world.bounds.max.y = 100000;

// simulation time settings

// engine.positionIterations = 100;
// engine.constraintIterations = 100;
// engine.velocityIterations = 100;

engine.timing.timeScale = 1;





// simulation settings

var poolSize = 20;
var heroCount = 3;
var generationHeroes = [];


// object arrays
var rankList = []
var carArray = [];
var maxXArray = [];
var carHealth = []
var floorTiles;
var ctx;
var cth;

// initialise simulation
initialise();
function initialise() {
    floorTiles = generateGround();
    carArray = generateCars()
    render.bounds.min.x = carArray[0].bodies[0].bounds.min.x - 800;
    render.bounds.max.x = carArray[0].bodies[0].bounds.min.x + 800;
    render.bounds.min.y = carArray[0].bodies[0].bounds.min.y - 400;
    render.bounds.max.y = carArray[0].bodies[0].bounds.min.y + 400;

    currentAlive = poolSize
    for (i = 0; i < poolSize; i++) {
        maxXArray[i] = -10000000
        carHealth[i] = 1000
    }

    // create display elements
    linebreak = document.createElement("br");
    document.body.appendChild(linebreak);

    var minimapCanvas = document.createElement('canvas');
    ctx = minimapCanvas.getContext('2d');
    minimapCanvas.width = 450;
    minimapCanvas.height = 250;
    minimapCanvas.id = "minimapCanvas";
    document.body.appendChild(minimapCanvas);

    var healthDisplay = document.createElement('canvas');
    cth = healthDisplay.getContext('2d');
    healthDisplay.width = 450;
    healthDisplay.height = 250;
    healthDisplay.id = "healthDisplay";
    document.body.appendChild(healthDisplay);

    // run the engine
    Engine.run(engine);
    // run the renderer
    Render.run(render);
}



// generate a new ground in the world
// returns an array of floor tiles
function generateGround() {
    // create starting tile
    var ground = Bodies.rectangle(-100, 400, 80, 20,
        { isStatic: true, angle: Math.PI * 0.0, friction: 1, chamfer: { radius: 9 }, restitution: 0 });
    var groundComp = Composite.create();

    // set ground y offset
    var pastGroundY = ground.bounds.min.y + 10;
    var previousTileBounds = Vector.create(ground.bounds.max.x, pastGroundY);

    floorTiles = [];
    // create 250 new floor tiles
    for (i = 0; i < 250; i++) {
        // add tile to ground composite
        floorTiles[i] = Composite.create();
        var nextGroundTile = Bodies.rectangle(previousTileBounds.x + 60, previousTileBounds.y, 150, 20,
            { isStatic: true, friction: 1, chamfer: { radius: 9 } });
        Composite.add(floorTiles[i], nextGroundTile);

        // prevent ground from being directly vertical
        var rand = Math.random() * ((i + 0.001) / 125) + (0.5 - (i / 250));
        if (rand > 1) {
            rand = 0.9;
        }
        if (rand < 0) {
            rand = 0.1;
        }
        // rotate tile
        Composite.rotate(floorTiles[i], -Math.PI * rand + (Math.PI / 2), { x: nextGroundTile.bounds.min.x, y: nextGroundTile.position.y });

        // set next y offset
        if (rand < 0.5) {
            var pastGroundY = nextGroundTile.bounds.max.y - 10;
        }
        else {
            var pastGroundY = nextGroundTile.bounds.min.y + 10;
        }
        //set next tile x
        previousTileBounds.x = nextGroundTile.bounds.max.x;
        previousTileBounds.y = pastGroundY;
        World.add(engine.world, floorTiles[i]);
    }
    return floorTiles;
};



// generates new randomised car
// returns an array of car
function generateSingleCar() {
    // create car body
    var vertexArray = [];
    // random scattering of vertices
    for (i = 0; i < 15; i++) {
        vertexArray[i] = Vector.create(Math.random() * 200, Math.random() * 200);
    }
    // sort vertices in clockwise order
    vertexArray = Vertices.clockwiseSort(vertexArray);

    // vertexArray = Vertices.fromPath('100 0 75 50 100 100 25 100 0 50 25 0');
    // create body from vertices
    var temp = Bodies.fromVertices(300, 0, vertexArray, {
        collisionFilter: {
            group: 'cars'
        },
        friction: 10,
        mass: 10
    }, [flagInternal = false], [removeCollinear = 0.01], [minimumArea = 100]);

    // clunky way of rebuilding a broken car
    if (temp.vertices.length <= 5) {
        j--
        return generateSingleCar();
    }

    // new random located and sized wheels
    var wheelA = Bodies.circle(temp.vertices[3].x, temp.vertices[3].y, Math.random() * 60 + 20, {
        collisionFilter: {
            group: 'cars'
        },
        friction: 0.2,
        mass: 10
    });

    var wheelB = Bodies.circle(temp.vertices[0].x, temp.vertices[0].y, Math.random() * 60 + 20, {
        collisionFilter: {
            group: 'cars'
        },
        friction: 0.2,
        mass: 10
    });

    // axels to join wheels to car
    var axelA = Constraint.create({
        bodyA: temp,
        pointA: { x: - temp.position.x + wheelA.position.x, y: - temp.position.y + wheelA.position.y },
        bodyB: wheelA,
        stiffness: 0.3

    });

    var axelB = Constraint.create({
        bodyA: temp,
        pointA: { x: - temp.position.x + wheelB.position.x, y: - temp.position.y + wheelB.position.y },
        bodyB: wheelB,
        stiffness: 0.3

    });

    // add body and wheels to a new car composite
    car = Composite.create();
    Composite.addBody(car, temp);
    Composite.addBody(car, wheelA);
    Composite.addBody(car, wheelB);
    Composite.addConstraint(car, axelA);
    Composite.addConstraint(car, axelB);
    World.add(engine.world, car);
    return car;
}

// generate array of cars
function generateCars() {
    cars = []
    for (j = 0; j < poolSize; j++) {
        cars[j] = generateSingleCar();
    }
    return cars
}




// generates new genetic car
// returns an array of car
function evolveCar() {
    // create car body
    var vertexArray = [];
    // random scattering of vertices
    for (i = 0; i < 15; i++) {
        vertexArray[i] = Vector.create(Math.random() * 200, Math.random() * 200);
    }
    // sort vertices in clockwise order
    vertexArray = Vertices.clockwiseSort(vertexArray);

    // vertexArray = Vertices.fromPath('100 0 75 50 100 100 25 100 0 50 25 0');
    // create body from vertices
    var temp = Bodies.fromVertices(300, 0, vertexArray, {
        collisionFilter: {
            group: 'cars'
        },
        friction: 10,
        mass: 10
    }, [flagInternal = false], [removeCollinear = 0.01], [minimumArea = 100]);

    // clunky way of rebuilding a broken car
    if (temp.vertices.length <= 5) {
        j--
        return evolveCar();
    }

    // new random located and sized wheels
    var wheelA = Bodies.circle(temp.vertices[3].x, temp.vertices[3].y, Math.random() * 60 + 20, {
        collisionFilter: {
            group: 'cars'
        },
        friction: 0.2,
        mass: 10
    });

    var wheelB = Bodies.circle(temp.vertices[0].x, temp.vertices[0].y, Math.random() * 60 + 20, {
        collisionFilter: {
            group: 'cars'
        },
        friction: 0.2,
        mass: 10
    });

    // axels to join wheels to car
    var axelA = Constraint.create({
        bodyA: temp,
        pointA: { x: - temp.position.x + wheelA.position.x, y: - temp.position.y + wheelA.position.y },
        bodyB: wheelA,
        stiffness: 0.3

    });

    var axelB = Constraint.create({
        bodyA: temp,
        pointA: { x: - temp.position.x + wheelB.position.x, y: - temp.position.y + wheelB.position.y },
        bodyB: wheelB,
        stiffness: 0.3

    });

    // add body and wheels to a new car composite
    car = Composite.create();
    Composite.addBody(car, temp);
    Composite.addBody(car, wheelA);
    Composite.addBody(car, wheelB);
    Composite.addConstraint(car, axelA);
    Composite.addConstraint(car, axelB);
    World.add(engine.world, car);
    return car;
}





























// draw the health display
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

    // for each car draw their health as a green bar    
    for (h = 0; h < poolSize; h++) {
        if (carHealth[h] <= 0) {
            cth.strokeStyle = 'black'
        }
        else {
            cth.strokeStyle = 'green'
        }
        cth.beginPath();
        cth.lineWidth = 15
        cth.moveTo(17 + (h * 15), healthDisplay.height - 10);
        cth.lineTo(17 + (h * 15), (1000 - carHealth[h]) / 4.2 + 1);
        cth.stroke();
        cth.closePath();
    }
}

// draw the minimap containing the floor and x position of each car
// draw a red square on top of the leading car
// blakc lines for a dead car, yellow for alive
function Minimap(hero) {
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
    ctx.fillRect(hero.bodies[0].position.x / floorTiles[floorTiles.length - 1].bodies[0].bounds.max.x * size - 3, (hero.bodies[0].position.y / 50 + 125) - 3, 5, 5);
    ctx.fillStyle = 'black';
    ctx.closePath();
    ctx.beginPath();
    ctx.strokeStyle = 'black';
    // draw floor into minimap
    for (i = 0; i < floorTiles.length - 1; i++) {
        if (floorTiles[i].bodies[0].angle > Math.pi) {
            var tileRighty = floorTiles[i].bodies[0].bounds.max.y;
            var tileLefty = floorTiles[i].bodies[0].bounds.min.y;
        }
        else {
            var tileRighty = floorTiles[i].bodies[0].bounds.min.y;
            var tileLefty = floorTiles[i].bodies[0].bounds.max.y;
        }

        ctx.lineTo(floorTiles[i].bodies[0].bounds.min.x / floorTiles[floorTiles.length - 1].bodies[0].bounds.max.x * size, floorTiles[i].bodies[0].bounds.min.y / 50 + 125);

    }
    ctx.stroke();
    ctx.closePath();
    //draw each car as a vertical line representing its x position
    for (h = 0; h < poolSize; h++) {
        if (carHealth[h] <= 0) {
            ctx.strokeStyle = 'black'
        }
        else {
            ctx.strokeStyle = 'gold'
        }
        ctx.beginPath();
        if (carHealth[h] > 0) {
            ctx.moveTo(carArray[h].bodies[0].position.x / floorTiles[floorTiles.length - 1].bodies[0].bounds.max.x * size, 1);
            ctx.lineTo(carArray[h].bodies[0].position.x / floorTiles[floorTiles.length - 1].bodies[0].bounds.max.x * size, 240);
            ctx.stroke();
            ctx.closePath();
        }
        else {
            ctx.moveTo(maxXArray[h] / floorTiles[floorTiles.length - 1].bodies[0].bounds.max.x * size, 1);
            ctx.lineTo(maxXArray[h] / floorTiles[floorTiles.length - 1].bodies[0].bounds.max.x * size, 240);
            ctx.stroke();
            ctx.closePath();
        }
    }
}


// reset the car health, max positions and destroy the Composite
function endGeneration() {
    for (i = 0; i < poolSize; i++) {
        carHealth[i] = 1000
        maxXArray[i] = -100000000000
        Matter.Composite.clear(carArray[i], [deep = true])
    }

}



function nextGeneration() {
    // create new generation of cars
    var tempCars = generateCars()
    for (i = 0; i < poolSize; i++) {
        carArray[i] = tempCars[i]
    }
}




// main simulation loop
(function run() {

    window.requestAnimationFrame(run);

    // turn each cars wheels
    for (i = 0; i < carArray.length; i++) {
        if (carHealth[i] > 0) {
            Body.setAngularVelocity(carArray[i].bodies[1], 0.4);
            Body.setAngularVelocity(carArray[i].bodies[2], 0.4);
        }
    }

    // reduce a cars health if it is not moving fast enough
    for (i = 0; i < poolSize; i++) {
        // low movement kill faster
        if ((carArray[i].bodies[0].bounds.max.x < maxXArray[i] + (1.5 * engine.timing.timeScale)) && (carHealth[i] > 0)) {
            carHealth[i] -= 3 * engine.timing.timeScale;
        }
        // moderate movement kill slower
        else if ((carArray[i].bodies[0].bounds.max.x < maxXArray[i] + (3.5 * engine.timing.timeScale)) && (carHealth[i] > 0)) {
            carHealth[i] -= 1 * engine.timing.timeScale;
        }
        // otherwise reset car health
        else if (carHealth[i] > 0) {
            carHealth[i] = 1000
        }
        // if a car health is =< 0 change its colour and stop its movement
        if (carHealth[i] <= 0) {
            for (j = 0; j < carArray[i].bodies.length; j++) {
                for (h = 0; h < carArray[i].bodies[j].parts.length; h++) {
                    if (h == 0) {
                        carArray[i].bodies[j].parts[h].render.fillStyle = 'pink';
                    }
                    carArray[i].bodies[j].parts[h].render.fillStyle = '#333';
                }
                carArray[i].bodies[j].render.fillStyle = '#333';
                Body.setAngularVelocity(carArray[i].bodies[1], 0);
                Body.setAngularVelocity(carArray[i].bodies[2], 0);
            }
            carHealth[i] = 0;
        }
        // if a car is experiencing extreme force, kill it and remove its wheels
        if (carArray[i].bodies[0].speed > 50) {
            carHealth[i] = 0;
            Composite.removeConstraint(carArray[i], carArray[i].constraints[0], [deep = true]);
            Composite.removeConstraint(carArray[i], carArray[i].constraints[1], [deep = true]);
        }
    }

    // check if the generation has died
    var allDead = true
    for (i = 0; i < poolSize; i++) {
        if (carHealth[i] > 0) {
            allDead = false
        }
    }
    // end generation if no cars alive
    if (allDead) {
        var list = []
        for (i = 0; i < poolSize; i++) {
            list.push({ 'car': carArray[i], 'maxX': maxXArray[i] });
        }

        list.sort(function (a, b) {
            return ((a.maxX < b.maxX) ? -1 : ((a.maxX == b.maxX) ? 0 : 1));
        });
        for (i = 0; i < heroCount; i++)
        {
            generationHeroes.push( list[i].car);
        }


               

        endGeneration()
        nextGeneration()
    }


    // set the hero of the population
    // need to find an initial alive car to use to compare
    var hero = carArray[0];
    for (i = 0; i < poolSize; i++) {
        if (carHealth[i] > 0) {
            hero = carArray[i];
            break;
        }
    }
    // determine population hero
    for (i = 0; i < poolSize; i++) {
        if ((carArray[i].bodies[0].bounds.max.x > hero.bodies[0].bounds.max.x) && (carHealth[i] > 0)) {
            hero = carArray[i]
        }
        if ((maxXArray[i] < carArray[i].bodies[0].bounds.max.x) && (carHealth[i] > 0)) {
            maxXArray[i] = carArray[i].bodies[0].bounds.max.x;
        }

    }

    // smooth camera switching between cars    
    diffx = (render.bounds.min.x - hero.bodies[0].bounds.min.x + 800) / 20
    render.bounds.min.x -= diffx;
    render.bounds.max.x -= diffx;
    diffy = (render.bounds.min.y - hero.bodies[0].bounds.min.y + 400) / 20
    render.bounds.min.y -= diffy
    render.bounds.max.y -= diffy

    // Update Mouse constraint and bounds
    Mouse.setScale(mouseConstraint.mouse, { x: 2, y: 2 });
    Mouse.setOffset(mouseConstraint.mouse, render.bounds.min);

    // draw the minimap and health display
    Minimap(hero);
    DisplayHealth();
})();
