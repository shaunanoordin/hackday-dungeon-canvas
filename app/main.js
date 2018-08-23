/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId]) {
/******/ 			return installedModules[moduleId].exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			i: moduleId,
/******/ 			l: false,
/******/ 			exports: {}
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.l = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// define getter function for harmony exports
/******/ 	__webpack_require__.d = function(exports, name, getter) {
/******/ 		if(!__webpack_require__.o(exports, name)) {
/******/ 			Object.defineProperty(exports, name, {
/******/ 				configurable: false,
/******/ 				enumerable: true,
/******/ 				get: getter
/******/ 			});
/******/ 		}
/******/ 	};
/******/
/******/ 	// define __esModule on exports
/******/ 	__webpack_require__.r = function(exports) {
/******/ 		Object.defineProperty(exports, '__esModule', { value: true });
/******/ 	};
/******/
/******/ 	// getDefaultExport function for compatibility with non-harmony modules
/******/ 	__webpack_require__.n = function(module) {
/******/ 		var getter = module && module.__esModule ?
/******/ 			function getDefault() { return module['default']; } :
/******/ 			function getModuleExports() { return module; };
/******/ 		__webpack_require__.d(getter, 'a', getter);
/******/ 		return getter;
/******/ 	};
/******/
/******/ 	// Object.prototype.hasOwnProperty.call
/******/ 	__webpack_require__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(__webpack_require__.s = "./src/main.js");
/******/ })
/************************************************************************/
/******/ ({

/***/ "./src/main.js":
/*!*********************!*\
  !*** ./src/main.js ***!
  \*********************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
eval("\n\nvar _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if (\"value\" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();\n\nfunction _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError(\"Cannot call a class as a function\"); } }\n\n/*  \nHack Day Dungeon (Visualiser)\n-----------------------------\n\n(Shaun A. Noordin | shaunanoordin.com | 20180724)\n */\n\n/*  Primary App Class\n */\n//==============================================================================\nvar App = function () {\n  /*\n  System and Initialisations\n  ----------------------------------------------------------------\n   */\n  function App() {\n    _classCallCheck(this, App);\n\n    this.html = {\n      canvas: document.getElementById(\"canvas\"),\n      consoleIn: document.getElementById(\"console-in\"),\n      consoleOut: document.getElementById(\"console-out\"),\n      consoleRun: document.getElementById(\"console-run\")\n    };\n    this.c2d = this.html.canvas.getContext(\"2d\");\n    this.runCycle = null;\n\n    this.html.consoleRun.onclick = this.consoleRun_onClick.bind(this);\n\n    this.rounds = [];\n    this.currentRound = 0;\n    this.currentRoundEvent = 0;\n    this.currentTick = 0; //Animation step.\n\n    this.map = {\n      width: 1,\n      height: 1,\n      margin: 1\n    };\n\n    this.entities = {};\n    this.entityStyles = {}; //Visual style of entities. Derived when entities are spawned.\n\n    this.initialiseCanvas();\n    this.updateUI_consoleRun();\n  }\n  /*\n  ----------------------------------------------------------------\n   */\n\n  /*\n  User Controls\n  ----------------------------------------------------------------\n   */\n\n\n  _createClass(App, [{\n    key: \"start\",\n    value: function start() {\n      this.currentRound = 0;\n      this.currentRoundEvent = 0;\n      this.currentTick = 0;\n\n      this.processConsoleIn();\n      this.runCycle && clearInterval(this.runCycle);\n      this.runCycle = setInterval(this.runStep.bind(this), 1000 / App.TICKS_PER_SECOND);\n      this.updateUI_consoleRun();\n    }\n  }, {\n    key: \"stop\",\n    value: function stop() {\n      this.runCycle && clearInterval(this.runCycle);\n      this.runCycle = undefined;\n      this.updateUI_consoleRun();\n    }\n  }, {\n    key: \"updateUI_consoleRun\",\n    value: function updateUI_consoleRun() {\n      if (!this.runCycle) {\n        this.html.consoleRun.textContent = \"START\";\n      } else {\n        this.html.consoleRun.textContent = \"STOP\";\n      }\n    }\n  }, {\n    key: \"processConsoleIn\",\n    value: function processConsoleIn() {\n      var input = JSON.parse(this.html.consoleIn.value);\n      this.rounds = input.rounds;\n    }\n  }, {\n    key: \"consoleRun_onClick\",\n    value: function consoleRun_onClick() {\n      if (this.runCycle) {\n        this.stop();\n      } else {\n        this.start();\n      }\n    }\n  }, {\n    key: \"initialiseCanvas\",\n    value: function initialiseCanvas() {\n      //Set the starting canvas size; it'll be overwritten in initialiseGame()\n      this.html.canvas.width = this.map.width * App.TILE_SIZE;\n      this.html.canvas.height = this.map.height * App.TILE_SIZE;\n\n      //Account for graphical settings.\n      //Remove smoothing so we can scale up the canvas and still have the sharp\n      //edges of pixel art.\n      this.c2d.mozImageSmoothingEnabled = false;\n      this.c2d.msImageSmoothingEnabled = false;\n      this.c2d.imageSmoothingEnabled = false;\n    }\n    /*\n    ----------------------------------------------------------------\n     */\n\n    /*\n    Game Logic\n    ----------------------------------------------------------------\n     */\n\n  }, {\n    key: \"runStep\",\n    value: function runStep() {\n      //Get the current round.\n      var round = this.rounds[this.currentRound];\n      if (!round) {\n        this.stop();return;\n      } //If we're out of rounds, the game is over.\n      var event = round.events[this.currentRoundEvent];\n\n      this.html.consoleOut.textContent = \"Round \" + (this.currentRound + 1) + \"\\r\\n\";\n      if (event) {\n        this.html.consoleOut.textContent += \"Event \" + (this.currentRoundEvent + 1) + \" - \" + event.type + \" \\n\";\n      }\n\n      //If this is the very start of the game, initialise the game.\n      if (this.currentRound === 0 && this.currentRoundEvent === 0 && this.currentTick === 0) {\n        this.initialiseGame(round);\n      }\n\n      //If this is the very start of the round, initialise it.\n      if (this.currentRoundEvent === 0 && this.currentTick === 0) {\n        this.entities = round.initial_world.entities;\n      }\n\n      //If this is the very start of an event... do something?\n      if (this.currentTick === 0) {\n\n        if (event) {\n          switch (event.type) {\n            case \"spawn\":\n              var entityId = event.entity;\n              this.registerEntityStyle(entityId);\n\n              //Add the entity to the list of current entities.\n              this.entities[entityId] = { //DEFAULT ENTITY\n                id: entityId,\n                coord: {\n                  x: event.at.x,\n                  y: event.at.y\n                },\n                health: App.MAX_ENTITY_HEALTH,\n                ducked: false\n              };\n              break;\n          }\n        }\n      }\n\n      //PAINT PAINT PAINT!\n      this.paint(round, round.events[this.currentRoundEvent]);\n\n      //Take the next step\n      this.currentTick++;\n      if (this.currentTick >= App.TICKS_PER_EVENT) {\n        //If we've done all the ticks for this event, go to the next event.\n        this.currentTick = 0;\n        this.currentRoundEvent++;\n        if (this.currentRoundEvent >= round.events.length) {\n          //If we've done all the events for this round, go to the next round.\n          this.currentRoundEvent = 0;\n          this.currentRound++;\n        }\n      }\n    }\n  }, {\n    key: \"initialiseGame\",\n    value: function initialiseGame(firstRound) {\n      this.map.width = firstRound.initial_world.width;\n      this.map.height = firstRound.initial_world.height;\n      this.html.canvas.width = (this.map.width + 2 * this.map.margin) * App.TILE_SIZE;\n      this.html.canvas.height = (this.map.height + 2 * this.map.margin) * App.TILE_SIZE;\n      this.entities = {};\n      this.entityStyles = {};\n    }\n    /*\n    ----------------------------------------------------------------\n     */\n\n    /*\n    Animation\n    ----------------------------------------------------------------\n     */\n\n  }, {\n    key: \"paint\",\n    value: function paint(round, event) {\n      var _this = this;\n\n      var w = this.map.width * App.TILE_SIZE;\n      var h = this.map.height * App.TILE_SIZE;\n      this.c2d.clearRect(0, 0, w, h);\n\n      //Draw the grid\n      this.c2d.beginPath();\n      for (var col = 0; col < this.map.width; col++) {\n        for (var row = 0; row < this.map.height; row++) {\n          this.c2d.rect((col + this.map.margin) * App.TILE_SIZE, (row + this.map.margin) * App.TILE_SIZE, App.TILE_SIZE, App.TILE_SIZE);\n        }\n      }\n      this.c2d.lineWidth = App.STYLES.GRID.LINEWIDTH;\n      this.c2d.strokeStyle = App.STYLES.GRID.COLOUR;\n      this.c2d.stroke();\n\n      //For each entity, draw the character.\n      Object.values(this.entities).forEach(function (entity) {\n        //If an entity will be animated later (e.g. in an event), don't draw them\n        //at this stage.\n        var willEntityBeAnimatedLater = event && event.entity === entity.id && (event.type === \"spawn\" || event.type === \"move\" || event.type === \"death\");\n        if (willEntityBeAnimatedLater) return;\n\n        var midX = (entity.coord.x + _this.map.margin + 0.5) * App.TILE_SIZE;\n        var midY = (entity.coord.y + _this.map.margin + 0.5) * App.TILE_SIZE;\n\n        if (entity.health > 0) {\n          _this.paintEntity(entity, midX, midY, \"idle\");\n        } else {\n          _this.paintEntity(entity, midX, midY, \"dead\");\n        }\n      });\n\n      //If there's an event, animate it.\n      var tweenPercent = this.currentTick / App.TICKS_PER_EVENT;\n      if (event) {\n        var entityId = event.entity;\n        var entity = this.entities[entityId];\n        var midX = 0,\n            midY = 0;\n        var radius = 1;\n        var entityStyle = App.STYLES.UNKNOWN;\n\n        switch (event.type) {\n\n          //Event: player spawns.\n          //Animation: expanding circle.\n          case \"spawn\":\n            midX = (event.at.x + this.map.margin + 0.5) * App.TILE_SIZE;\n            midY = (event.at.y + this.map.margin + 0.5) * App.TILE_SIZE;\n            radius = Math.max(App.TILE_SIZE / 2 * tweenPercent, 1);\n            entityStyle = this.entityStyles[entityId] ? this.entityStyles[entityId] : App.STYLES.UNKNOWN;\n\n            this.c2d.beginPath();\n            this.c2d.arc(midX, midY, radius, 0, 2 * Math.PI);\n            this.c2d.lineWidth = 2;\n            this.c2d.strokeStyle = entityStyle;\n            this.c2d.stroke();\n\n            break;\n\n          //Event: player is KOed.\n          //Animation: collapsing circle.\n          case \"death\":\n            midX = (entity.coord.x + this.map.margin + 0.5) * App.TILE_SIZE;\n            midY = (entity.coord.y + this.map.margin + 0.5) * App.TILE_SIZE;\n            radius = Math.max(App.TILE_SIZE / 2 * (1 - tweenPercent), 1);\n            entityStyle = this.entityStyles[entityId] ? this.entityStyles[entityId] : App.STYLES.UNKNOWN;\n\n            this.c2d.beginPath();\n            this.c2d.arc(midX, midY, radius, 0, 2 * Math.PI);\n            this.c2d.lineWidth = 2;\n            this.c2d.strokeStyle = entityStyle;\n            this.c2d.stroke();\n\n            break;\n\n          //Event: player moves to a new location.\n          case \"move\":\n            if (!entity) break;\n\n            midX = (event.from.x + (event.to.x - event.from.x) * tweenPercent + this.map.margin + 0.5) * App.TILE_SIZE;\n            midY = (event.from.y + (event.to.y - event.from.y) * tweenPercent + this.map.margin + 0.5) * App.TILE_SIZE;\n            this.paintEntity(entity, midX, midY, \"moving\");\n\n            break;\n\n          case \"ranged\":\n            if (!entity) break;\n\n            event.coords.forEach(function (projectile) {\n              midX = (entity.coord.x + (projectile.x - entity.coord.x) * tweenPercent + _this.map.margin + 0.5) * App.TILE_SIZE;\n              midY = (entity.coord.y + (projectile.y - entity.coord.y) * tweenPercent + _this.map.margin + 0.5) * App.TILE_SIZE;\n              _this.paintProjectile(entity, midX, midY);\n            });\n\n            break;\n\n          default:\n        }\n      }\n    }\n  }, {\n    key: \"paintEntity\",\n    value: function paintEntity(entity, midX, midY, action) {\n      var radius = App.TILE_SIZE / 2;\n      this.c2d.beginPath();\n      this.c2d.arc(midX, midY, radius, 0, 2 * Math.PI);\n\n      if (action === \"idle\" || action === \"moving\") {\n        this.c2d.fillStyle = this.entityStyles[entity.id] ? this.entityStyles[entity.id] : App.STYLES.UNKNOWN;\n      } else if (action === \"dead\") {\n        this.c2d.fillStyle = App.STYLES.ENTITIES.DEAD_COLOUR;\n      } else {\n        this.c2d.fillStyle = App.STYLES.UNKNOWN;\n      }\n\n      this.c2d.fill();\n    }\n  }, {\n    key: \"paintProjectile\",\n    value: function paintProjectile(entity, midX, midY) {\n      var radius = App.TILE_SIZE / 4;\n      this.c2d.beginPath();\n      this.c2d.arc(midX, midY, radius, 0, 2 * Math.PI);\n      this.c2d.fillStyle = this.entityStyles[entity.id] ? this.entityStyles[entity.id] : App.STYLES.UNKNOWN;\n      this.c2d.fill();\n    }\n  }, {\n    key: \"registerEntityStyle\",\n    value: function registerEntityStyle(entityId) {\n      if (!this.entityStyles[entityId]) {\n        this.entityStyles[entityId] = App.STYLES.ENTITIES.COLOURS[Object.values(this.entityStyles).length];\n      }\n    }\n    /*\n    ----------------------------------------------------------------\n     */\n\n  }]);\n\n  return App;\n}();\n//==============================================================================\n\n/*  Constants\n */\n//==============================================================================\n\n\nApp.TILE_SIZE = 32; //Each tile is 32x32 pixels\nApp.TICKS_PER_SECOND = 60;\nApp.TICKS_PER_EVENT = 30;\nApp.MAX_ENTITY_HEALTH = 100;\n\nApp.STYLES = {\n  GRID: {\n    COLOUR: '#ccc',\n    LINEWIDTH: 1\n  },\n  ENTITIES: {\n    COLOURS: ['#c33', '#39c', '#fc3', '#396', '#c9f'],\n    DEAD_COLOUR: '#ccc'\n  },\n  UNKNOWN: '#f0f'\n};\n//==============================================================================\n\n/*  Initialisations\n */\n//==============================================================================\nwindow.onload = function () {\n  window.app = new App();\n};\n//==============================================================================\n\n//# sourceURL=webpack:///./src/main.js?");

/***/ })

/******/ });