/*  
Hack Day Dungeon (Visualiser)
-----------------------------

(Shaun A. Noordin | shaunanoordin.com | 20180724)
 */

/*  Primary App Class
 */
//==============================================================================
class App {
  /*
  System and Initialisations
  ----------------------------------------------------------------
   */
  constructor() {
    this.html = {
      canvas: document.getElementById("canvas"),
      consoleIn: document.getElementById("console-in"),
      consoleOut: document.getElementById("console-out"),
      consoleActionStart: document.getElementById("console-action-start"),
    };
    this.c2d = this.html.canvas.getContext("2d");
    this.runCycle = null;
    
    this.html.consoleActionStart.onclick = this.consoleActionStart_onClick.bind(this);
    
    this.rounds = [];
    this.currentRound = 0;
    this.currentRoundEvent = 0;
    this.currentTick = 0;  //Animation step.
    
    this.map = {
      width: 1,
      height: 1,
      margin: 1,
    };
    
    this.entities = {};
    this.entityStyles = {};  //Visual style of entities. Derived when entities are spawned.
    
    this.initialiseCanvas();
    this.updateUI_consoleActionStart();
    
    //Convenience: after a short delay, focus on the Start/Stop button.
    this.html.consoleActionStart
    && setTimeout(() => this.html.consoleActionStart.focus(), 500);
  }
  /*
  ----------------------------------------------------------------
   */
  
  /*
  User Controls
  ----------------------------------------------------------------
   */
  start() {
    this.currentRound = 0;
    this.currentRoundEvent = 0;
    this.currentTick = 0;
    
    this.processConsoleIn();
    this.runCycle && clearInterval(this.runCycle);
    this.runCycle = setInterval(this.runStep.bind(this), 1000 / App.TICKS_PER_SECOND);
    this.updateUI_consoleActionStart();
  }
  
  stop() {
    this.runCycle && clearInterval(this.runCycle);
    this.runCycle = undefined;
    this.updateUI_consoleActionStart();
  }
  
  updateUI_consoleActionStart() {
    if (!this.runCycle) {
      this.html.consoleActionStart.textContent = "START";
    } else {
      this.html.consoleActionStart.textContent = "STOP";
    }
  }
  
  processConsoleIn() {
    const input = JSON.parse(this.html.consoleIn.value);
    this.rounds = input.rounds;
  }

  consoleActionStart_onClick() {
    if (this.runCycle) { this.stop(); }
    else { this.start(); }
  }
  
  initialiseCanvas() {
    //Set the starting canvas size; it'll be overwritten in initialiseGame()
    this.html.canvas.width = this.map.width * App.TILE_SIZE;
    this.html.canvas.height = this.map.height * App.TILE_SIZE;
    
    //Account for graphical settings.
    //Remove smoothing so we can scale up the canvas and still have the sharp
    //edges of pixel art.
    this.c2d.mozImageSmoothingEnabled = false;
    this.c2d.msImageSmoothingEnabled = false;
    this.c2d.imageSmoothingEnabled = false;
  }
  /*
  ----------------------------------------------------------------
   */
  
