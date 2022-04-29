
let windowWidth = 800;
let windowHeight = 800;
let cellSize =8;

let cellArray = Array.from(Array(windowWidth), () => Array(windowHeight).fill(0));

function setup() {
    createCanvas(windowWidth, windowHeight);
    for (var i = 0; i < windowWidth / cellSize; i++) {
        for (var j = 0; j < windowHeight / cellSize; j++) {
            console.log(i, j)
            cellArray[i][j] = new Cell(i, j);
        }
    }
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







let cellTypes = {
    'WET': {
        color: '#00FF00',
        probability: 0.45,
    },
    'DRY': {
        //brown
        color: '#918151',
        probability: 0.40,
    },
    'FLAME': {
        color: '#FF0000',
        probability: 0.10,
    },
    'BURNING': {
        color: '#FF7034',
        probability: 0.00,
    },
    'BURNT': {
        color: '#606060',
        probability: 0.05,
    }
}




class Cell {


    constructor(x, y) {
        this.deadNeighbors = 0;
        this.aliveNeighbors = 0;
        this.burningNeighbors = 0;
        this.x = x;
        this.y = y;
        this.type = this.genType();
        this.burnCount = 0;
        this.burnLife = Math.floor(Math.random() * 4) + 6;

        this.deadCount = 0;
        this.deadLife = Math.floor(Math.random() * 4) + 6;
    }


    update() {
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
                var x;
                var y;
                if(this.x == 0 && i == -1) {
                    x = windowWidth - 1;
                } else if(this.x == windowWidth && i == 1) {
                    x = 0;
                } else {
                    x = this.x + i;
                }
                if(this.y == 0 && j == -1) {
                    y = windowHeight - 1;
                } else if(this.y == windowHeight && j == 1) {
                    y = 0;
                } else {
                    y = this.y + j;
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
                if (this.burningNeighbors > 4) {
                    this.type = 'FLAME';
                }
                break
            case 'DRY':
                var r = Math.random();
                if (this.burningNeighbors >= 3) {
                    if(r < .5) this.type = 'FLAME';
                } else {
                    if(r < .01) this.type = 'FLAME';
                }
                break;
            case 'FLAME':
                    this.type = 'BURNING';
                    this.burnLife = Math.floor(Math.random() * 20) + 20;
                break;
            case 'BURNING':
                // if(this.burnCount++ >= this.burnLife) {
                //     this.deadLife = Math.floor(Math.random() * 10) + 15;
                //     this.type = 'BURNT';
                // }
                break;
            case 'BURNT':
                if(this.deadCount++ == this.deadLife) {
                    var r = Math.random();
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

        

