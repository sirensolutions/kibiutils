'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _migration = require('./migration');

var _migration2 = _interopRequireDefault(_migration);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

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

    _this._defaultIndex = configuration.config.get('kibana.index');
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
      var _ref = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee() {
        var _getSearchParams2, index, type, query, objects, count, _iteratorNormalCompletion, _didIteratorError, _iteratorError, _iterator, _step, savedObject;

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
                _iteratorNormalCompletion = true;
                _didIteratorError = false;
                _iteratorError = undefined;
                _context.prev = 8;
                _iterator = objects[Symbol.iterator]();

              case 10:
                if (_iteratorNormalCompletion = (_step = _iterator.next()).done) {
                  _context.next = 19;
                  break;
                }

                savedObject = _step.value;
                _context.next = 14;
                return this.checkOutdated(savedObject);

              case 14:
                if (!_context.sent) {
                  _context.next = 16;
                  break;
                }

                count++;

              case 16:
                _iteratorNormalCompletion = true;
                _context.next = 10;
                break;

              case 19:
                _context.next = 25;
                break;

              case 21:
                _context.prev = 21;
                _context.t0 = _context['catch'](8);
                _didIteratorError = true;
                _iteratorError = _context.t0;

              case 25:
                _context.prev = 25;
                _context.prev = 26;

                if (!_iteratorNormalCompletion && _iterator.return) {
                  _iterator.return();
                }

              case 28:
                _context.prev = 28;

                if (!_didIteratorError) {
                  _context.next = 31;
                  break;
                }

                throw _iteratorError;

              case 31:
                return _context.finish(28);

              case 32:
                return _context.finish(25);

              case 33:
                return _context.abrupt('return', count);

              case 34:
              case 'end':
                return _context.stop();
            }
          }
        }, _callee, this, [[8, 21, 25, 33], [26,, 28, 32]]);
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
      var _ref2 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee2() {
        var migrationCount, _getSearchParams3, index, type, query, objects, bulkBody, upgradeCount, bulkAction, _iteratorNormalCompletion2, _didIteratorError2, _iteratorError2, _iterator2, _step2, savedObject, _ref3, _index, _type, _id, _source;

        return regeneratorRuntime.wrap(function _callee2$(_context2) {
          while (1) {
            switch (_context2.prev = _context2.next) {
              case 0:
                _context2.next = 2;
                return this.count();

              case 2:
                migrationCount = _context2.sent;

                if (!(migrationCount > 0)) {
                  _context2.next = 53;
                  break;
                }

                _getSearchParams3 = this._getSearchParams(), index = _getSearchParams3.index, type = _getSearchParams3.type, query = _getSearchParams3.query;
                _context2.next = 7;
                return this.scrollSearch(index, type, query, this.scrollOptions);

              case 7:
                objects = _context2.sent;
                bulkBody = [];
                upgradeCount = 0;
                bulkAction = 'index';
                _iteratorNormalCompletion2 = true;
                _didIteratorError2 = false;
                _iteratorError2 = undefined;
                _context2.prev = 14;
                _iterator2 = objects[Symbol.iterator]();

              case 16:
                if (_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done) {
                  _context2.next = 35;
                  break;
                }

                savedObject = _step2.value;
                _context2.next = 20;
                return this.checkOutdated(savedObject);

              case 20:
                if (!_context2.sent) {
                  _context2.next = 32;
                  break;
                }

                _context2.next = 23;
                return this._upgradeObject(savedObject);

              case 23:
                _ref3 = _context2.sent;
                _index = _ref3._index;
                _type = _ref3._type;
                _id = _ref3._id;
                _source = _ref3._source;

                _source[_source.type].version = this.newVersion;
                bulkBody.push(_defineProperty({}, bulkAction, { _index: _index, _type: _type, _id: _id }));
                bulkBody.push(_source);
                upgradeCount++;

              case 32:
                _iteratorNormalCompletion2 = true;
                _context2.next = 16;
                break;

              case 35:
                _context2.next = 41;
                break;

              case 37:
                _context2.prev = 37;
                _context2.t0 = _context2['catch'](14);
                _didIteratorError2 = true;
                _iteratorError2 = _context2.t0;

              case 41:
                _context2.prev = 41;
                _context2.prev = 42;

                if (!_iteratorNormalCompletion2 && _iterator2.return) {
                  _iterator2.return();
                }

              case 44:
                _context2.prev = 44;

                if (!_didIteratorError2) {
                  _context2.next = 47;
                  break;
                }

                throw _iteratorError2;

              case 47:
                return _context2.finish(44);

              case 48:
                return _context2.finish(41);

              case 49:
                if (!(upgradeCount > 0)) {
                  _context2.next = 52;
                  break;
                }

                _context2.next = 52;
                return this._client.bulk({
                  refresh: true,
                  body: bulkBody
                });

              case 52:
                return _context2.abrupt('return', upgradeCount);

              case 53:
                return _context2.abrupt('return', migrationCount);

              case 54:
              case 'end':
                return _context2.stop();
            }
          }
        }, _callee2, this, [[14, 37, 41, 49], [42,, 44, 48]]);
      }));

      function upgrade() {
        return _ref2.apply(this, arguments);
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
      var _ref4 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee3(savedObject) {
        var currentVersion;
        return regeneratorRuntime.wrap(function _callee3$(_context3) {
          while (1) {
            switch (_context3.prev = _context3.next) {
              case 0:
                currentVersion = savedObject._source[savedObject._source.type].version || 0;

                if (!(parseInt(currentVersion) < this.newVersion)) {
                  _context3.next = 5;
                  break;
                }

                _context3.next = 4;
                return this._shouldObjectUpgrade(savedObject);

              case 4:
                return _context3.abrupt('return', _context3.sent);

              case 5:
                return _context3.abrupt('return', false);

              case 6:
              case 'end':
                return _context3.stop();
            }
          }
        }, _callee3, this);
      }));

      function checkOutdated(_x) {
        return _ref4.apply(this, arguments);
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
      var _ref5 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee4(object) {
        return regeneratorRuntime.wrap(function _callee4$(_context4) {
          while (1) {
            switch (_context4.prev = _context4.next) {
              case 0:
                throw new Error('Every SimpleMigration must implement _shouldObjectUpgrade method.');

              case 1:
              case 'end':
                return _context4.stop();
            }
          }
        }, _callee4, this);
      }));

      function _shouldObjectUpgrade(_x2) {
        return _ref5.apply(this, arguments);
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
      var _ref6 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee5(object) {
        return regeneratorRuntime.wrap(function _callee5$(_context5) {
          while (1) {
            switch (_context5.prev = _context5.next) {
              case 0:
                throw new Error('Every SimpleMigration must implement _upgradeObject method.');

              case 1:
              case 'end':
                return _context5.stop();
            }
          }
        }, _callee5, this);
      }));

      function _upgradeObject(_x3) {
        return _ref6.apply(this, arguments);
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