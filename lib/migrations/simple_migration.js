'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _migration = require('./migration');

var _migration2 = _interopRequireDefault(_migration);

var _bulk_operations = require('./lib/bulk_operations');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var DEFAULT_TYPE = 'doc';

/**
 * SimpleMigration requires you to declare _savedObjectType OR _searchQuery, _newVersion, _index (optional), _type (optional),
 * in constructor and two methods: _shouldObjectUpgrade and _upgradeObject which would be passed the objects by
 * the base class to count and upgrade objects if the version is < _newVersion.
 *
 * Warning: Every new migration should bump the saved object's Version (defined by _newVersion, positive integer).
 */
var SimpleMigration = function (_Migration) {
  _inherits(SimpleMigration, _Migration);

  function SimpleMigration(configuration) {
    _classCallCheck(this, SimpleMigration);

    var _this = _possibleConstructorReturn(this, (SimpleMigration.__proto__ || Object.getPrototypeOf(SimpleMigration)).call(this, configuration));

    _this.defaultIndex = configuration.config.get('kibana.index');
    return _this;
  }

  /**
   * @return {number}
   */


  _createClass(SimpleMigration, [{
    key: 'count',


    /**
     * Returns the number of objects that can be upgraded by this migration.
     * @return {number}
     */
    value: function () {
      var _ref = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee3() {
        var _this2 = this;

        var _getSearchParams2, index, type, query, objectsEmitter;

        return regeneratorRuntime.wrap(function _callee3$(_context3) {
          while (1) {
            switch (_context3.prev = _context3.next) {
              case 0:
                _getSearchParams2 = this._getSearchParams(), index = _getSearchParams2.index, type = _getSearchParams2.type, query = _getSearchParams2.query;
                _context3.next = 3;
                return this.scrollSearch(index, type, query, {}, true);

              case 3:
                objectsEmitter = _context3.sent;
                return _context3.abrupt('return', new Promise(function (resolve, reject) {
                  var trackDataEvents = [];
                  var count = 0;
                  objectsEmitter.on('data', function () {
                    var _ref2 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee(objects) {
                      var _iteratorNormalCompletion, _didIteratorError, _iteratorError, _iterator, _step, savedObject;

                      return regeneratorRuntime.wrap(function _callee$(_context) {
                        while (1) {
                          switch (_context.prev = _context.next) {
                            case 0:
                              trackDataEvents.push(1);
                              _iteratorNormalCompletion = true;
                              _didIteratorError = false;
                              _iteratorError = undefined;
                              _context.prev = 4;
                              _iterator = objects[Symbol.iterator]();

                            case 6:
                              if (_iteratorNormalCompletion = (_step = _iterator.next()).done) {
                                _context.next = 15;
                                break;
                              }

                              savedObject = _step.value;
                              _context.next = 10;
                              return _this2.checkOutdated(savedObject);

                            case 10:
                              if (!_context.sent) {
                                _context.next = 12;
                                break;
                              }

                              count++;

                            case 12:
                              _iteratorNormalCompletion = true;
                              _context.next = 6;
                              break;

                            case 15:
                              _context.next = 21;
                              break;

                            case 17:
                              _context.prev = 17;
                              _context.t0 = _context['catch'](4);
                              _didIteratorError = true;
                              _iteratorError = _context.t0;

                            case 21:
                              _context.prev = 21;
                              _context.prev = 22;

                              if (!_iteratorNormalCompletion && _iterator.return) {
                                _iterator.return();
                              }

                            case 24:
                              _context.prev = 24;

                              if (!_didIteratorError) {
                                _context.next = 27;
                                break;
                              }

                              throw _iteratorError;

                            case 27:
                              return _context.finish(24);

                            case 28:
                              return _context.finish(21);

                            case 29:
                              // assign null to let GC that it can be collected to reduce memory consumption
                              objects = null;
                              trackDataEvents.pop();

                            case 31:
                            case 'end':
                              return _context.stop();
                          }
                        }
                      }, _callee, _this2, [[4, 17, 21, 29], [22,, 24, 28]]);
                    }));

                    return function (_x) {
                      return _ref2.apply(this, arguments);
                    };
                  }());
                  objectsEmitter.on('error', function (error) {
                    objectsEmitter.removeAllListeners();
                    // assign null to let GC that it can be collected to reduce memory consumption
                    objectsEmitter = null;
                    reject(error);
                  });
                  objectsEmitter.on('end', _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee2() {
                    return regeneratorRuntime.wrap(function _callee2$(_context2) {
                      while (1) {
                        switch (_context2.prev = _context2.next) {
                          case 0:
                            _context2.next = 2;
                            return (0, _bulk_operations.waitUntilArrayIsEmpty)(trackDataEvents);

                          case 2:
                            objectsEmitter.removeAllListeners();
                            // assign null to let GC that it can be collected to reduce memory consumption
                            objectsEmitter = null;
                            resolve(count);

                          case 5:
                          case 'end':
                            return _context2.stop();
                        }
                      }
                    }, _callee2, _this2);
                  })));
                }));

              case 5:
              case 'end':
                return _context3.stop();
            }
          }
        }, _callee3, this);
      }));

      function count() {
        return _ref.apply(this, arguments);
      }

      return count;
    }()

    /**
     * Performs an upgrade and returns the number of objects upgraded.
     * @return {number}
     */

  }, {
    key: 'upgrade',
    value: function () {
      var _ref4 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee6() {
        var _this3 = this;

        var migrationCount, _getSearchParams3, index, type, query, objectsEmitter;

        return regeneratorRuntime.wrap(function _callee6$(_context6) {
          while (1) {
            switch (_context6.prev = _context6.next) {
              case 0:
                _context6.next = 2;
                return this.count();

              case 2:
                migrationCount = _context6.sent;

                if (!(migrationCount > 0)) {
                  _context6.next = 9;
                  break;
                }

                _getSearchParams3 = this._getSearchParams(), index = _getSearchParams3.index, type = _getSearchParams3.type, query = _getSearchParams3.query;
                _context6.next = 7;
                return this.scrollSearch(index, type, query, this.scrollOptions, true);

              case 7:
                objectsEmitter = _context6.sent;
                return _context6.abrupt('return', new Promise(function (resolve, reject) {
                  var bulkBody = [];
                  var upgradeCount = 0;
                  var trackDataEvents = [];
                  objectsEmitter.on('data', function () {
                    var _ref5 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee4(objects) {
                      var _iteratorNormalCompletion2, _didIteratorError2, _iteratorError2, _iterator2, _step2, savedObject, _ref6, _index, _type, _id, _source;

                      return regeneratorRuntime.wrap(function _callee4$(_context4) {
                        while (1) {
                          switch (_context4.prev = _context4.next) {
                            case 0:
                              trackDataEvents.push(1);
                              _iteratorNormalCompletion2 = true;
                              _didIteratorError2 = false;
                              _iteratorError2 = undefined;
                              _context4.prev = 4;
                              _iterator2 = objects[Symbol.iterator]();

                            case 6:
                              if (_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done) {
                                _context4.next = 25;
                                break;
                              }

                              savedObject = _step2.value;
                              _context4.next = 10;
                              return _this3.checkOutdated(savedObject);

                            case 10:
                              if (!_context4.sent) {
                                _context4.next = 22;
                                break;
                              }

                              _context4.next = 13;
                              return _this3._upgradeObject(savedObject);

                            case 13:
                              _ref6 = _context4.sent;
                              _index = _ref6._index;
                              _type = _ref6._type;
                              _id = _ref6._id;
                              _source = _ref6._source;

                              _source[_source.type].version = _this3.newVersion;
                              bulkBody.push({
                                index: { _index: _index, _type: _type, _id: _id }
                              });
                              bulkBody.push(_source);
                              upgradeCount++; // this gets updated

                            case 22:
                              _iteratorNormalCompletion2 = true;
                              _context4.next = 6;
                              break;

                            case 25:
                              _context4.next = 31;
                              break;

                            case 27:
                              _context4.prev = 27;
                              _context4.t0 = _context4['catch'](4);
                              _didIteratorError2 = true;
                              _iteratorError2 = _context4.t0;

                            case 31:
                              _context4.prev = 31;
                              _context4.prev = 32;

                              if (!_iteratorNormalCompletion2 && _iterator2.return) {
                                _iterator2.return();
                              }

                            case 34:
                              _context4.prev = 34;

                              if (!_didIteratorError2) {
                                _context4.next = 37;
                                break;
                              }

                              throw _iteratorError2;

                            case 37:
                              return _context4.finish(34);

                            case 38:
                              return _context4.finish(31);

                            case 39:
                              trackDataEvents.pop();

                            case 40:
                            case 'end':
                              return _context4.stop();
                          }
                        }
                      }, _callee4, _this3, [[4, 27, 31, 39], [32,, 34, 38]]);
                    }));

                    return function (_x2) {
                      return _ref5.apply(this, arguments);
                    };
                  }());
                  objectsEmitter.on('error', function (error) {
                    objectsEmitter.removeAllListeners();
                    // assign null to let GC that it can be collected to reduce memory consumption
                    bulkBody = null;
                    objectsEmitter = null;
                    reject(error);
                  });
                  objectsEmitter.on('end', _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee5() {
                    return regeneratorRuntime.wrap(function _callee5$(_context5) {
                      while (1) {
                        switch (_context5.prev = _context5.next) {
                          case 0:
                            _context5.next = 2;
                            return (0, _bulk_operations.waitUntilArrayIsEmpty)(trackDataEvents);

                          case 2:
                            if (!(upgradeCount > 0)) {
                              _context5.next = 5;
                              break;
                            }

                            _context5.next = 5;
                            return _this3.executeteBulkRequest(bulkBody);

                          case 5:
                            objectsEmitter.removeAllListeners();
                            // assign null to let GC that it can be collected to reduce memory consumption
                            bulkBody = null;
                            objectsEmitter = null;
                            resolve(upgradeCount);

                          case 9:
                          case 'end':
                            return _context5.stop();
                        }
                      }
                    }, _callee5, _this3);
                  })));
                }));

              case 9:
                return _context6.abrupt('return', migrationCount);

              case 10:
              case 'end':
                return _context6.stop();
            }
          }
        }, _callee6, this);
      }));

      function upgrade() {
        return _ref4.apply(this, arguments);
      }

      return upgrade;
    }()

    /**
     * Checks if the saved object is outdated.
     * @param  {Object} savedObject
     * @return {boolean}
     */

  }, {
    key: 'checkOutdated',
    value: function () {
      var _ref8 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee7(savedObject) {
        var currentVersion;
        return regeneratorRuntime.wrap(function _callee7$(_context7) {
          while (1) {
            switch (_context7.prev = _context7.next) {
              case 0:
                currentVersion = savedObject._source[savedObject._source.type].version || 0;

                if (!(parseInt(currentVersion) < this.newVersion)) {
                  _context7.next = 5;
                  break;
                }

                _context7.next = 4;
                return this._shouldObjectUpgrade(savedObject);

              case 4:
                return _context7.abrupt('return', _context7.sent);

              case 5:
                return _context7.abrupt('return', false);

              case 6:
              case 'end':
                return _context7.stop();
            }
          }
        }, _callee7, this);
      }));

      function checkOutdated(_x3) {
        return _ref8.apply(this, arguments);
      }

      return checkOutdated;
    }()

    /**
     * Determine if the passed object require a Migration
     * @param {Object} object; Saved Object of form:
     * {
     *   _index: {String},
     *   _type: {String},
     *   _id: {String},
     *   _source: {
     *     type: {String},
     *     [type]: {Object}
     *   }
     * }
     * @return {boolean}
     */

  }, {
    key: '_shouldObjectUpgrade',
    value: function () {
      var _ref9 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee8(object) {
        return regeneratorRuntime.wrap(function _callee8$(_context8) {
          while (1) {
            switch (_context8.prev = _context8.next) {
              case 0:
                throw new Error('Every SimpleMigration must implement _shouldObjectUpgrade method.');

              case 1:
              case 'end':
                return _context8.stop();
            }
          }
        }, _callee8, this);
      }));

      function _shouldObjectUpgrade(_x4) {
        return _ref9.apply(this, arguments);
      }

      return _shouldObjectUpgrade;
    }()

    /**
     * Upgrades the passed object
     * @param {Object} object; Saved Object of form:
     * {
     *   _index: {String},
     *   _type: {String},
     *   _id: {String},
     *   _source: {
     *     type: {String},
     *     [type]: {Object}
     *   }
     * }
     * @return {Object} upgraded object
     */

  }, {
    key: '_upgradeObject',
    value: function () {
      var _ref10 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee9(object) {
        return regeneratorRuntime.wrap(function _callee9$(_context9) {
          while (1) {
            switch (_context9.prev = _context9.next) {
              case 0:
                throw new Error('Every SimpleMigration must implement _upgradeObject method.');

              case 1:
              case 'end':
                return _context9.stop();
            }
          }
        }, _callee9, this);
      }));

      function _upgradeObject(_x5) {
        return _ref10.apply(this, arguments);
      }

      return _upgradeObject;
    }()
  }, {
    key: '_getSearchParams',
    value: function _getSearchParams() {
      var params = {};
      if (this._savedObjectType) {
        if (this._searchQuery) {
          throw new Error('You may only define either _savedObjectType OR _searchQuery, Not Both!');
        }
        params.index = this._index || this.defaultIndex;
        params.type = this._type || DEFAULT_TYPE;
        params.query = {
          query: {
            match: {
              type: this._savedObjectType
            }
          }
        };
      } else if (this._searchQuery) {
        params.index = this._index || this.defaultIndex;
        params.type = this._type || DEFAULT_TYPE;
        params.query = this._searchQuery;
      } else {
        throw new Error('Every SimpleMigration must define _savedObjectType (String) or _searchQuery (Object)!');
      }
      return params;
    }
  }, {
    key: 'newVersion',
    get: function get() {
      if (!this._newVersion || !(parseInt(this._newVersion) > 0)) {
        throw new Error('Every SimpleMigration must declare a new object version (positive integer).');
      }
      return parseInt(this._newVersion);
    }
  }, {
    key: 'scrollOptions',
    get: function get() {
      return this._scrollOptions || {
        size: 100
      };
    }
  }]);

  return SimpleMigration;
}(_migration2.default);

exports.default = SimpleMigration;