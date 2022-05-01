
let windowWidth = 800;
let windowHeight = 800;
let cellSize = 8;

let cellArray = Array.from(Array(windowWidth), () => Array(windowHeight).fill(0));
let nScale;

function setup() {
    noStroke();
    colorMode(HSB, 100);

    btn = createButton('PLAY');
    btn.mousePressed(toggleState);
    let g = createButton('REGEN GRID');
    g.mousePressed(regen);
    nScale = createSlider(0.01, .1, .04, .01);
    createCanvas(windowWidth, windowHeight);
    for (var i = 0; i < windowWidth / cellSize; i++) {
        for (var j = 0; j < windowHeight / cellSize; j++) {
            cellArray[i][j] = new Cell(i, j);
        }
    }


}

function regen() {
    noiseSeed(Math.random() * 1000);
    Game.state = 'PAUSED';
    for (var i = 0; i < windowWidth / cellSize; i++) {
        for (var j = 0; j < windowHeight / cellSize; j++) {
            cellArray[i][j].genState();
        }
    }
}

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

let cellTypes = {
    'WET': {
        colors: ["#738054", "#a3a86d", "#e1d5b8", "#d6c7a7"],
        fire: ["#F9A42F", "#FFD728", "#FF4605", "#860112"],
    },
    'DRY': {
        color: '#be996e',
    },
    'FLAME': {
        color: '#FF0000',
    },
    'BURNING': {
        color: '#FF7034',
    },
    'BURNT': {
        color: '#606060',
    },
}




class Cell {


    constructor(x, y) {
        this.deadNeighbors = 0;
        this.aliveNeighbors = 0;
        this.burningNeighbors = 0;
        this.x = x;
        this.y = y;
        this.burnLife = Math.floor(Math.random() * 20) + 40;
        this.deadLife = Math.floor(Math.random() * 300) + 120;
        this.growthrate = Math.random() * 0.05 + 0.1;
        this.timesDead = 1;
        this.genState();
        this.growing = false;
        this.gWet = 0;

        this.regrowCount = 0;
        this.regrowTime  = 0;
    }


    genState() {
        this.burnCount = 0;       
        this.deadCount = 0;
        this.type = 'WET';
        this.wetness = this.type == 'WET' ? this.getVal() : 0;
        if(this.wetness <= 25) this.type = 'DRY';
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
        if(this.type == 'WET') {
            let i = 4 - Math.floor(this.wetness / 20);
            try {
                if(this.burningNeighbors > 1) {
                    fill(cellTypes['WET'].fire[i]);
                } else {
                    fill(cellTypes['WET'].colors[i]);                    
                }
            } catch(e) {
            }
        } else if(this.type == 'REGROW') {
            fill(cellTypes['DRY'].color);
        }else {
            fill(cellTypes[this.type].color);
        }
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
                if (x < 0 || x >= windowWidth / cellSize || y < 0 || y >= windowHeight / cellSize) {
                    continue;
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
                if(this.growing) {
                    if(this.wetness >= this.gWet) {
                        this.growing = false
                    } else {
                        this.wetness += this.growthrate;
                    }
                }
                if (this.wetness <= 15) {
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
                    this.growing = false;
                }
                if(this.growing && this.wetness < this.gWet) {
                    this.wetness += this.growthrate; 
                } else if(this.growing){
                    this.growing = false;
                }
                if(this.wetness > 25) {
                    this.type = 'WET';
                }
                break;
            case 'FLAME':
                    this.type = 'BURNING';
                    this.burnLife = Math.floor(Math.random() * 20) + 210;
                break;
            case 'BURNING':
                if(this.burnCount++ >= this.burnLife) {
                    this.deadLife = Math.floor(Math.random() * 300) + 120;
                    this.type = 'BURNT';
                    this.timesDead++;
                }
                break;
            case 'BURNT':
                if(this.deadCount++ >= this.deadLife) {
                    var r = Math.random();
                    //this.wetness = r * 100;
                    this.gWet = this.getVal();
                    this.wetness = 0;
                    this.growing = true;
                    this.regrowTime = Math.floor(Math.random() * 50) + 150;
                    this.regrowCount = 0;
                    this.type = 'REGROW';
                }
                break;
            case 'REGROW':
                if(this.regrowCount++ >= this.regrowTime) {
                    this.type = 'DRY';
                    this.burnCount = 0;       
                    this.deadCount = 0;
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

    getVal() {
        let noiseScale = nScale.value();
        let noiseVal = 1 - noise((this.x + 100 * this.timesDead)*noiseScale, (this.y + 100 * this.timesDead)*noiseScale);
        return noiseVal * 100;
    }

}

        


