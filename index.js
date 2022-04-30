
let windowWidth = 800;
let windowHeight = 800;
let cellSize = 8;

let cellArray = Array.from(Array(windowWidth), () => Array(windowHeight).fill(0));
let btn;

function setup() {
    noStroke();
    colorMode(HSB, 100);
    createCanvas(windowWidth, windowHeight);
    for (var i = 0; i < windowWidth / cellSize; i++) {
        for (var j = 0; j < windowHeight / cellSize; j++) {
            console.log(i, j)
            cellArray[i][j] = new Cell(i, j);
        }
    }

    btn = createButton('PLAY');
    btn.mousePressed(toggleState);
}

var c = 0;

function draw() {
    clear();

    for (var x = 0; x < windowWidth / cellSize; x++) {
        for (var y = 0; y < windowHeight / cellSize; y++) {
            cellArray[x][y].update();
            cellArray[x][y].draw();
        }
    }
}

function mouseDragged() {
    let x = Math.floor(mouseX / cellSize);
    let y = Math.floor(mouseY / cellSize);
    if(x >= 0 && x < windowWidth / cellSize && y >= 0 && y < windowHeight / cellSize){
        cellArray[x][y].setFire();
    }
}


let Game = {
    state: 'PAUSED',
    s : ['PAUSED', 'PLAYING'],
    c : 0,
}


let toggleState = () => {
    Game.state = Game.s[++Game.c % 2];
    btn.value(Game.c % 2 == 0 ? 'PLAY' : 'PAUSE');
}

// lush to dry green colors
let colors = [
    "#00ff00",
]

let cellTypes = {
    'WET': {
        color: '#00FF00',
        probability: 0.60,
    },
    'DRY': {
        //brown
        color: '#918151',
        probability: 0.40,
    },
    'FLAME': {
        color: '#FF0000',
        probability: 0.00,
    },
    'BURNING': {
        color: '#FF7034',
        probability: 0.00,
    },
    'BURNT': {
        color: '#606060',
        probability: 0.00,
    }
}


//2d perline noise
let noise = (x, y) => {
    let scale = 0.01;
    let n = x * scale * 57 + y * scale  * 57;
    n = (n << 13) ^ n;
    return (1.0 - ((n * (n * n * 15731 + 789221) + 1376312589) & 0x7fffffff) / 1073741824.0);
}


class Cell {


    constructor(x, y) {
        this.deadNeighbors = 0;
        this.aliveNeighbors = 0;
        this.burningNeighbors = 0;
        this.x = x;
        this.y = y;
        this.wetness = Math.random() * 100; 
        this.type = this.genType();
        this.burnCount = 0;
        this.burnLife = Math.floor(Math.random() * 20) + 40;
        this.deadCount = 0;
        this.deadLife = Math.floor(Math.random() * 4) + 6;
    }


    setFire() {
        this.type = 'FLAME';
    }

    update() {
        if(Game.state == 'PAUSED') return;
        this.checkNeighbors();
        this.applyRules();
    }

    draw() {
        fill(cellTypes[this.type].color);
        rect(this.x * cellSize, this.y * cellSize, cellSize, cellSize);
    }

    checkNeighbors() {
        this.deadNeighbors = 0;
        this.aliveNeighbors = 0;
        this.burningNeighbors = 0;




        for (var i = -1; i <= 1; i++) {
            for (var j = -1; j <= 1; j++) {
                if (i == 0 && j == 0) {
                    continue;
                }

                let x = this.x + i;
                let y = this.y + j;
                if (x < 0) {
                    x = windowWidth / cellSize - 1;
                }
                if (x >= windowWidth / cellSize) {
                    x = 0;
                }
                if (y < 0) {
                    y = windowHeight / cellSize - 1;
                }
                if (y >= windowHeight / cellSize) {
                    y = 0;
                }

                switch (cellArray[x][y].type) {
                    case 'WET':
                    case 'DRY':
                        this.aliveNeighbors++;
                        break;
                    case 'FLAME':
                    case 'BURNING':
                        this.burningNeighbors++;
                        break;
                    case 'BURNT':
                        this.deadNeighbors++;
                        break;
                }
            }

        }
    }
    
    applyRules() {
        switch(this.type) {
            case 'WET':
                if (this.wetness <= 0) {
                    this.type = 'DRY';
                    break;
                }
                if (this.burningNeighbors > 4) {
                    this.wetness -= 4;
                } else if (this.burningNeighbors > 2) {
                    this.wetness -= 1.5;
                } else if(this.burningNeighbors > 0) {
                    this.wetness -= .5;
                }
                break
            case 'DRY':
                var r = Math.random();
                if (this.burningNeighbors >= 3) {
                    this.type = 'FLAME';
                }
                break;
            case 'FLAME':
                    this.type = 'BURNING';
                    this.burnLife = Math.floor(Math.random() * 20) + 210;
                break;
            case 'BURNING':
                if(this.burnCount++ >= this.burnLife) {
                    this.deadLife = Math.floor(Math.random() * 150) + 80;
                    this.type = 'BURNT';
                }
                break;
            case 'BURNT':
                if(this.deadCount++ >= this.deadLife) {
                    var r = Math.random();
                    this.wetness = r * 100;
                    this.type = r < .5 ? 'WET' : 'DRY';
                }
                break;
        }
    }


    genType() {
        let rand = Math.random();
        for (let type in cellTypes) {
            if (rand < cellTypes[type].probability) {
                return type;
            }
            rand -= cellTypes[type].probability;
        }
    }

}

        

