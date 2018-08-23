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
  ENTITIES: [
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
    this.entityStyles = {};  //Visual style of entities. Derived when entities are spawned.
    
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
    if (this.currentTick === 0) {
      const event = round.events[this.currentRoundEvent];
      if (event) {
        switch (event.type) {
          case "spawn":
            const entityId = event.entity;
            this.registerEntityStyle(entityId);
            
            //Add the entity to the list of current entities.
            this.entities[entityId] = {
              id: entityId,
              coord: {
                x: event.at.x,
                y: event.at.y,
              },
            };
            break;
        }
      }
    }
    
    //PAINT PAINT PAINT!
    this.paint(round, round.events[this.currentRoundEvent]);
    
    //Take the next step
    this.currentTick++;
    if (this.currentTick >= App.TICKS_PER_EVENT) {  //If we've done all the ticks for this event, go to the next event.
      this.currentTick = 0;
      this.currentRoundEvent++;
      if (this.currentRoundEvent >= round.events.length) {  //If we've done all the events for this round, go to the next round.
        this.currentRoundEvent = 0;
        this.currentRound++;
      }
    }
  }
  
  paint(round, event) {
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
      //If an entity will be animated later (e.g. in an event), don't draw them
      //at this stage.
      const willEntityBeAnimatedLater = event
        && event.entity === entity.id
        && (event.type === "spawn" || event.type === "move");
      if (willEntityBeAnimatedLater) return;
      
      const midX = (entity.coord.x + 0.5) * App.TILE_SIZE;
      const midY = (entity.coord.y + 0.5) * App.TILE_SIZE;
      
      this.paintEntity(entity.id, midX, midY, "idle");
    });
    
    //If there's an event, animate it.
    const tweenPercent = this.currentTick / App.TICKS_PER_EVENT;
    if (event) {
      let entityId = event.entity;
      let midX = 0;
      let midY = 0;
      let radius = 1;
      let entityStyle = COLOURS.MISSING;
      
      switch (event.type) {
          
        //Event: player spawns.
        //Animation: expanding circle.
        case "spawn":
          midX = (event.at.x + 0.5) * App.TILE_SIZE;
          midY = (event.at.y + 0.5) * App.TILE_SIZE;
          radius = Math.max(App.TILE_SIZE / 2 * tweenPercent, 1);
          entityStyle = (this.entityStyles[entityId])
            ? this.entityStyles[entityId]
            : COLOURS.MISSING;

          this.c2d.beginPath();
          this.c2d.arc(midX, midY, radius, 0, 2 * Math.PI);
          this.c2d.strokeStyle = entityStyle;
          this.c2d.stroke();
          
          break;
        
        case "move":
          midX = ((event.from.x + (event.to.x - event.from.x) * tweenPercent)
                 + 0.5) * App.TILE_SIZE;
          midY = ((event.from.y + (event.to.y - event.from.y) * tweenPercent)
                 + 0.5) * App.TILE_SIZE;          
          this.paintEntity(entityId, midX, midY, "moving");
          
        /* "type": "move",
          "entity": "0eee3f36-36d1-46e7-be9c-e74a458b4eb8",
          "from": {
            "x": 7,
            "y": 2
          },
          "to": {
            "x": 7,
            "y": 1
          }*/
        
        default:
      }
    }
  }
  
  paintEntity(entityId, midX, midY, action) {
    const radius = App.TILE_SIZE / 2;
    const entityStyle = (this.entityStyles[entityId])
      ? this.entityStyles[entityId]
      : COLOURS.MISSING;

    this.c2d.beginPath();
    this.c2d.arc(midX, midY, radius, 0, 2 * Math.PI);
    this.c2d.fillStyle = entityStyle;
    this.c2d.fill();
  }
  
  registerEntityStyle(entityId) {
    if (!this.entityStyles[entityId]) {
      this.entityStyles[entityId] = STYLES.ENTITIES[Object.values(this.entityStyles).length];
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
App.TICKS_PER_SECOND = 60;
App.TICKS_PER_EVENT = 30;
//==============================================================================

/*  Initialisations
 */
//==============================================================================
window.onload = function() {
  window.app = new App();
};
//==============================================================================
