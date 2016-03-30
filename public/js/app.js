/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};

/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {

/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId])
/******/ 			return installedModules[moduleId].exports;

/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			exports: {},
/******/ 			id: moduleId,
/******/ 			loaded: false
/******/ 		};

/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);

/******/ 		// Flag the module as loaded
/******/ 		module.loaded = true;

/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}


/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;

/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;

/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";

/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(0);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

	var _state = __webpack_require__(1);

	var _state2 = _interopRequireDefault(_state);

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

	var App = function () {
	  _createClass(App, [{
	    key: 'remember',
	    value: function remember(hash) {
	      window.state.remember(hash);
	      this.render();
	    }
	  }, {
	    key: 'render',
	    value: function render() {}
	  }]);

	  function App() {
	    var _this = this;

	    _classCallCheck(this, App);

	    window.state = new _state2.default();

	    $('.btn-remember').bind('mousedown', function (e) {
	      var hash = $(e.target).data().hash;
	      _this.remember(hash);
	    });

	    this.render();
	  }

	  return App;
	}();

	new App();

/***/ },
/* 1 */
/***/ function(module, exports) {

	'use strict';

	Object.defineProperty(exports, "__esModule", {
	  value: true
	});

	var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

	var LOCALSTORAGE_ID = 'DIL';

	var State = function () {
	  _createClass(State, [{
	    key: 'remember',
	    value: function remember(hash) {
	      this.data.memory.push(hash);
	      this.persist();
	    }
	  }, {
	    key: 'persist',
	    value: function persist() {
	      localStorage.setItem(LOCALSTORAGE_ID, JSON.stringify(this.data));
	    }
	  }, {
	    key: 'load',
	    value: function load() {
	      var ls = localStorage.getItem('LOCALSTORAGE_ID');
	      if (ls) {
	        this.data = JSON.parse(localStorage.getItem(LOCALSTORAGE_ID));
	      } else {
	        this.data = {
	          memory: []
	        };
	        this.persist();
	      }
	      console.log(this.data);
	    }
	  }]);

	  function State() {
	    _classCallCheck(this, State);

	    this.load();
	  }

	  return State;
	}();

	exports.default = State;

/***/ }
/******/ ]);