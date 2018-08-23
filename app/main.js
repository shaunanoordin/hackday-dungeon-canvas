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
eval("\n\nvar _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if (\"value\" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();\n\nfunction _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError(\"Cannot call a class as a function\"); } }\n\n/*  \nHack Day Dungeon (Visualiser)\n-----------------------------\n\n(Shaun A. Noordin | shaunanoordin.com | 20180724)\n */\n\nvar COLOURS = {\n  GREY: '#999'\n};\n\n/*  Primary App Class\n */\n//==============================================================================\n\nvar App = function () {\n  function App() {\n    _classCallCheck(this, App);\n\n    this.html = {\n      canvas: document.getElementById(\"canvas\"),\n      consoleIn: document.getElementById(\"console-in\"),\n      consoleOut: document.getElementById(\"console-out\"),\n      consoleRun: document.getElementById(\"console-run\")\n    };\n    this.c2d = this.html.canvas.getContext(\"2d\");\n    this.runCycle = null;\n\n    this.html.consoleRun.onclick = this.consoleRun_onClick.bind(this);\n\n    this.map = {\n      width: 10,\n      height: 10\n    };\n\n    this.initialiseCanvas();\n    this.updateUI_consoleRun();\n  }\n\n  _createClass(App, [{\n    key: \"start\",\n    value: function start() {\n      this.processConsoleIn();\n      this.updateUI_consoleRun();\n      this.runCycle && clearInterval(this.runCycle);\n      this.runCycle = setInterval(this.runStep.bind(this), 1000 / App.TICKS_PER_SECOND);\n    }\n  }, {\n    key: \"stop\",\n    value: function stop() {\n      this.runCycle && clearInterval(this.runCycle);\n      this.updateUI_consoleRun();\n    }\n  }, {\n    key: \"updateUI_consoleRun\",\n    value: function updateUI_consoleRun() {\n      if (!this.runCycle) {\n        this.html.consoleRun.textContent = \"START\";\n      } else {\n        this.html.consoleRun.textContent = \"STOP\";\n      }\n    }\n  }, {\n    key: \"runStep\",\n    value: function runStep() {\n      console.log('+++ step');\n      var w = this.map.width * App.TILE_SIZE;\n      var h = this.map.height * App.TILE_SIZE;\n      this.c2d.clearRect(0, 0, w, h);\n\n      this.c2d.beginPath();\n      for (var col = 0; col < this.map.width; col++) {\n        for (var row = 0; row < this.map.height; row++) {\n          this.c2d.rect(col * App.TILE_SIZE, row * App.TILE_SIZE, App.TILE_SIZE, App.TILE_SIZE);\n        }\n      }\n      this.c2d.stroke();\n    }\n  }, {\n    key: \"initialiseCanvas\",\n    value: function initialiseCanvas() {\n      this.html.canvas.width = this.map.width * App.TILE_SIZE;\n      this.html.canvas.height = this.map.height * App.TILE_SIZE;\n\n      //Account for graphical settings\n      this.c2d.mozImageSmoothingEnabled = false;\n      this.c2d.msImageSmoothingEnabled = false;\n      this.c2d.imageSmoothingEnabled = false;\n    }\n  }, {\n    key: \"processConsoleIn\",\n    value: function processConsoleIn() {\n      var input = JSON.parse(this.html.consoleIn.value);\n      console.log(input);\n    }\n  }, {\n    key: \"consoleRun_onClick\",\n    value: function consoleRun_onClick() {\n      if (this.runCycle) {\n        this.stop();\n      } else {\n        this.start();\n      }\n    }\n  }]);\n\n  return App;\n}();\n//==============================================================================\n\n/*  Constants\n */\n//==============================================================================\n\n\nApp.TILE_SIZE = 32; //Each tile is 32x32 pixels\nApp.TICKS_PER_SECOND = 1;\n//==============================================================================\n\n/*  Initialisations\n */\n//==============================================================================\nwindow.onload = function () {\n  window.app = new App();\n};\n//==============================================================================\n\n//# sourceURL=webpack:///./src/main.js?");

/***/ })

/******/ });