  /*
  Game Logic
  ----------------------------------------------------------------
   */  
  runStep() {
    //Get the current round.
    const round = this.rounds[this.currentRound];
    if (!round) { this.stop(); return; }  //If we're out of rounds, the game is over.
    const event = round.events[this.currentRoundEvent];
    
    this.html.consoleOut.textContent = `Round ${this.currentRound+1}\r\n`;
    if (event) {
      this.html.consoleOut.textContent += `Event ${this.currentRoundEvent+1} - ${event.type} \n`;
    }
    
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
      
      if (event) {
        switch (event.type) {
          case "spawn":
            const entityId = event.entity;
            this.registerEntityStyle(entityId);
            
            //Add the entity to the list of current entities.
            this.entities[entityId] = {  //DEFAULT ENTITY
              id: entityId,
              coord: {
                x: event.at.x,
                y: event.at.y,
              },
              health: App.MAX_ENTITY_HEALTH,
              ducked: false,
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
  
  initialiseGame(firstRound) {
    this.map.width = firstRound.initial_world.width;
    this.map.height = firstRound.initial_world.height;
    this.html.canvas.width = (this.map.width + 2 * this.map.margin) * App.TILE_SIZE;
    this.html.canvas.height = (this.map.height + 2 * this.map.margin) * App.TILE_SIZE;
    this.entities = {};
    this.entityStyles = {};
  }
  /*
  ----------------------------------------------------------------
   */
  
  /*
  Animation
  ----------------------------------------------------------------
   */
  paint(round, event) {
    const w = this.map.width * App.TILE_SIZE;
    const h = this.map.height * App.TILE_SIZE;
    this.c2d.clearRect(0, 0, w, h);
    
    //Draw the grid
    this.c2d.beginPath();
    for (let col = 0; col < this.map.width; col++) {
      for (let row = 0; row < this.map.height; row++) {
        this.c2d.rect(
          (col + this.map.margin) * App.TILE_SIZE,
          (row + this.map.margin) * App.TILE_SIZE,
          App.TILE_SIZE, App.TILE_SIZE
        );
      }
    }
    this.c2d.lineWidth = App.STYLES.GRID.LINEWIDTH;
    this.c2d.strokeStyle = App.STYLES.GRID.COLOUR;
    this.c2d.stroke();
    
    //For each entity, draw the character.
    Object.values(this.entities).forEach(entity => {
      //If an entity will be animated later (e.g. in an event), don't draw them
      //at this stage.
      const willEntityBeAnimatedLater = event
        && event.entity === entity.id
        && (event.type === "spawn" || event.type === "move" || event.type === "death");
      if (willEntityBeAnimatedLater) return;
      
      const midX = (entity.coord.x + this.map.margin + 0.5) * App.TILE_SIZE;
      const midY = (entity.coord.y + this.map.margin + 0.5) * App.TILE_SIZE;
      
      if (entity.health > 0) {
        this.paintEntity(entity, midX, midY, "idle");
      } else {
        this.paintEntity(entity, midX, midY, "dead");
      }
    });
    
    //If there's an event, animate it.
    const tweenPercent = this.currentTick / App.TICKS_PER_EVENT;
    if (event) {
      let entityId = event.entity;
      let entity = this.entities[entityId];
      let midX = 0, midY = 0;
      let radius = 1;
      let entityStyle = App.STYLES.UNKNOWN;
      
      switch (event.type) {
          
        //Event: player spawns.
        //Animation: expanding circle.
        case "spawn":
          midX = (event.at.x + this.map.margin + 0.5) * App.TILE_SIZE;
          midY = (event.at.y + this.map.margin + 0.5) * App.TILE_SIZE;
          radius = Math.max(App.TILE_SIZE / 2 * tweenPercent, 1);
          entityStyle = (this.entityStyles[entityId])
            ? this.entityStyles[entityId]
            : App.STYLES.UNKNOWN;

          this.c2d.beginPath();
          this.c2d.arc(midX, midY, radius, 0, 2 * Math.PI);
          this.c2d.lineWidth = App.STYLES.ENTITIES.SPAWN_LINEWIDTH;
          this.c2d.strokeStyle = entityStyle;
          this.c2d.stroke();
          
          break;
          
        //Event: player is KOed.
        //Animation: collapsing circle.
        case "death":
          midX = (entity.coord.x + this.map.margin + 0.5) * App.TILE_SIZE;
          midY = (entity.coord.y + this.map.margin + 0.5) * App.TILE_SIZE;
          radius = Math.max(App.TILE_SIZE / 2 * (1 - tweenPercent), 1);
          entityStyle = (this.entityStyles[entityId])
            ? this.entityStyles[entityId]
            : App.STYLES.UNKNOWN;

          this.c2d.beginPath();
          this.c2d.arc(midX, midY, radius, 0, 2 * Math.PI);
          this.c2d.lineWidth = App.STYLES.ENTITIES.SPAWN_LINEWIDTH;
          this.c2d.strokeStyle = entityStyle;
          this.c2d.stroke();
          
          break;
        
        //Event: player moves to a new location.
        case "move":
          if (!entity) break;
          
          midX = ((event.from.x + (event.to.x - event.from.x) * tweenPercent)
                 + this.map.margin + 0.5) * App.TILE_SIZE;
          midY = ((event.from.y + (event.to.y - event.from.y) * tweenPercent)
                 + this.map.margin + 0.5) * App.TILE_SIZE;
          this.paintEntity(entity, midX, midY, "moving");
          
          break;
        
        case "ranged":
          if (!entity) break;
          
          event.coords.forEach(projectile => {
            midX = ((entity.coord.x + (projectile.x - entity.coord.x) * tweenPercent)
                   + this.map.margin + 0.5) * App.TILE_SIZE;
            midY = ((entity.coord.y + (projectile.y - entity.coord.y) * tweenPercent)
                   + this.map.margin + 0.5) * App.TILE_SIZE;
            this.paintProjectile(entity, midX, midY);
          });
          
          break;
        
        default:
      }
    }
  }
  
  paintEntity(entity, midX, midY, action) {
    const radius = App.TILE_SIZE / 2;
    this.c2d.beginPath();
    this.c2d.arc(midX, midY, radius, 0, 2 * Math.PI);
    
    if (action === "idle" || action === "moving") {
      this.c2d.fillStyle = (this.entityStyles[entity.id])
        ? this.entityStyles[entity.id]
        : App.STYLES.UNKNOWN;
    } else if (action === "dead") {
      this.c2d.fillStyle = App.STYLES.ENTITIES.DEAD_COLOUR;
    } else {
      this.c2d.fillStyle = App.STYLES.UNKNOWN;
    }
    
    this.c2d.fill();
  }
  
  paintProjectile(entity, midX, midY) {
    const radius = App.TILE_SIZE / 4;
    this.c2d.beginPath();
    this.c2d.arc(midX, midY, radius, 0, 2 * Math.PI);
    this.c2d.fillStyle = (this.entityStyles[entity.id])
      ? this.entityStyles[entity.id]
      : App.STYLES.UNKNOWN;
    this.c2d.fill();
  }
  
  registerEntityStyle(entityId) {
    if (!this.entityStyles[entityId]) {
      this.entityStyles[entityId] = App.STYLES.ENTITIES.COLOURS[Object.values(this.entityStyles).length];
    }
  }
  /*
  ----------------------------------------------------------------
   */
}
//==============================================================================

/*  Constants
 */
//==============================================================================
App.TILE_SIZE = 32;  //Each tile is 32x32 pixels
App.TICKS_PER_SECOND = 60;
App.TICKS_PER_EVENT = 30;
App.MAX_ENTITY_HEALTH = 100;

App.STYLES = {
  GRID: {
    COLOUR: '#ccc',
    LINEWIDTH: 1,
  },
  ENTITIES: {
    COLOURS: [
      '#c33',
      '#39c',
      '#fc3',
      '#396',
      '#c9f',
    ],
    SPAWN_LINEWIDTH: 2,
    DEAD_COLOUR: '#ccc',
  },
  UNKNOWN: '#f0f',
};
//==============================================================================

/*  Initialisations
 */
//==============================================================================
window.onload = function() {
  window.app = new App();
};
//==============================================================================
