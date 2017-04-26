'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }(); /**
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      * Manages scenarios for functional tests run against the esvm cluster; this
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      * is basically a fork of the ScenarioManager defined in
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      * /test/fixtures that can be used outside the native functional test suites.
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      */


var _path = require('path');

var _path2 = _interopRequireDefault(_path);

var _bluebird = require('bluebird');

var _bluebird2 = _interopRequireDefault(_bluebird);

var _elasticsearch = require('elasticsearch');

var _elasticsearch2 = _interopRequireDefault(_elasticsearch);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new _bluebird2.default(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return _bluebird2.default.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var ScenarioManager = function () {
  function ScenarioManager(server, timeout) {
    _classCallCheck(this, ScenarioManager);

    if (!server) throw new Error('No server defined');
    if (!timeout) timeout = 300;

    this.client = new _elasticsearch2.default.Client({
      host: server,
      requestTimeout: timeout
    });
  }

  /**
   * Load a testing scenario
   * @param {object} scenario The scenario configuration to load
   */


  _createClass(ScenarioManager, [{
    key: 'load',
    value: function () {
      var _ref = _asyncToGenerator(regeneratorRuntime.mark(function _callee(scenario) {
        var self, _iteratorNormalCompletion, _didIteratorError, _iteratorError, _iterator, _step, bulk, _body, body, response;

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
                _iteratorNormalCompletion = true;
                _didIteratorError = false;
                _iteratorError = undefined;
                _context.prev = 6;
                _iterator = scenario.bulk[Symbol.iterator]();

              case 8:
                if (_iteratorNormalCompletion = (_step = _iterator.next()).done) {
                  _context.next = 33;
                  break;
                }

                bulk = _step.value;

                if (!bulk.indexDefinition) {
                  _context.next = 14;
                  break;
                }

                _body = require(_path2.default.join(scenario.baseDir, bulk.indexDefinition));
                _context.next = 14;
                return self.client.indices.create({
                  index: bulk.indexName,
                  body: _body
                });

              case 14:
                _context.next = 16;
                return self.client.cluster.health({
                  waitForStatus: 'yellow'
                });

              case 16:
                body = require(_path2.default.join(scenario.baseDir, bulk.source));
                _context.prev = 17;
                _context.next = 20;
                return self.client.bulk({
                  refresh: true,
                  body: body
                });

              case 20:
                response = _context.sent;

                if (!response.errors) {
                  _context.next = 23;
                  break;
                }

                throw new Error('bulk failed\n' + this.formatBulkErrorResponse(response));

              case 23:
                _context.next = 30;
                break;

              case 25:
                _context.prev = 25;
                _context.t0 = _context['catch'](17);

                if (!(bulk.haltOnFailure === false)) {
                  _context.next = 29;
                  break;
                }

                return _context.abrupt('return');

              case 29:
                throw _context.t0;

              case 30:
                _iteratorNormalCompletion = true;
                _context.next = 8;
                break;

              case 33:
                _context.next = 39;
                break;

              case 35:
                _context.prev = 35;
                _context.t1 = _context['catch'](6);
                _didIteratorError = true;
                _iteratorError = _context.t1;

              case 39:
                _context.prev = 39;
                _context.prev = 40;

                if (!_iteratorNormalCompletion && _iterator.return) {
                  _iterator.return();
                }

              case 42:
                _context.prev = 42;

                if (!_didIteratorError) {
                  _context.next = 45;
                  break;
                }

                throw _iteratorError;

              case 45:
                return _context.finish(42);

              case 46:
                return _context.finish(39);

              case 47:
              case 'end':
                return _context.stop();
            }
          }
        }, _callee, this, [[6, 35, 39, 47], [17, 25], [40,, 42, 46]]);
      }));

      function load(_x) {
        return _ref.apply(this, arguments);
      }

      return load;
    }()
  }, {
    key: 'formatBulkErrorResponse',


    /**
     * Formats a bulk error response.
     *
     * @param {Object} response The bulk response.
     * @return {String} the formatted error response.
     */
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
    key: 'unload',
    value: function () {
      var _ref2 = _asyncToGenerator(regeneratorRuntime.mark(function _callee2(scenario) {
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
                _context2.t0 = _context2['catch'](11);

                if (!(_context2.t0.message.indexOf('index_not_found_exception') < 0)) {
                  _context2.next = 21;
                  break;
                }

                console.log('error.message: ' + _context2.t0.message);
                throw _context2.t0;

              case 21:
                _context2.next = 23;
                return _bluebird2.default.delay(100);

              case 23:
                return _context2.abrupt('continue', 4);

              case 24:
                return _context2.abrupt('break', 27);

              case 27:
              case 'end':
                return _context2.stop();
            }
          }
        }, _callee2, this, [[11, 16]]);
      }));

      function unload(_x2) {
        return _ref2.apply(this, arguments);
      }

      return unload;
    }()
  }, {
    key: 'reload',


    /**
     * Reload a scenario.
     * @param {object} scenario The scenario to reload.
     */
    value: function () {
      var _ref3 = _asyncToGenerator(regeneratorRuntime.mark(function _callee3(scenario) {
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
              case 'end':
                return _context3.stop();
            }
          }
        }, _callee3, this);
      }));

      function reload(_x3) {
        return _ref3.apply(this, arguments);
      }

      return reload;
    }()
  }, {
    key: 'deleteAll',


    /**
     * Sends a delete all indices request
     */
    value: function () {
      var _ref4 = _asyncToGenerator(regeneratorRuntime.mark(function _callee4() {
        return regeneratorRuntime.wrap(function _callee4$(_context4) {
          while (1) {
            switch (_context4.prev = _context4.next) {
              case 0:
                _context4.next = 2;
                return this.client.indices.delete({
                  index: '*'
                });

              case 2:
              case 'end':
                return _context4.stop();
            }
          }
        }, _callee4, this);
      }));

      function deleteAll() {
        return _ref4.apply(this, arguments);
      }

      return deleteAll;
    }()
  }]);

  return ScenarioManager;
}();

exports.default = ScenarioManager;