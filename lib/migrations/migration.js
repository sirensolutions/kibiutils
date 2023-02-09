'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _lodash = require('lodash');

var _events = require('events');

var _events2 = _interopRequireDefault(_events);

var _bulk_operations = require('./lib/bulk_operations');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

require('babel-polyfill');

/**
 * The base class for migrations.
 */
var Migration = function () {
  _createClass(Migration, null, [{
    key: 'description',

    /**
     * Returns the description of the migration.
     */
    get: function get() {
      return 'No description';
    }

    /**
     * Creates a new Migration.
     *
     * @param configuration {object} The migration configuration.
     */

  }]);

  function Migration(configuration) {
    _classCallCheck(this, Migration);

    if (!configuration) throw new Error('Configuration not specified.');

    this._client = configuration.client;
    this._config = configuration.config;
    this._logger = configuration.logger;
  }

  _createClass(Migration, [{
    key: 'parseJSON',


    /**
     * Tries to parse objectString to JSON Object, logs warning and returns {} on failure.
     * @param {String} objectString
     * @returns Parsed JSON Object or {} on failure
     */
    value: function parseJSON(objectString) {
      try {
        return JSON.parse(objectString);
      } catch (e) {
        this.logger.warning('Unable to parse to JSON object: ' + objectString);
        this.logger.error(e);
        return {};
      }
    }

    /**
     * Returns the number of objects that can be upgraded by this migration.
     */

  }, {
    key: 'count',
    value: function () {
      var _ref = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee() {
        return regeneratorRuntime.wrap(function _callee$(_context) {
          while (1) {
            switch (_context.prev = _context.next) {
              case 0:
                return _context.abrupt('return', 0);

              case 1:
              case 'end':
                return _context.stop();
            }
          }
        }, _callee, this);
      }));

      function count() {
        return _ref.apply(this, arguments);
      }

      return count;
    }()

    /**
     * Retrieves the total hit count from a response object
     * @param  {Object} response
     * @return {Number} Total hit count
     */

  }, {
    key: 'getTotalHitCount',
    value: function getTotalHitCount(response) {
      var total = response.hits.total;
      if ((typeof total === 'undefined' ? 'undefined' : _typeof(total)) === 'object') {
        return total.value;
      }
      return total;
    }

    /**
     * Performs an upgrade and returns the number of objects upgraded.
     */

  }, {
    key: 'upgrade',
    value: function () {
      var _ref2 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee2() {
        return regeneratorRuntime.wrap(function _callee2$(_context2) {
          while (1) {
            switch (_context2.prev = _context2.next) {
              case 0:
                return _context2.abrupt('return', 0);

              case 1:
              case 'end':
                return _context2.stop();
            }
          }
        }, _callee2, this);
      }));

      function upgrade() {
        return _ref2.apply(this, arguments);
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
    key: 'scrollSearch',
    value: function () {
      var _ref3 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee4(index, type, query, options) {
        var _this = this;

        var executeLoop = function () {
          var _ref4 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee3() {
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
                    _context3.t0 = _context3['catch'](7);

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
                      emitter.emit('end', { total: emmitedObjects });
                    }
                    return _context3.abrupt('break', 37);

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
                    _context3.t1 = _context3['catch'](21);

                    if (!emitter) {
                      _context3.next = 34;
                      break;
                    }

                    emitter.emit('error', _context3.t1);
                    return _context3.abrupt('break', 37);

                  case 34:
                    throw _context3.t1;

                  case 35:
                    _context3.next = 3;
                    break;

                  case 37:
                  case 'end':
                    return _context3.stop();
                }
              }
            }, _callee3, this, [[7, 12], [21, 27]]);
          }));

          return function executeLoop() {
            return _ref4.apply(this, arguments);
          };
        }();

        var returnEventEmitter = arguments.length > 4 && arguments[4] !== undefined ? arguments[4] : false;
        var objects, emitter, emmitedObjects, opts, searchOptions;
        return regeneratorRuntime.wrap(function _callee4$(_context4) {
          while (1) {
            switch (_context4.prev = _context4.next) {
              case 0:
                if (index) {
                  _context4.next = 2;
                  break;
                }

                throw new Error('Calling scroll search API without specifying an index is not allowed in migrations');

              case 2:
                objects = [];
                emitter = returnEventEmitter === true ? new _events2.default.EventEmitter() : undefined;
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
                  _context4.next = 11;
                  break;
                }

                // execute the loop in the next tick so the caller have a chance to register handlers
                setTimeout(function () {
                  return executeLoop.call(_this);
                });
                return _context4.abrupt('return', emitter);

              case 11:
                _context4.next = 13;
                return executeLoop.call(this);

              case 13:
                return _context4.abrupt('return', objects);

              case 14:
              case 'end':
                return _context4.stop();
            }
          }
        }, _callee4, this);
      }));

      function scrollSearch(_x, _x2, _x3, _x4) {
        return _ref3.apply(this, arguments);
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
    key: 'countHits',
    value: function () {
      var _ref5 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee5(index, type, query) {
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
                return _context5.abrupt('return', response.count);

              case 5:
              case 'end':
                return _context5.stop();
            }
          }
        }, _callee5, this);
      }));

      function countHits(_x6, _x7, _x8) {
        return _ref5.apply(this, arguments);
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
    key: 'executeteBulkRequest',
    value: function () {
      var _ref6 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee6(bulkBody) {
        var batchOperationNumber = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 250;
        var batchSize;
        return regeneratorRuntime.wrap(function _callee6$(_context6) {
          while (1) {
            switch (_context6.prev = _context6.next) {
              case 0:
                if (!(bulkBody.length > 0)) {
                  _context6.next = 6;
                  break;
                }

                batchSize = (0, _bulk_operations.getBatchSize)(bulkBody, batchOperationNumber);
                _context6.next = 4;
                return this._client.bulk({
                  refresh: true,
                  body: bulkBody.splice(0, batchSize)
                });

              case 4:
                _context6.next = 0;
                break;

              case 6:
              case 'end':
                return _context6.stop();
            }
          }
        }, _callee6, this);
      }));

      function executeteBulkRequest(_x9) {
        return _ref6.apply(this, arguments);
      }

      return executeteBulkRequest;
    }()
  }, {
    key: 'logger',
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
  }]);

  return Migration;
}();

exports.default = Migration;