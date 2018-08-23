/*  
Hack Day Dungeon (Visualiser)
-----------------------------

(Shaun A. Noordin | shaunanoordin.com | 20180724)
 */

const COLOURS = {
  GREY: '#999',
  MISSING: '#639',
};

const STYLES = {
  GRID_STROKE: '#ccc',
  ENTITIES_FILL: [
    '#c33',
    '#39c',
    '#fc3',
    '#396',
    '#c9f',
  ],
};

/*  Primary App Class
 */
//==============================================================================
class App {
  constructor() {
    this.html = {
      canvas: document.getElementById("canvas"),
      consoleIn: document.getElementById("console-in"),
      consoleOut: document.getElementById("console-out"),
      consoleRun: document.getElementById("console-run"),
    };
    this.c2d = this.html.canvas.getContext("2d");
    this.runCycle = null;
    
    this.html.consoleRun.onclick = this.consoleRun_onClick.bind(this);
    
    this.map = {
      width: 1,
      height: 1,
    };
    
    this.entities = {};
    this.entityStyles = {};  //Visual style of entities. Derived randomly.
    
    this.initialiseCanvas();
    this.updateUI_consoleRun();
    
    this.rounds = [];
    this.roundEvents = [];
    
    this.currentRound = 0;
    this.currentRoundEvent = 0;
    this.currentTick = 0;  //Animation step.
  }
  
  start() {
    this.currentRound = 0;
    this.currentRoundEvent = 0;
    this.currentTick = 0;
    
    this.processConsoleIn();
    this.runCycle && clearInterval(this.runCycle);
    this.runCycle = setInterval(this.runStep.bind(this), 1000 / App.TICKS_PER_SECOND);
    this.updateUI_consoleRun();
  }
  
  stop() {
    this.runCycle && clearInterval(this.runCycle);
    this.runCycle = undefined;
    this.updateUI_consoleRun();
  }
  
  updateUI_consoleRun() {
    if (!this.runCycle) {
      this.html.consoleRun.textContent = "START";
    } else {
      this.html.consoleRun.textContent = "STOP";
    }
  }
  
  runStep() {
    console.log('+++ r/e/t ' + this.currentRound + '/' + this.currentRoundEvent + '/' + this.currentTick);
    
    //Get the current round.
    const round = this.rounds[this.currentRound];
    if (!round) { this.stop(); return; }  //If we're out of rounds, the game is over.
    
    //If this is the very start of the game, initialise the game.
    if (this.currentRound === 0
        && this.currentRoundEvent === 0
        && this.currentTick === 0) {
      this.initialiseGame(round);
    }
    
    //If this is the very start of the round, initialise it.
    if (this.currentRoundEvent === 0
        && this.currentTick === 0) {
      this.entities = round.initial_world.entities;
    }
    
    //If this is the very start of an event... do something?
    if (this.currentTick === 0) {}
    
    //PAINT PAINT PAINT!
    this.paint();
    
    //Take the next step
    this.currentTick++;
    if (this.currentTick >= App.TICKS_PER_EVENT) {
      this.currentTick = 0;
      
      this.currentRoundEvent++;      
      if (this.currentRoundEvent >= round.events.length) {
        this.currentRoundEvent = 0;
        
        this.currentRound++;
      }
    }
    
    //this.currentRound++;
  }
  
  paint() {
    const w = this.map.width * App.TILE_SIZE;
    const h = this.map.height * App.TILE_SIZE;
    this.c2d.clearRect(0, 0, w, h);
    
    //Draw the grid
    this.c2d.beginPath();
    for (let col = 0; col < this.map.width; col++) {
      for (let row = 0; row < this.map.height; row++) {
        this.c2d.rect(
          col * App.TILE_SIZE, row * App.TILE_SIZE,
          App.TILE_SIZE, App.TILE_SIZE
        );
      }
    }
    this.c2d.strokeStyle = STYLES.GRID_STROKE;
    this.c2d.stroke();
    
    //For each entity, draw the character.
    Object.values(this.entities).forEach(entity => {
      //TODO: move this to the "spawn" event
      this.registerEntityStyle(entity);
      
      const midX = (entity.coord.x + 0.5) * App.TILE_SIZE;
      const midY = (entity.coord.y + 0.5) * App.TILE_SIZE;
      const radius = App.TILE_SIZE / 2;
      const entityStyle = (this.entityStyles[entity.id])
        ? this.entityStyles[entity.id]
        : COLOURS.MISSING;
      
      this.c2d.beginPath();
      this.c2d.arc(midX, midY, radius, 0, 2 * Math.PI);
      this.c2d.fillStyle = entityStyle;
      this.c2d.fill();
    });
  }
  
  registerEntityStyle(entity) {
    if (!this.entityStyles[entity.id]) {
      this.entityStyles[entity.id] = STYLES.ENTITIES_FILL[Object.values(this.entityStyles).length];
    }
  }
  
  initialiseCanvas() {
    this.html.canvas.width = this.map.width * App.TILE_SIZE;
    this.html.canvas.height = this.map.height * App.TILE_SIZE;
    
    //Account for graphical settings
    this.c2d.mozImageSmoothingEnabled = false;
    this.c2d.msImageSmoothingEnabled = false;
    this.c2d.imageSmoothingEnabled = false;
  }
  
  initialiseGame(firstRound) {
    this.map.width = firstRound.initial_world.width;
    this.map.height = firstRound.initial_world.height;
    this.html.canvas.width = this.map.width * App.TILE_SIZE;
    this.html.canvas.height = this.map.height * App.TILE_SIZE;
  }
  
  processConsoleIn() {
    const input = JSON.parse(this.html.consoleIn.value);
    this.rounds = input.rounds;
  }

  consoleRun_onClick() {
    if (this.runCycle) { this.stop(); }
    else { this.start(); }
  }
}
//==============================================================================

/*  Constants
 */
//==============================================================================
App.TILE_SIZE = 32;  //Each tile is 32x32 pixels
App.TICKS_PER_SECOND = 2;
App.TICKS_PER_EVENT = 2;
//==============================================================================

/*  Initialisations
 */
//==============================================================================
window.onload = function() {
  window.app = new App();
};
//==============================================================================
