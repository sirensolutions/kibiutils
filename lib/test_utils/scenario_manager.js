"use strict";

require("core-js/modules/es.object.to-string.js");

require("core-js/modules/es.promise.js");

require("core-js/modules/es.array.slice.js");

require("core-js/modules/es.array.from.js");

require("core-js/modules/es.string.iterator.js");

require("core-js/modules/es.symbol.js");

require("core-js/modules/es.symbol.description.js");

require("core-js/modules/es.symbol.iterator.js");

require("core-js/modules/es.array.iterator.js");

require("core-js/modules/web.dom-collections.iterator.js");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

require("regenerator-runtime/runtime.js");

require("core-js/modules/es.array.join.js");

require("core-js/modules/es.array.map.js");

require("core-js/modules/es.array.filter.js");

require("core-js/modules/es.object.keys.js");

require("core-js/modules/es.array.index-of.js");

var _path = _interopRequireDefault(require("path"));

var _bluebird = _interopRequireDefault(require("bluebird"));

var _elasticsearch = _interopRequireDefault(require("elasticsearch"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _createForOfIteratorHelper(o, allowArrayLike) { var it = typeof Symbol !== "undefined" && o[Symbol.iterator] || o["@@iterator"]; if (!it) { if (Array.isArray(o) || (it = _unsupportedIterableToArray(o)) || allowArrayLike && o && typeof o.length === "number") { if (it) o = it; var i = 0; var F = function F() {}; return { s: F, n: function n() { if (i >= o.length) return { done: true }; return { done: false, value: o[i++] }; }, e: function e(_e) { throw _e; }, f: F }; } throw new TypeError("Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); } var normalCompletion = true, didErr = false, err; return { s: function s() { it = it.call(o); }, n: function n() { var step = it.next(); normalCompletion = step.done; return step; }, e: function e(_e2) { didErr = true; err = _e2; }, f: function f() { try { if (!normalCompletion && it.return != null) it.return(); } finally { if (didErr) throw err; } } }; }

function _unsupportedIterableToArray(o, minLen) { if (!o) return; if (typeof o === "string") return _arrayLikeToArray(o, minLen); var n = Object.prototype.toString.call(o).slice(8, -1); if (n === "Object" && o.constructor) n = o.constructor.name; if (n === "Map" || n === "Set") return Array.from(o); if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen); }

function _arrayLikeToArray(arr, len) { if (len == null || len > arr.length) len = arr.length; for (var i = 0, arr2 = new Array(len); i < len; i++) { arr2[i] = arr[i]; } return arr2; }

function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(_next, _throw); } }

function _asyncToGenerator(fn) { return function () { var self = this, args = arguments; return new Promise(function (resolve, reject) { var gen = fn.apply(self, args); function _next(value) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "next", value); } function _throw(err) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "throw", err); } _next(undefined); }); }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

