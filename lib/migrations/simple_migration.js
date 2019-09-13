'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _migration = require('./migration');

var _migration2 = _interopRequireDefault(_migration);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var SimpleMigration = function (_Migration) {
  _inherits(SimpleMigration, _Migration);

  function SimpleMigration(configuration) {
    _classCallCheck(this, SimpleMigration);

    var _this = _possibleConstructorReturn(this, (SimpleMigration.__proto__ || Object.getPrototypeOf(SimpleMigration)).call(this, configuration));

    _this._defaultIndex = configuration.config.get('kibana.index');
    _this._defaultType = 'doc';

    return _this;
  }

  /**
   * @return {number}
   */


  _createClass(SimpleMigration, [{
    key: 'count',


    /**
     * Returns the number of objects that can be upgraded by this migration.
     */
    value: function () {
      var _ref = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee() {
        var _getSearchParams2, index, type, query, objects, count, i, savedObject, currentVersion;

        return regeneratorRuntime.wrap(function _callee$(_context) {
          while (1) {
            switch (_context.prev = _context.next) {
              case 0:
                _getSearchParams2 = this._getSearchParams(), index = _getSearchParams2.index, type = _getSearchParams2.type, query = _getSearchParams2.query;
                _context.next = 3;
                return this.scrollSearch(index, type, query);

              case 3:
                objects = _context.sent;
                count = 0;
                i = 0;

              case 6:
                if (!(i < objects.length)) {
                  _context.next = 17;
                  break;
                }

                savedObject = objects[i];
                currentVersion = savedObject._source[savedObject.type].version;

                if (!(parseInt(currentVersion) < this.newVersion)) {
                  _context.next = 14;
                  break;
                }

                _context.next = 12;
                return this._shouldObjectUpgrade(savedObject);

              case 12:
                if (!_context.sent) {
                  _context.next = 14;
                  break;
                }

                count++;

              case 14:
                i++;
                _context.next = 6;
                break;

              case 17:
                return _context.abrupt('return', count);

              case 18:
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
     * Performs an upgrade and returns the number of objects upgraded.
     */

  }, {
    key: 'upgrade',
    value: function () {
      var _ref2 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee2() {
        var _this2 = this;

        var migrationCount, _getSearchParams3, index, type, query, objects, bulkIndex, upgradeCount;

        return regeneratorRuntime.wrap(function _callee2$(_context2) {
          while (1) {
            switch (_context2.prev = _context2.next) {
              case 0:
                _context2.next = 2;
                return this.count();

              case 2:
                migrationCount = _context2.sent;

                if (!(migrationCount > 0)) {
                  _context2.next = 15;
                  break;
                }

                _getSearchParams3 = this._getSearchParams(), index = _getSearchParams3.index, type = _getSearchParams3.type, query = _getSearchParams3.query;
                _context2.next = 7;
                return this.scrollSearch(index, type, query, this.scrollOptions);

              case 7:
                objects = _context2.sent;
                bulkIndex = [];
                upgradeCount = 0;

                objects.forEach(function (obj) {
                  if (_this2._shouldObjectUpgrade(obj)) {
                    var _upgradeObject2 = _this2._upgradeObject(obj),
                        _index = _upgradeObject2._index,
                        _type = _upgradeObject2._type,
                        _id = _upgradeObject2._id,
                        _source = _upgradeObject2._source;

                    bulkIndex.push({
                      index: { _index: _index, _type: _type, _id: _id }
                    });
                    bulkIndex.push(_source);
                    upgradeCount++;
                  }
                });

                if (!(upgradeCount > 0)) {
                  _context2.next = 14;
                  break;
                }

                _context2.next = 14;
                return this._client.bulk({
                  refresh: true,
                  body: bulkIndex
                });

              case 14:
                return _context2.abrupt('return', upgradeCount);

              case 15:
                return _context2.abrupt('return', migrationCount);

              case 16:
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
      var _ref3 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee3(object) {
        return regeneratorRuntime.wrap(function _callee3$(_context3) {
          while (1) {
            switch (_context3.prev = _context3.next) {
              case 0:
                throw new Error('Every SimpleMigration must implement _shouldObjectUpgrade method.');

              case 1:
              case 'end':
                return _context3.stop();
            }
          }
        }, _callee3, this);
      }));

      function _shouldObjectUpgrade(_x) {
        return _ref3.apply(this, arguments);
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
      var _ref4 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee4(object) {
        return regeneratorRuntime.wrap(function _callee4$(_context4) {
          while (1) {
            switch (_context4.prev = _context4.next) {
              case 0:
                throw new Error('Every SimpleMigration must implement _upgradeObject method.');

              case 1:
              case 'end':
                return _context4.stop();
            }
          }
        }, _callee4, this);
      }));

      function _upgradeObject(_x2) {
        return _ref4.apply(this, arguments);
      }

      return _upgradeObject;
    }()
  }, {
    key: '_getSearchParams',
    value: function _getSearchParams() {
      var params = {};
      if (this._savedObjectType) {
        params.index = this._defaultIndex;
        params.type = this._defaultType;
        params.query = {
          query: {
            match: {
              type: this._savedObjectType
            }
          }
        };
      } else if (this._searchQuery) {
        params.index = this._index || this._defaultIndex;
        params.type = this._type || this._defaultType;
        params.query = this._searchQuery;
      } else {
        throw new Error('Every SimpleMigration must define _savedObjectType (String) or _searchQuery (Object)!');
      }
      return params;
    }
  }, {
    key: 'newVersion',
    get: function get() {
      if (!this._newVersion) {
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
;