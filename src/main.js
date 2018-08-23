/*  
Hack Day Dungeon (Visualiser)
-----------------------------

(Shaun A. Noordin | shaunanoordin.com | 20180724)
 */

const COLOURS = {
  GREY: '#999'
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
        
    this.initialiseCanvas();
    this.updateUI_consoleRun();
    
    this.rounds = [];
    this.currentRound = 0;
    this.currentSubstep = 0;
    this.SUBSTEPS_PER_TURN
  }
  
  start() {
    this.processConsoleIn();    
    this.updateUI_consoleRun();
    this.runCycle && clearInterval(this.runCycle);
    this.runCycle = setInterval(this.runStep.bind(this), 1000 / App.TICKS_PER_SECOND);
  }
  
  stop() {
    this.runCycle && clearInterval(this.runCycle);
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
    console.log('+++ round ', this.currentRound);
    const round = this.rounds[this.currentRound];
    
    //If this is the first round, initialise eeeverything
    if (this.currentRound === 0) {
      this.initialiseGame(round);
    }
    
    
    this.paint();    
    this.currentRound++;
  }
  
  paint() {
    const w = this.map.width * App.TILE_SIZE;
    const h = this.map.height * App.TILE_SIZE;
    this.c2d.clearRect(0, 0, w, h);
    
    this.c2d.beginPath();
    for (let col = 0; col < this.map.width; col++) {
      for (let row = 0; row < this.map.height; row++) {
        this.c2d.rect(
          col * App.TILE_SIZE, row * App.TILE_SIZE,
          App.TILE_SIZE, App.TILE_SIZE
        );
      }
    }
    this.c2d.stroke();
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
App.TICKS_PER_SECOND = 1;
//==============================================================================

/*  Initialisations
 */
//==============================================================================
window.onload = function() {
  window.app = new App();
};
//==============================================================================
