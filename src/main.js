/*  
Hack Day Dungeon (Visualiser)
-----------------------------

(Shaun A. Noordin | shaunanoordin.com | 20180724)
--------------------------------------------------------------------------------
 */

import { ImageAsset, AudioAsset } from "./utility.js";


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
    
    this.assets = {
      images: {
        actors: [
          new ImageAsset("assets/avo-sprites-2018-08-actor-32-robot.png"),
        ],
      },
      audio: {
        zap: new AudioAsset("assets/zap.wav"),
        boing: new AudioAsset("assets/boing.wav"),
        wompwomp: new AudioAsset("assets/wompwomp.wav"),
      }
    };
    
    this.entities = {};
    this.entityExData = {};  //Extra data for each entity. We keep track of this
      //extra data because Marten's hackday engine doesn't provide information
      //on a number of superfluous things (e.g. each entity's colours, or their
      //facing direction - things that don't affect the game, but are important
      //for visual representation.)
    
    this.state = App.STATES.LOADING;
    this.initialiseCanvas();
    this.updateUI();
    
    //Prepare the loading message
    this.runCycle = setInterval(this.runLoadingCheck.bind(this), App.TICKS_PER_SECOND);
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
    this.runCycle = setInterval(this.runGameStep.bind(this), 1000 / App.TICKS_PER_SECOND);
    this.updateUI();
  }
  
  stop() {
    this.runCycle && clearInterval(this.runCycle);
    this.runCycle = null;
    this.updateUI();
  }
  
  updateUI() {
    if (this.state === App.STATES.LOADING) {
      this.html.consoleOut.textContent = "LOADING...\r\n";
      this.html.consoleActionStart.textContent = "-";
      this.html.consoleActionStart.disabled = true;
      this.html.consoleIn.disabled = true;
      
    } else if (this.state === App.STATES.READY) {
      
      this.html.consoleOut.textContent = "";
      this.html.consoleActionStart.disabled = false;
      if (!this.runCycle) {
        this.html.consoleActionStart.textContent = "START";
        this.html.consoleIn.disabled = false;
      } else {
        this.html.consoleActionStart.textContent = "STOP";
        this.html.consoleIn.disabled = true;
      }
      
    }
  }
  
  processConsoleIn() {
    try {
      const input = JSON.parse(this.html.consoleIn.value);
      this.rounds = input.rounds;
    } catch (err) {
      this.html.consoleOut.textContent = `ERROR:\r\n${err}\r\n`;
      this.stop();
      throw(err);
    }
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
  runLoadingCheck() {
    let assetsRequired = 0;
    let assetsLoaded = 0;
    
    //Check if each asset is loaded.
    if (this.assets) {
      if (this.assets.images && this.assets.images.actors) {
        Object.values(this.assets.images.actors).forEach(asset => {
          assetsRequired++;
          asset.loaded && assetsLoaded++;
        });
      }
      
      //Actually, let's treat audio as optional.
      //  if (this.assets.audio) {
      //    Object.values(this.assets.audio).forEach(asset => {
      //      assetsRequired++;
      //      asset.loaded && assetsLoaded++;
      //    });
      //  }
    }
    
    //All assets loaded?
    if (assetsLoaded >= assetsRequired) {
      //Change state: READY!
      this.state = App.STATES.READY;
      clearInterval(this.runCycle);
      this.runCycle = null;
      this.updateUI();
      
      //Convenience: focus on the Start/Stop button, and kick things off.
      this.html.consoleActionStart.click();
      this.html.consoleActionStart.focus();
    }
  }
  
  runGameStep() {
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
            this.registerEntity(entityId);
            
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
    
    //Play sounds
    if (this.currentTick === 0) {
      if (event) {
        switch (event.type) {
          case "spawn":
            this.assets.audio.boing.stop();
            this.assets.audio.boing.play();
            break;
          case "death":
            this.assets.audio.wompwomp.stop();
            this.assets.audio.wompwomp.play();
            break;
          case "ranged":
            this.assets.audio.zap.stop();
            this.assets.audio.zap.play();
            break;
        }
      }
    }
    
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
    this.entityExData = {};
  }
  
  registerEntity(entityId) {
    if (!this.entityExData[entityId]) {
      this.entityExData[entityId] = {
        colour: App.STYLES.ENTITIES.COLOURS[Object.values(this.entityExData).length],
        direction: App.DIRECTIONS.SOUTH,
        imageAsset: this.assets.images.actors[0],
        spriteTileSize: 32,
        spriteOffset: {
          x: 0,
          y: -4,
        },
        displayedX: -10 * App.TILE_SIZE,  //Hide the entity off-screen until the it's established by its firt paintEntity().
        displayedY: -10 * App.TILE_SIZE,
      };
    }
  }
  
  guessEntityDirection(xDist, yDist) {
    if (xDist !== 0 || yDist !== 0) {
      const rotationDeg = Math.atan2(yDist, xDist) * 180 / Math.PI;
      if (-45 <= rotationDeg && rotationDeg <= 45) return App.DIRECTIONS.EAST;
      if (45 < rotationDeg && rotationDeg < 135) return App.DIRECTIONS.SOUTH;
      if (135 <= rotationDeg || rotationDeg <= -135) return App.DIRECTIONS.WEST;
      if (-135 < rotationDeg && rotationDeg < -45) return App.DIRECTIONS.NORTH;
    }
    return App.DIRECTIONS.SOUTH;  //Default direction
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
    const tweenPercent = this.currentTick / App.TICKS_PER_EVENT;
    this.c2d.clearRect(0, 0, w, h);  //Clear the canvas before drawing.
    
    //Draw the grid
    //--------------------------------
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
    //--------------------------------
    
    //For each entity, draw the character.
    //--------------------------------
    const orderedEntities = Object.values(this.entities).sort((entityA, entityB) => {
      const yA = (entityA.coord && entityA.coord.y) ? entityA.coord.y : 0;
      const yB = (entityB.coord && entityB.coord.y) ? entityB.coord.y : 0;
      return yA - yB;
    });
    
    orderedEntities.forEach(entity => {
      //If an entity will be animated later (e.g. in an event), don't draw them
      //at this stage.
      const willEntityBeAnimatedLater = event
        && event.entity === entity.id
        && (event.type === "spawn" || event.type === "move" || event.type === "death" || event.type === "ranged");
      if (willEntityBeAnimatedLater) return;
      
      const midX = (entity.coord.x + this.map.margin + 0.5) * App.TILE_SIZE;
      const midY = (entity.coord.y + this.map.margin + 0.5) * App.TILE_SIZE;
      
      if (entity.health > 0) {
        this.paintEntity(entity, midX, midY, "idle");
      } else {
        this.paintEntity(entity, midX, midY, "dead");
      }
    });
    //--------------------------------
    
    //If there's an event, animate it.
    //--------------------------------
    if (event) {
      let entityId = event.entity;
      let entity = this.entities[entityId];
      let exdata = this.entityExData[entityId];
      let midX = 0, midY = 0;
      let xDist, yDist;
      let radius = 1;
      let entityColour = App.STYLES.UNKNOWN;
      
      switch (event.type) {
          
        //Event: player spawns.
        //Animation: expanding circle.
        case "spawn":
          midX = (event.at.x + this.map.margin + 0.5) * App.TILE_SIZE;
          midY = (event.at.y + this.map.margin + 0.5) * App.TILE_SIZE;
          radius = Math.max(App.TILE_SIZE / 2 * tweenPercent, 1);
          entityColour = (this.entityExData[entityId])
            ? this.entityExData[entityId].colour
            : App.STYLES.UNKNOWN;

          this.c2d.beginPath();
          this.c2d.arc(midX, midY, radius, 0, 2 * Math.PI);
          this.c2d.lineWidth = App.STYLES.ENTITIES.SPAWN_LINEWIDTH;
          this.c2d.strokeStyle = entityColour;
          this.c2d.stroke();
          
          break;
          
        //Event: player is KOed.
        //Animation: collapsing circle.
        case "death":
          midX = (entity.coord.x + this.map.margin + 0.5) * App.TILE_SIZE;
          midY = (entity.coord.y + this.map.margin + 0.5) * App.TILE_SIZE;
          radius = Math.max(App.TILE_SIZE / 2 * (1 - tweenPercent), 1);
          entityColour = (this.entityExData[entityId])
            ? this.entityExData[entityId].colour
            : App.STYLES.UNKNOWN;

          this.c2d.beginPath();
          this.c2d.arc(midX, midY, radius, 0, 2 * Math.PI);
          this.c2d.lineWidth = App.STYLES.ENTITIES.SPAWN_LINEWIDTH;
          this.c2d.strokeStyle = entityColour;
          this.c2d.stroke();
          
          break;
        
        //Event: player moves to a new location.
        case "move":
          if (!entity) break;
          
          //Guess the direction the entity is moving and record it in the exdata.
          xDist = event.to.x - event.from.x;
          yDist = event.to.y - event.from.y;
          exdata && (exdata.direction = this.guessEntityDirection(xDist, yDist));
          
          midX = (event.from.x + xDist * tweenPercent + this.map.margin + 0.5)
                 * App.TILE_SIZE;
          midY = (event.from.y + yDist * tweenPercent + this.map.margin + 0.5)
                 * App.TILE_SIZE;
          this.paintEntity(entity, midX, midY, "moving", tweenPercent);
          
          break;
        
        case "ranged":
          if (!entity) break;
          midX = (entity.coord.x + this.map.margin + 0.5) * App.TILE_SIZE;
          midY = (entity.coord.y + this.map.margin + 0.5) * App.TILE_SIZE;
          
          
          //Guess the direction the entity is shooting and record it in the exdata.
          xDist = 0; yDist = 0;
          event.coords.forEach(projectile => {
            xDist += projectile.x - entity.coord.x;
            yDist += projectile.y - entity.coord.y;
          });
          xDist = (event.coords.length > 0) ? xDist / event.coords.length : 0;
          yDist = (event.coords.length > 0) ? yDist / event.coords.length : 0;
          exdata && (exdata.direction = this.guessEntityDirection(xDist, yDist));
          
          //Paint the entity doing the shooting.
          this.paintEntity(entity, midX, midY, "shooting", tweenPercent);
          
          //Paint each projectile.
          event.coords.forEach(projectile => {
            midX = ((entity.coord.x + (projectile.x - entity.coord.x) * tweenPercent)
                   + this.map.margin + 0.5) * App.TILE_SIZE;
            midY = ((entity.coord.y + (projectile.y - entity.coord.y) * tweenPercent)
                   + this.map.margin + 0.5) * App.TILE_SIZE;
            this.paintProjectile(entity, midX, midY, tweenPercent);
          });
          
          break;
        
        default:
          break;
      }
      //--------------------------------
      
      //Now animate some widgets (extra UI stuff such as the HP of each)
      //--------------------------------
      Object.values(this.entities).forEach(entity => {
        this.paintWidget_entityHealth(entity);
      });
      //--------------------------------
    }
  }
  
  paintEntity(entity, midX, midY, action = "idle", tweenPercent = 0) {
    if (!entity) return;
    const exdata = this.entityExData[entity.id];
    if (!exdata) return;
    
    const radius = App.TILE_SIZE * 0.5;
    this.c2d.beginPath();
    this.c2d.arc(midX, midY, radius, 0, 2 * Math.PI);

    //Paint the coloured "shadow"
    if (action === "idle" || action === "moving" || action === "shooting") {
      this.c2d.fillStyle = exdata.colour;
    } else if (action === "dead") {
      this.c2d.fillStyle = App.STYLES.ENTITIES.DEAD_COLOUR;
    } else {
      this.c2d.fillStyle = App.STYLES.UNKNOWN;
    }
    this.c2d.fill();
    
    //DEBUG: Paint an additional direction arrow.
    /*
    this.c2d.beginPath()
    this.c2d.moveTo(midX, midY);
    switch (exdata.direction) {
      case App.DIRECTIONS.EAST:
        this.c2d.lineTo(midX + radius, midY);
        break;
      case App.DIRECTIONS.SOUTH:
        this.c2d.lineTo(midX, midY + radius);
        break;
      case App.DIRECTIONS.WEST:
        this.c2d.lineTo(midX - radius, midY);
        break;
      case App.DIRECTIONS.NORTH:
        this.c2d.lineTo(midX, midY - radius);
        break;
    }
    this.c2d.lineWidth = App.STYLES.VFX.ENTITY_ARROW_SIZE;
    this.c2d.strokeStyle = App.STYLES.VFX.ENTITY_ARROW_COLOUR;
    this.c2d.stroke();
    */
    
    //Paint the sprite
    if (entity.health > 0) {
      let sx = exdata.direction * exdata.spriteTileSize;
      let sy = 0;
      if (action === "moving") {  //Animation script: moving/running
        sy = 1 * exdata.spriteTileSize;
        (tweenPercent >= 0.1) && (sy = 2 * exdata.spriteTileSize);
        (tweenPercent >= 0.4) && (sy = 1 * exdata.spriteTileSize);
        (tweenPercent >= 0.6) && (sy = 3 * exdata.spriteTileSize);
        (tweenPercent >= 0.9) && (sy = 1 * exdata.spriteTileSize);
      }
      const sw = exdata.spriteTileSize, sh = exdata.spriteTileSize;
      const dx = Math.floor(midX - sw / 2) + exdata.spriteOffset.x;
      const dy = Math.floor(midY - sh / 2) + exdata.spriteOffset.y;
      const dw = App.TILE_SIZE, dh = App.TILE_SIZE;
      this.c2d.drawImage(
        exdata.imageAsset.img,
        sx, sy, sw, sh,
        dx, dy, dw, dh
      );
    }
    
    //Update the entity's extra data.
    if (this.entityExData[entity.id]) {
      this.entityExData[entity.id].displayedX = midX;
      this.entityExData[entity.id].displayedY = midY;
    }
  }
  
  paintProjectile(entity, midX, midY, tweenPercent = 0) {
    if (!entity) return;
    const exdata = this.entityExData[entity.id];
    if (!exdata) return;
    
    let outerRadius = App.TILE_SIZE * 0.25;
    (tweenPercent >= 0.1) && (outerRadius = App.TILE_SIZE * 0.23);
    (tweenPercent >= 0.3) && (outerRadius = App.TILE_SIZE * 0.21);
    (tweenPercent >= 0.5) && (outerRadius = App.TILE_SIZE * 0.23);
    (tweenPercent >= 0.9) && (outerRadius = App.TILE_SIZE * 0.25);
    
    let innerRadius = App.TILE_SIZE * 0.15;
    (tweenPercent >= 0.1) && (innerRadius = App.TILE_SIZE * 0.17);
    (tweenPercent >= 0.3) && (innerRadius = App.TILE_SIZE * 0.19);
    (tweenPercent >= 0.5) && (innerRadius = App.TILE_SIZE * 0.17);
    (tweenPercent >= 0.9) && (innerRadius = App.TILE_SIZE * 0.15);
    
    this.c2d.beginPath();
    this.c2d.arc(midX, midY, outerRadius, 0, 2 * Math.PI);
    this.c2d.fillStyle = exdata.colour;
    this.c2d.fill();
    
    this.c2d.beginPath();
    this.c2d.arc(midX, midY, innerRadius, 0, 2 * Math.PI);
    this.c2d.fillStyle = App.STYLES.VFX.PROJECTILE_INNER_COLOUR;
    this.c2d.fill();
  }
  
  paintWidget_entityHealth(entity) {
    if (!entity) return;
    const exdata = this.entityExData[entity.id];
    if (!exdata) return;
    
    const health = entity.health;
    
    //Draw the black body (which acts as the "empty" part of the health bar)
    //--------------------------------
    this.c2d.beginPath();
    this.c2d.rect(
      exdata.displayedX - App.STYLES.WIDGET.HEALTH_BAR.BODY_WIDTH / 2,
      exdata.displayedY + App.TILE_SIZE / 2,
      App.STYLES.WIDGET.HEALTH_BAR.BODY_WIDTH,
      App.STYLES.WIDGET.HEALTH_BAR.BODY_HEIGHT
    );
    this.c2d.fillStyle = App.STYLES.WIDGET.HEALTH_BAR.BODY_COLOUR;
    this.c2d.fill();
    //--------------------------------
    
    //Draw the coloured bar (which acts as the "filled" part of the health bar)
    //--------------------------------
    const healthBar = Math.max(Math.min(health / App.MAX_ENTITY_HEALTH, 100), 0) * App.STYLES.WIDGET.HEALTH_BAR.BODY_WIDTH;
    this.c2d.beginPath();
    this.c2d.rect(
      exdata.displayedX - healthBar / 2,
      exdata.displayedY + App.TILE_SIZE / 2,
      healthBar,
      App.STYLES.WIDGET.HEALTH_BAR.BODY_HEIGHT
    );
    this.c2d.fillStyle = (this.entityExData[entity.id])
      ? this.entityExData[entity.id].colour
      : App.STYLES.UNKNOWN;;
    this.c2d.fill();
    //--------------------------------
    
    //Draw the surrounding frame
    //--------------------------------
    this.c2d.beginPath();
    this.c2d.rect(
      exdata.displayedX - App.STYLES.WIDGET.HEALTH_BAR.BODY_WIDTH / 2,
      exdata.displayedY + App.TILE_SIZE/2,
      App.STYLES.WIDGET.HEALTH_BAR.BODY_WIDTH,
      App.STYLES.WIDGET.HEALTH_BAR.BODY_HEIGHT
    );
    this.c2d.lineWidth = App.STYLES.WIDGET.HEALTH_BAR.FRAME_SIZE;
    this.c2d.strokeStyle = App.STYLES.WIDGET.HEALTH_BAR.FRAME_COLOUR;
    this.c2d.stroke();
    //--------------------------------
    
    //Draw the health bar text, centred below the actual health bar
    //--------------------------------
    if (health > 0) {
      this.c2d.font = App.STYLES.WIDGET.HEALTH_BAR.FONT;
      this.c2d.textAlign = "center";
      this.c2d.textBaseline = "hanging";
      const textVerticalOffset = App.STYLES.WIDGET.HEALTH_BAR.BODY_HEIGHT + 2 * App.STYLES.WIDGET.HEALTH_BAR.FRAME_SIZE;
      //----------------
      this.c2d.lineWidth = App.STYLES.WIDGET.HEALTH_BAR.FRAME_SIZE * 2;  //Text outline
      this.c2d.strokeStyle = App.STYLES.WIDGET.HEALTH_BAR.FRAME_COLOUR;
      this.c2d.strokeText(
        health,
        exdata.displayedX,
        exdata.displayedY + App.TILE_SIZE / 2 + textVerticalOffset
      );
      //----------------
      this.c2d.fillStyle = (this.entityExData[entity.id])
        ? this.entityExData[entity.id].colour
        : App.STYLES.UNKNOWN;
      this.c2d.fillText(
        health,
        exdata.displayedX,
        exdata.displayedY + App.TILE_SIZE / 2 + textVerticalOffset
      );
    }
    //--------------------------------
  }
  /*
  ----------------------------------------------------------------
   */
}
//==============================================================================

/*  Constants
 */
//==============================================================================
App.STATES = {
  LOADING: 'loading',
  READY: 'ready',
};
App.TILE_SIZE = 32;  //Each tile is 32x32 pixels
App.TICKS_PER_SECOND = 60;
App.TICKS_PER_EVENT = 30;
App.MAX_ENTITY_HEALTH = 100;
App.DISPLAYED_HEALTH_CHANGE_RATE = 10;
App.DIRECTIONS = {
  EAST: 0,
  SOUTH: 1,
  WEST: 2,
  NORTH: 3,
};

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
  VFX: {
    PROJECTILE_INNER_COLOUR: '#fff',
    ENTITY_ARROW_SIZE: 4,
    ENTITY_ARROW_COLOUR: '#fff',
  },
  WIDGET: {
    HEALTH_BAR: {
      FONT: '8px Arial, sans-serif',
      FRAME_COLOUR: '#fff',
      FRAME_SIZE: 2,
      BODY_COLOUR: '#333',
      BODY_WIDTH: 24,
      BODY_HEIGHT: 4,
    },
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
