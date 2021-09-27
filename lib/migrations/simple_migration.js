"use strict";

function _typeof(obj) { "@babel/helpers - typeof"; if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

require("core-js/modules/es.reflect.construct.js");

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

require("core-js/modules/es.parse-int.js");

require("core-js/modules/es.object.to-string.js");

require("core-js/modules/es.promise.js");

require("core-js/modules/es.object.set-prototype-of.js");

require("core-js/modules/es.object.get-prototype-of.js");

var _migration = _interopRequireDefault(require("./migration"));

var _bulk_operations = require("./lib/bulk_operations");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _createForOfIteratorHelper(o, allowArrayLike) { var it = typeof Symbol !== "undefined" && o[Symbol.iterator] || o["@@iterator"]; if (!it) { if (Array.isArray(o) || (it = _unsupportedIterableToArray(o)) || allowArrayLike && o && typeof o.length === "number") { if (it) o = it; var i = 0; var F = function F() {}; return { s: F, n: function n() { if (i >= o.length) return { done: true }; return { done: false, value: o[i++] }; }, e: function e(_e) { throw _e; }, f: F }; } throw new TypeError("Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); } var normalCompletion = true, didErr = false, err; return { s: function s() { it = it.call(o); }, n: function n() { var step = it.next(); normalCompletion = step.done; return step; }, e: function e(_e2) { didErr = true; err = _e2; }, f: function f() { try { if (!normalCompletion && it.return != null) it.return(); } finally { if (didErr) throw err; } } }; }

function _unsupportedIterableToArray(o, minLen) { if (!o) return; if (typeof o === "string") return _arrayLikeToArray(o, minLen); var n = Object.prototype.toString.call(o).slice(8, -1); if (n === "Object" && o.constructor) n = o.constructor.name; if (n === "Map" || n === "Set") return Array.from(o); if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen); }

function _arrayLikeToArray(arr, len) { if (len == null || len > arr.length) len = arr.length; for (var i = 0, arr2 = new Array(len); i < len; i++) { arr2[i] = arr[i]; } return arr2; }

function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(_next, _throw); } }

function _asyncToGenerator(fn) { return function () { var self = this, args = arguments; return new Promise(function (resolve, reject) { var gen = fn.apply(self, args); function _next(value) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "next", value); } function _throw(err) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "throw", err); } _next(undefined); }); }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function"); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, writable: true, configurable: true } }); if (superClass) _setPrototypeOf(subClass, superClass); }

function _setPrototypeOf(o, p) { _setPrototypeOf = Object.setPrototypeOf || function _setPrototypeOf(o, p) { o.__proto__ = p; return o; }; return _setPrototypeOf(o, p); }

function _createSuper(Derived) { var hasNativeReflectConstruct = _isNativeReflectConstruct(); return function _createSuperInternal() { var Super = _getPrototypeOf(Derived), result; if (hasNativeReflectConstruct) { var NewTarget = _getPrototypeOf(this).constructor; result = Reflect.construct(Super, arguments, NewTarget); } else { result = Super.apply(this, arguments); } return _possibleConstructorReturn(this, result); }; }

function _possibleConstructorReturn(self, call) { if (call && (_typeof(call) === "object" || typeof call === "function")) { return call; } else if (call !== void 0) { throw new TypeError("Derived constructors may only return object or undefined"); } return _assertThisInitialized(self); }

function _assertThisInitialized(self) { if (self === void 0) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return self; }

function _isNativeReflectConstruct() { if (typeof Reflect === "undefined" || !Reflect.construct) return false; if (Reflect.construct.sham) return false; if (typeof Proxy === "function") return true; try { Boolean.prototype.valueOf.call(Reflect.construct(Boolean, [], function () {})); return true; } catch (e) { return false; } }

function _getPrototypeOf(o) { _getPrototypeOf = Object.setPrototypeOf ? Object.getPrototypeOf : function _getPrototypeOf(o) { return o.__proto__ || Object.getPrototypeOf(o); }; return _getPrototypeOf(o); }

