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
      width: 10,
      height: 10,
    };
    
    this.initialiseCanvas();
    this.updateUI_consoleRun();
  }
  
  start() {
    this.runCycle && clearInterval(this.runCycle);
    this.runCycle = setInterval(this.runStep.bind(this), 1000 / App.TICKS_PER_SECOND);
    this.html.consoleRun.value = "X";
    this.updateUI_consoleRun();
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
    console.log('+++ step');
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