var ScenarioManager = /*#__PURE__*/function () {
  function ScenarioManager(server, timeout) {
    _classCallCheck(this, ScenarioManager);

    if (!server) throw new Error('No server defined');
    if (!timeout) timeout = 300;
    this.client = new _elasticsearch.default.Client({
      host: server,
      requestTimeout: timeout
    });
  }
  /**
   * Load a testing scenario
   * @param {object} scenario The scenario configuration to load
   */


  _createClass(ScenarioManager, [{
    key: "load",
    value: function () {
      var _load = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee(scenario) {
        var self, _iterator, _step, bulk, _body, body, response;

        return regeneratorRuntime.wrap(function _callee$(_context) {
          while (1) {
            switch (_context.prev = _context.next) {
              case 0:
                self = this;

                if (scenario) {
                  _context.next = 3;
                  break;
                }

                throw new Error('No scenario specified');

              case 3:
                _iterator = _createForOfIteratorHelper(scenario.bulk);
                _context.prev = 4;

                _iterator.s();

              case 6:
                if ((_step = _iterator.n()).done) {
                  _context.next = 30;
                  break;
                }

                bulk = _step.value;

                if (!bulk.indexDefinition) {
                  _context.next = 12;
                  break;
                }

                _body = require(_path.default.join(scenario.baseDir, bulk.indexDefinition));
                _context.next = 12;
                return self.client.indices.create({
                  index: bulk.indexName,
                  body: _body
                });

              case 12:
                _context.next = 14;
                return self.client.cluster.health({
                  waitForStatus: 'yellow'
                });

              case 14:
                body = require(_path.default.join(scenario.baseDir, bulk.source));
                _context.prev = 15;
                _context.next = 18;
                return self.client.bulk({
                  refresh: true,
                  body: body
                });

              case 18:
                response = _context.sent;

                if (!response.errors) {
                  _context.next = 21;
                  break;
                }

                throw new Error('bulk failed\n' + this.formatBulkErrorResponse(response));

              case 21:
                _context.next = 28;
                break;

              case 23:
                _context.prev = 23;
                _context.t0 = _context["catch"](15);

                if (!(bulk.haltOnFailure === false)) {
                  _context.next = 27;
                  break;
                }

                return _context.abrupt("return");

              case 27:
                throw _context.t0;

              case 28:
                _context.next = 6;
                break;

              case 30:
                _context.next = 35;
                break;

              case 32:
                _context.prev = 32;
                _context.t1 = _context["catch"](4);

                _iterator.e(_context.t1);

              case 35:
                _context.prev = 35;

                _iterator.f();

                return _context.finish(35);

              case 38:
              case "end":
                return _context.stop();
            }
          }
        }, _callee, this, [[4, 32, 35, 38], [15, 23]]);
      }));

      function load(_x) {
        return _load.apply(this, arguments);
      }

      return load;
    }()
    /**
     * Formats a bulk error response.
     *
     * @param {Object} response The bulk response.
     * @return {String} the formatted error response.
     */

  }, {
    key: "formatBulkErrorResponse",
    value: function formatBulkErrorResponse(response) {
      return response.items.map(function (i) {
        return i[Object.keys(i)[0]].error;
      }).filter(Boolean).map(function (err) {
        return '  ' + JSON.stringify(err);
      }).join('\n');
    }
    /**
     * Unload a scenario.
     * @param {object} scenario The scenario configuration to unload.
     */

  }, {
    key: "unload",
    value: function () {
      var _unload = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee2(scenario) {
        var indices, start, exists;
        return regeneratorRuntime.wrap(function _callee2$(_context2) {
          while (1) {
            switch (_context2.prev = _context2.next) {
              case 0:
                if (scenario) {
                  _context2.next = 2;
                  break;
                }

                throw new Error('No scenario specified');

              case 2:
                indices = scenario.bulk.map(function mapBulk(bulk) {
                  return bulk.indexName;
                });
                start = Date.now();

              case 4:
                if (!true) {
                  _context2.next = 27;
                  break;
                }

                _context2.next = 7;
                return this.client.indices.exists({
                  index: indices
                });

              case 7:
                exists = _context2.sent;

                if (!exists) {
                  _context2.next = 24;
                  break;
                }

                if (!(Date.now() - start > 10000)) {
                  _context2.next = 11;
                  break;
                }

                throw new Error('ScenarioManager timed out while waiting for indices to be deleted.');

              case 11:
                _context2.prev = 11;
                _context2.next = 14;
                return this.client.indices.delete({
                  index: indices
                });

              case 14:
                _context2.next = 21;
                break;

              case 16:
                _context2.prev = 16;
                _context2.t0 = _context2["catch"](11);

                if (!(_context2.t0.message.indexOf('index_not_found_exception') < 0)) {
                  _context2.next = 21;
                  break;
                }

                // eslint-disable-next-line no-console
                console.log('error.message: ' + _context2.t0.message);
                throw _context2.t0;

              case 21:
                _context2.next = 23;
                return _bluebird.default.delay(100);

              case 23:
                return _context2.abrupt("continue", 4);

              case 24:
                return _context2.abrupt("break", 27);

              case 27:
              case "end":
                return _context2.stop();
            }
          }
        }, _callee2, this, [[11, 16]]);
      }));

      function unload(_x2) {
        return _unload.apply(this, arguments);
      }

      return unload;
    }()
    /**
     * Reload a scenario.
     * @param {object} scenario The scenario to reload.
     */

  }, {
    key: "reload",
    value: function () {
      var _reload = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee3(scenario) {
        var self;
        return regeneratorRuntime.wrap(function _callee3$(_context3) {
          while (1) {
            switch (_context3.prev = _context3.next) {
              case 0:
                self = this;
                _context3.next = 3;
                return self.unload(scenario);

              case 3:
                _context3.next = 5;
                return self.load(scenario);

              case 5:
              case "end":
                return _context3.stop();
            }
          }
        }, _callee3, this);
      }));

      function reload(_x3) {
        return _reload.apply(this, arguments);
      }

      return reload;
    }()
    /**
     * Sends a delete all indices request
     */

  }, {
    key: "deleteAll",
    value: function () {
      var _deleteAll = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee4() {
        return regeneratorRuntime.wrap(function _callee4$(_context4) {
          while (1) {
            switch (_context4.prev = _context4.next) {
              case 0:
                _context4.next = 2;
                return this.client.indices.delete({
                  index: '*'
                });

              case 2:
              case "end":
                return _context4.stop();
            }
          }
        }, _callee4, this);
      }));

      function deleteAll() {
        return _deleteAll.apply(this, arguments);
      }

      return deleteAll;
    }()
  }]);

  return ScenarioManager;
}();

exports.default = ScenarioManager;
module.exports = exports.default;