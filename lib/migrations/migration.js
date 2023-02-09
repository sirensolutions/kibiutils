"use strict";

require("core-js/modules/es.object.to-string.js");

require("core-js/modules/es.promise.js");

require("core-js/modules/es.symbol.js");

require("core-js/modules/es.symbol.description.js");

require("core-js/modules/es.symbol.iterator.js");

require("core-js/modules/es.array.iterator.js");

require("core-js/modules/es.string.iterator.js");

require("core-js/modules/web.dom-collections.iterator.js");

require("core-js/modules/es.array.from.js");

require("core-js/modules/es.array.slice.js");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

require("core-js/modules/es.regexp.exec.js");

require("core-js/modules/es.string.search.js");

require("core-js/modules/es.array.splice.js");

require("regenerator-runtime/runtime.js");

var _lodash = require("lodash");

require("core-js/stable");

require("regenerator-runtime/runtime");

var _events = _interopRequireDefault(require("events"));

var _bulk_operations = require("./lib/bulk_operations");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _toConsumableArray(arr) { return _arrayWithoutHoles(arr) || _iterableToArray(arr) || _unsupportedIterableToArray(arr) || _nonIterableSpread(); }

function _nonIterableSpread() { throw new TypeError("Invalid attempt to spread non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); }

function _unsupportedIterableToArray(o, minLen) { if (!o) return; if (typeof o === "string") return _arrayLikeToArray(o, minLen); var n = Object.prototype.toString.call(o).slice(8, -1); if (n === "Object" && o.constructor) n = o.constructor.name; if (n === "Map" || n === "Set") return Array.from(o); if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen); }

function _iterableToArray(iter) { if (typeof Symbol !== "undefined" && iter[Symbol.iterator] != null || iter["@@iterator"] != null) return Array.from(iter); }

function _arrayWithoutHoles(arr) { if (Array.isArray(arr)) return _arrayLikeToArray(arr); }

function _arrayLikeToArray(arr, len) { if (len == null || len > arr.length) len = arr.length; for (var i = 0, arr2 = new Array(len); i < len; i++) { arr2[i] = arr[i]; } return arr2; }

function _typeof(obj) { "@babel/helpers - typeof"; if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(_next, _throw); } }

function _asyncToGenerator(fn) { return function () { var self = this, args = arguments; return new Promise(function (resolve, reject) { var gen = fn.apply(self, args); function _next(value) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "next", value); } function _throw(err) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "throw", err); } _next(undefined); }); }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

/**
 * The base class for migrations.
 */