var DEFAULT_TYPE = 'doc';

/**
 * SimpleMigration requires you to declare _savedObjectType OR _searchQuery, _newVersion, _index (optional), _type (optional),
 * in constructor and two methods: _shouldObjectUpgrade and _upgradeObject which would be passed the objects by
 * the base class to count and upgrade objects if the version is < _newVersion.
 *
 * Warning: Every new migration should bump the saved object's Version (defined by _newVersion, positive integer).
 */
var SimpleMigration = /*#__PURE__*/function (_Migration) {
  _inherits(SimpleMigration, _Migration);

  var _super = _createSuper(SimpleMigration);

  function SimpleMigration(configuration) {
    var _this;

    _classCallCheck(this, SimpleMigration);

    _this = _super.call(this, configuration);
    _this._defaultIndex = configuration.config.get('kibana.index');
    return _this;
  }
  /**
   * @return {number}
   */


  _createClass(SimpleMigration, [{
    key: "newVersion",
    get: function get() {
      if (!this._newVersion || !(parseInt(this._newVersion) > 0)) {
        throw new Error('Every SimpleMigration must declare a new object version (positive integer).');
      }

      return parseInt(this._newVersion);
    }
  }, {
    key: "scrollOptions",
    get: function get() {
      return this._scrollOptions || {
        size: 100
      };
    }
    /**
     * Returns the number of objects that can be upgraded by this migration.
     * @return {number}
     */

  }, {
    key: "count",
    value: function () {
      var _count = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee3() {
        var _this2 = this;

        var _this$_getSearchParam, index, type, query, objectsEmitter;

        return regeneratorRuntime.wrap(function _callee3$(_context3) {
          while (1) {
            switch (_context3.prev = _context3.next) {
              case 0:
                _this$_getSearchParam = this._getSearchParams(), index = _this$_getSearchParam.index, type = _this$_getSearchParam.type, query = _this$_getSearchParam.query;
                _context3.next = 3;
                return this.scrollSearch(index, type, query, {}, true);

              case 3:
                objectsEmitter = _context3.sent;
                return _context3.abrupt("return", new Promise(function (resolve, reject) {
                  var trackDataEvents = [];
                  var count = 0;
                  objectsEmitter.on('data', /*#__PURE__*/function () {
                    var _ref = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee(objects) {
                      var _iterator, _step, savedObject;

                      return regeneratorRuntime.wrap(function _callee$(_context) {
                        while (1) {
                          switch (_context.prev = _context.next) {
                            case 0:
                              trackDataEvents.push(1);
                              _iterator = _createForOfIteratorHelper(objects);
                              _context.prev = 2;

                              _iterator.s();

                            case 4:
                              if ((_step = _iterator.n()).done) {
                                _context.next = 12;
                                break;
                              }

                              savedObject = _step.value;
                              _context.next = 8;
                              return _this2.checkOutdated(savedObject);

                            case 8:
                              if (!_context.sent) {
                                _context.next = 10;
                                break;
                              }

                              count++;

                            case 10:
                              _context.next = 4;
                              break;

                            case 12:
                              _context.next = 17;
                              break;

                            case 14:
                              _context.prev = 14;
                              _context.t0 = _context["catch"](2);

                              _iterator.e(_context.t0);

                            case 17:
                              _context.prev = 17;

                              _iterator.f();

                              return _context.finish(17);

                            case 20:
                              // assign null to let GC that it can be collected to reduce memory consumption
                              objects = null;
                              trackDataEvents.pop();

                            case 22:
                            case "end":
                              return _context.stop();
                          }
                        }
                      }, _callee, null, [[2, 14, 17, 20]]);
                    }));

                    return function (_x) {
                      return _ref.apply(this, arguments);
                    };
                  }());
                  objectsEmitter.on('error', function (error) {
                    objectsEmitter.removeAllListeners(); // assign null to let GC that it can be collected to reduce memory consumption

                    // assign null to let GC that it can be collected to reduce memory consumption
                    objectsEmitter = null;
                    reject(error);
                  });
                  objectsEmitter.on('end', /*#__PURE__*/_asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee2() {
                    return regeneratorRuntime.wrap(function _callee2$(_context2) {
                      while (1) {
                        switch (_context2.prev = _context2.next) {
                          case 0:
                            _context2.next = 2;
                            return (0, _bulk_operations.waitUntilArrayIsEmpty)(trackDataEvents);

                          case 2:
                            objectsEmitter.removeAllListeners(); // assign null to let GC that it can be collected to reduce memory consumption

                            // assign null to let GC that it can be collected to reduce memory consumption
                            objectsEmitter = null;
                            resolve(count);

                          case 5:
                          case "end":
                            return _context2.stop();
                        }
                      }
                    }, _callee2);
                  })));
                }));

              case 5:
              case "end":
                return _context3.stop();
            }
          }
        }, _callee3, this);
      }));

      function count() {
        return _count.apply(this, arguments);
      }

      return count;
    }()
    /**
     * Performs an upgrade and returns the number of objects upgraded.
     * @return {number}
     */

  }, {
    key: "upgrade",
    value: function () {
      var _upgrade = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee6() {
        var _this3 = this;

        var migrationCount, _this$_getSearchParam2, index, type, query, objectsEmitter;

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

                _this$_getSearchParam2 = this._getSearchParams(), index = _this$_getSearchParam2.index, type = _this$_getSearchParam2.type, query = _this$_getSearchParam2.query;
                _context6.next = 7;
                return this.scrollSearch(index, type, query, this.scrollOptions, true);

              case 7:
                objectsEmitter = _context6.sent;
                return _context6.abrupt("return", new Promise(function (resolve, reject) {
                  var bulkBody = [];
                  var upgradeCount = 0;
                  var trackDataEvents = [];
                  objectsEmitter.on('data', /*#__PURE__*/function () {
                    var _ref3 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee4(objects) {
                      var _iterator2, _step2, savedObject, _yield$_this3$_upgrad, _index, _type, _id, _source;

                      return regeneratorRuntime.wrap(function _callee4$(_context4) {
                        while (1) {
                          switch (_context4.prev = _context4.next) {
                            case 0:
                              trackDataEvents.push(1);
                              _iterator2 = _createForOfIteratorHelper(objects);
                              _context4.prev = 2;

                              _iterator2.s();

                            case 4:
                              if ((_step2 = _iterator2.n()).done) {
                                _context4.next = 22;
                                break;
                              }

                              savedObject = _step2.value;
                              _context4.next = 8;
                              return _this3.checkOutdated(savedObject);

                            case 8:
                              if (!_context4.sent) {
                                _context4.next = 20;
                                break;
                              }

                              _context4.next = 11;
                              return _this3._upgradeObject(savedObject);

                            case 11:
                              _yield$_this3$_upgrad = _context4.sent;
                              _index = _yield$_this3$_upgrad._index;
                              _type = _yield$_this3$_upgrad._type;
                              _id = _yield$_this3$_upgrad._id;
                              _source = _yield$_this3$_upgrad._source;
                              _source[_source.type].version = _this3.newVersion;
                              bulkBody.push({
                                index: {
                                  _index: _index,
                                  _type: _type,
                                  _id: _id
                                }
                              });
                              bulkBody.push(_source);
                              upgradeCount++; // this gets updated

                            case 20:
                              _context4.next = 4;
                              break;

                            case 22:
                              _context4.next = 27;
                              break;

                            case 24:
                              _context4.prev = 24;
                              _context4.t0 = _context4["catch"](2);

                              _iterator2.e(_context4.t0);

                            case 27:
                              _context4.prev = 27;

                              _iterator2.f();

                              return _context4.finish(27);

                            case 30:
                              trackDataEvents.pop();

                            case 31:
                            case "end":
                              return _context4.stop();
                          }
                        }
                      }, _callee4, null, [[2, 24, 27, 30]]);
                    }));

                    return function (_x2) {
                      return _ref3.apply(this, arguments);
                    };
                  }());
                  objectsEmitter.on('error', function (error) {
                    objectsEmitter.removeAllListeners(); // assign null to let GC that it can be collected to reduce memory consumption

                    // assign null to let GC that it can be collected to reduce memory consumption
                    bulkBody = null;
                    objectsEmitter = null;
                    reject(error);
                  });
                  objectsEmitter.on('end', /*#__PURE__*/_asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee5() {
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
                            objectsEmitter.removeAllListeners(); // assign null to let GC that it can be collected to reduce memory consumption

                            // assign null to let GC that it can be collected to reduce memory consumption
                            bulkBody = null;
                            objectsEmitter = null;
                            resolve(upgradeCount);

                          case 9:
                          case "end":
                            return _context5.stop();
                        }
                      }
                    }, _callee5);
                  })));
                }));

              case 9:
                return _context6.abrupt("return", migrationCount);

              case 10:
              case "end":
                return _context6.stop();
            }
          }
        }, _callee6, this);
      }));

      function upgrade() {
        return _upgrade.apply(this, arguments);
      }

      return upgrade;
    }()
    /**
     * Checks if the saved object is outdated.
     * @param  {Object} savedObject
     * @return {boolean}
     */

  }, {
    key: "checkOutdated",
    value: function () {
      var _checkOutdated = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee7(savedObject) {
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
                return _context7.abrupt("return", _context7.sent);

              case 5:
                return _context7.abrupt("return", false);

              case 6:
              case "end":
                return _context7.stop();
            }
          }
        }, _callee7, this);
      }));

      function checkOutdated(_x3) {
        return _checkOutdated.apply(this, arguments);
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
    key: "_shouldObjectUpgrade",
    value: function () {
      var _shouldObjectUpgrade2 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee8(object) {
        return regeneratorRuntime.wrap(function _callee8$(_context8) {
          while (1) {
            switch (_context8.prev = _context8.next) {
              case 0:
                throw new Error('Every SimpleMigration must implement _shouldObjectUpgrade method.');

              case 1:
              case "end":
                return _context8.stop();
            }
          }
        }, _callee8);
      }));

      function _shouldObjectUpgrade(_x4) {
        return _shouldObjectUpgrade2.apply(this, arguments);
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
    key: "_upgradeObject",
    value: function () {
      var _upgradeObject2 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee9(object) {
        return regeneratorRuntime.wrap(function _callee9$(_context9) {
          while (1) {
            switch (_context9.prev = _context9.next) {
              case 0:
                throw new Error('Every SimpleMigration must implement _upgradeObject method.');

              case 1:
              case "end":
                return _context9.stop();
            }
          }
        }, _callee9);
      }));

      function _upgradeObject(_x5) {
        return _upgradeObject2.apply(this, arguments);
      }

      return _upgradeObject;
    }()
  }, {
    key: "_getSearchParams",
    value: function _getSearchParams() {
      var params = {};

      if (this._savedObjectType) {
        if (this._searchQuery) {
          throw new Error('You may only define either _savedObjectType OR _searchQuery, Not Both!');
        }

        params.index = this._index || this._defaultIndex;
        params.type = this._type || DEFAULT_TYPE;
        params.query = {
          query: {
            match: {
              type: this._savedObjectType
            }
          }
        };
      } else if (this._searchQuery) {
        params.index = this._index || this._defaultIndex;
        params.type = this._type || DEFAULT_TYPE;
        params.query = this._searchQuery;
      } else {
        throw new Error('Every SimpleMigration must define _savedObjectType (String) or _searchQuery (Object)!');
      }

      return params;
    }
  }]);

  return SimpleMigration;
}(_migration.default);

exports.default = SimpleMigration;
module.exports = exports.default;