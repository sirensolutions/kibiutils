'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _lodash = require('lodash');

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

require('babel-polyfill');

/**
 * The base class for migrations.
 */

var Migration = function () {
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

  /**
   * Returns the description of the migration.
   */


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
     * @return The search hits.
     */

  }, {
    key: 'scrollSearch',
    value: function () {
      var _ref3 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee3(index, type, query, options) {
        var objects, opts, searchOptions, response;
        return regeneratorRuntime.wrap(function _callee3$(_context3) {
          while (1) {
            switch (_context3.prev = _context3.next) {
              case 0:
                objects = [];
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

                _context3.next = 6;
                return this._client.search(searchOptions);

              case 6:
                response = _context3.sent;

              case 7:
                if (!true) {
                  _context3.next = 19;
                  break;
                }

                objects.push.apply(objects, _toConsumableArray(response.hits.hits));

                if (!(objects.length === this.getTotalHitCount(response))) {
                  _context3.next = 14;
                  break;
                }

                if (!response._scroll_id) {
                  _context3.next = 13;
                  break;
                }

                _context3.next = 13;
                return this._client.clearScroll({
                  body: {
                    scroll_id: response._scroll_id
                  }
                });

              case 13:
                return _context3.abrupt('break', 19);

              case 14:
                _context3.next = 16;
                return this._client.scroll({
                  body: {
                    scroll: '1m',
                    scroll_id: response._scroll_id
                  }
                });

              case 16:
                response = _context3.sent;
                _context3.next = 7;
                break;

              case 19:
                return _context3.abrupt('return', objects);

              case 20:
              case 'end':
                return _context3.stop();
            }
          }
        }, _callee3, this);
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
      var _ref4 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee4(index, type, query) {
        var searchOptions, response;
        return regeneratorRuntime.wrap(function _callee4$(_context4) {
          while (1) {
            switch (_context4.prev = _context4.next) {
              case 0:
                searchOptions = {
                  index: index,
                  type: type,
                  body: query,
                  ignore_unavailable: true,
                  ignore: [404]
                };
                _context4.next = 3;
                return this._client.count(searchOptions);

              case 3:
                response = _context4.sent;

                if (!(response.status === 404)) {
                  _context4.next = 6;
                  break;
                }

                return _context4.abrupt('return', 0);

              case 6:
                return _context4.abrupt('return', response.count);

              case 7:
              case 'end':
                return _context4.stop();
            }
          }
        }, _callee4, this);
      }));

      function countHits(_x5, _x6, _x7) {
        return _ref4.apply(this, arguments);
      }

      return countHits;
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
        warning: console.warn
      };
    }
  }], [{
    key: 'description',
    get: function get() {
      return 'No description';
    }
  }]);

  return Migration;
}();

exports.default = Migration;