var Migration = /*#__PURE__*/function () {
  /**
   * Creates a new Migration.
   *
   * @param configuration {object} The migration configuration.
   */
  function Migration(configuration) {
    _classCallCheck(this, Migration);

    if (!configuration) throw new Error('Configuration not specified.');
    this._client = configuration.client;
    this._config = configuration.config;
    this._logger = configuration.logger;
  }

  _createClass(Migration, [{
    key: "logger",
    get: function get() {
      if (this._logger) {
        return this._logger;
      }

      return {
        // eslint-disable-next-line no-console
        info: console.info,
        // eslint-disable-next-line no-console
        error: console.error,
        // eslint-disable-next-line no-console
        warning: console.warn,
        // eslint-disable-next-line no-console
        debug: console.debug
      };
    }
    /**
     * Tries to parse objectString to JSON Object, logs warning and returns {} on failure.
     * @param {String} objectString
     * @returns Parsed JSON Object or {} on failure
     */

  }, {
    key: "parseJSON",
    value: function parseJSON(objectString) {
      try {
        return JSON.parse(objectString);
      } catch (e) {
        this.logger.warning("Unable to parse to JSON object: ".concat(objectString));
        this.logger.error(e);
        return {};
      }
    }
    /**
     * Returns the number of objects that can be upgraded by this migration.
     */

  }, {
    key: "count",
    value: function () {
      var _count = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee() {
        return regeneratorRuntime.wrap(function _callee$(_context) {
          while (1) {
            switch (_context.prev = _context.next) {
              case 0:
                return _context.abrupt("return", 0);

              case 1:
              case "end":
                return _context.stop();
            }
          }
        }, _callee);
      }));

      function count() {
        return _count.apply(this, arguments);
      }

      return count;
    }()
    /**
     * Retrieves the total hit count from a response object
     * @param  {Object} response
     * @return {Number} Total hit count
     */

  }, {
    key: "getTotalHitCount",
    value: function getTotalHitCount(response) {
      var total = response.hits.total;

      if (_typeof(total) === 'object') {
        return total.value;
      }

      return total;
    }
    /**
     * Performs an upgrade and returns the number of objects upgraded.
     */

  }, {
    key: "upgrade",
    value: function () {
      var _upgrade = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee2() {
        return regeneratorRuntime.wrap(function _callee2$(_context2) {
          while (1) {
            switch (_context2.prev = _context2.next) {
              case 0:
                return _context2.abrupt("return", 0);

              case 1:
              case "end":
                return _context2.stop();
            }
          }
        }, _callee2);
      }));

      function upgrade() {
        return _upgrade.apply(this, arguments);
      }

      return upgrade;
    }()
    /**
     * Performs an Elasticsearch query using the scroll API and returns the hits.
     *
     * @param index - The index to search.
     * @param type - The type to search.
     * @param query - The query body.
     * @param options - Additional options for the search method; currently the
     *                  only supported one is `size`.
     * @params returnEventEmitter - optional, if provided the method will return an event emitter instead of hits
     *                              and will emit "data", "error", and "end" events in order to reduce the memory usage
     * @return The search hits or event emitter.
     */

  }, {
    key: "scrollSearch",
    value: function () {
      var _scrollSearch = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee4(index, type, query, options) {
        var _this = this;

        var returnEventEmitter,
            objects,
            emitter,
            emmitedObjects,
            opts,
            searchOptions,
            executeLoop,
            _executeLoop,
            _args4 = arguments;

        return regeneratorRuntime.wrap(function _callee4$(_context4) {
          while (1) {
            switch (_context4.prev = _context4.next) {
              case 0:
                _executeLoop = function _executeLoop3() {
                  _executeLoop = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee3() {
                    var response;
                    return regeneratorRuntime.wrap(function _callee3$(_context3) {
                      while (1) {
                        switch (_context3.prev = _context3.next) {
                          case 0:
                            _context3.next = 2;
                            return this._client.search(searchOptions);

                          case 2:
                            response = _context3.sent;

                          case 3:
                            if (!true) {
                              _context3.next = 37;
                              break;
                            }

                            if (emitter) {
                              emitter.emit('data', response.hits.hits);
                              emmitedObjects += response.hits.hits.length;
                            } else {
                              objects.push.apply(objects, _toConsumableArray(response.hits.hits));
                            }

                            if (!(emitter && emmitedObjects === this.getTotalHitCount(response) || !emitter && objects.length === this.getTotalHitCount(response))) {
                              _context3.next = 21;
                              break;
                            }

                            if (!response._scroll_id) {
                              _context3.next = 19;
                              break;
                            }

                            _context3.prev = 7;
                            _context3.next = 10;
                            return this._client.clearScroll({
                              body: {
                                scroll_id: response._scroll_id
                              }
                            });

                          case 10:
                            _context3.next = 19;
                            break;

                          case 12:
                            _context3.prev = 12;
                            _context3.t0 = _context3["catch"](7);

                            if (!emitter) {
                              _context3.next = 18;
                              break;
                            }

                            emitter.emit('error', _context3.t0);
                            _context3.next = 19;
                            break;

                          case 18:
                            throw _context3.t0;

                          case 19:
                            if (emitter) {
                              emitter.emit('end', {
                                total: emmitedObjects
                              });
                            }

                            return _context3.abrupt("break", 37);

                          case 21:
                            _context3.prev = 21;
                            _context3.next = 24;
                            return this._client.scroll({
                              body: {
                                scroll: '1m',
                                scroll_id: response._scroll_id
                              }
                            });

                          case 24:
                            response = _context3.sent;
                            _context3.next = 35;
                            break;

                          case 27:
                            _context3.prev = 27;
                            _context3.t1 = _context3["catch"](21);

                            if (!emitter) {
                              _context3.next = 34;
                              break;
                            }

                            emitter.emit('error', _context3.t1);
                            return _context3.abrupt("break", 37);

                          case 34:
                            throw _context3.t1;

                          case 35:
                            _context3.next = 3;
                            break;

                          case 37:
                          case "end":
                            return _context3.stop();
                        }
                      }
                    }, _callee3, this, [[7, 12], [21, 27]]);
                  }));
                  return _executeLoop.apply(this, arguments);
                };

                executeLoop = function _executeLoop2() {
                  return _executeLoop.apply(this, arguments);
                };

                returnEventEmitter = _args4.length > 4 && _args4[4] !== undefined ? _args4[4] : false;

                if (index) {
                  _context4.next = 5;
                  break;
                }

                throw new Error('Calling scroll search API without specifying an index is not allowed in migrations');

              case 5:
                objects = [];
                emitter = returnEventEmitter === true ? new _events.default.EventEmitter() : undefined;
                emmitedObjects = 0;
                opts = (0, _lodash.defaults)(options || {}, {
                  size: 100
                });
                searchOptions = {
                  index: index,
                  type: type,
                  scroll: '1m',
                  size: opts.size
                };

                if (query) {
                  searchOptions.body = query;
                }

                if (!emitter) {
                  _context4.next = 14;
                  break;
                }

                // execute the loop in the next tick so the caller have a chance to register handlers
                setTimeout(function () {
                  return executeLoop.call(_this);
                });
                return _context4.abrupt("return", emitter);

              case 14:
                _context4.next = 16;
                return executeLoop.call(this);

              case 16:
                return _context4.abrupt("return", objects);

              case 17:
              case "end":
                return _context4.stop();
            }
          }
        }, _callee4, this);
      }));

      function scrollSearch(_x, _x2, _x3, _x4) {
        return _scrollSearch.apply(this, arguments);
      }

      return scrollSearch;
    }()
    /**
     * Performs an Elasticsearch query and returns the number of hits.
     *
     * @param index - The index to search.
     * @param type - The type to search.
     * @param query - The query body.
     * @return The number of search hits.
     */

  }, {
    key: "countHits",
    value: function () {
      var _countHits = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee5(index, type, query) {
        var searchOptions, response;
        return regeneratorRuntime.wrap(function _callee5$(_context5) {
          while (1) {
            switch (_context5.prev = _context5.next) {
              case 0:
                searchOptions = {
                  index: index,
                  type: type,
                  body: query
                };
                _context5.next = 3;
                return this._client.count(searchOptions);

              case 3:
                response = _context5.sent;
                return _context5.abrupt("return", response.count);

              case 5:
              case "end":
                return _context5.stop();
            }
          }
        }, _callee5, this);
      }));

      function countHits(_x5, _x6, _x7) {
        return _countHits.apply(this, arguments);
      }

      return countHits;
    }()
    /**
     * Executes an Elasticsearch bulk request to index documents in .siren index
     * To avoid too large request body it splits the request in batches
     * @param bulkBody - An array with bulk operations
     * @param batchOperationNumber - Number of operations to include in a single batch, by operation we mean index, delete, update
     */

  }, {
    key: "executeteBulkRequest",
    value: function () {
      var _executeteBulkRequest = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee6(bulkBody) {
        var batchOperationNumber,
            batchSize,
            _args6 = arguments;
        return regeneratorRuntime.wrap(function _callee6$(_context6) {
          while (1) {
            switch (_context6.prev = _context6.next) {
              case 0:
                batchOperationNumber = _args6.length > 1 && _args6[1] !== undefined ? _args6[1] : 250;

              case 1:
                if (!(bulkBody.length > 0)) {
                  _context6.next = 7;
                  break;
                }

                batchSize = (0, _bulk_operations.getBatchSize)(bulkBody, batchOperationNumber);
                _context6.next = 5;
                return this._client.bulk({
                  refresh: true,
                  body: bulkBody.splice(0, batchSize)
                });

              case 5:
                _context6.next = 1;
                break;

              case 7:
              case "end":
                return _context6.stop();
            }
          }
        }, _callee6, this);
      }));

      function executeteBulkRequest(_x8) {
        return _executeteBulkRequest.apply(this, arguments);
      }

      return executeteBulkRequest;
    }()
  }], [{
    key: "description",
    get:
    /**
     * Returns the description of the migration.
     */
    function get() {
      return 'No description';
    }
  }]);

  return Migration;
}();

exports.default = Migration;
module.exports = exports.default;