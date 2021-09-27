"use strict";

require("core-js/modules/es.object.to-string.js");

require("core-js/modules/es.promise.js");

require("regenerator-runtime/runtime.js");

require("core-js/modules/es.object.freeze.js");

require("core-js/modules/es.array.for-each.js");

require("core-js/modules/web.dom-collections.for-each.js");

require("core-js/modules/es.object.keys.js");

var _expect = _interopRequireDefault(require("expect.js"));

var _sinon = _interopRequireDefault(require("sinon"));

var _simple_migration = _interopRequireDefault(require("../simple_migration"));

var _helpers = require("../../test_utils/helpers");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(_next, _throw); } }

function _asyncToGenerator(fn) { return function () { var self = this, args = arguments; return new Promise(function (resolve, reject) { var gen = fn.apply(self, args); function _next(value) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "next", value); } function _throw(err) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "throw", err); } _next(undefined); }); }; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

var DEFAULT_TYPE = 'doc';
describe('migrations', function () {
  var KIBANA_INDEX = '.siren';
  var config = {
    get: function get() {
      return KIBANA_INDEX;
    }
  };
  var client = {
    bulk: function bulk() {},
    search: function search() {},
    clearScroll: function clearScroll() {},
    scroll: function scroll() {}
  };
  var configuration = {
    index: 'index',
    client: client,
    config: config
  };
  var _index = 'index-name';
  var _type = '_doc';
  var savedObjectType = 'savedObjectType';
  var dummySavedObject = Object.freeze({
    _index: _index,
    _type: _type,
    _id: 'jnvckemkcekrmc',
    _source: _defineProperty({
      type: savedObjectType
    }, savedObjectType, {
      version: 2
    })
  });
  describe('SimpleMigration', function () {
    describe('Throws exception if', function () {
      var invalidSimpleMigration = new _simple_migration.default(configuration);
      it('newVersion not defined', function () {
        try {
          invalidSimpleMigration.newVersion;
        } catch (e) {
          return;
        }

        (0, _expect.default)().fail('Exception not thrown!');
      });
      it('_savedObjectType and _searchQuery not defined', function () {
        try {
          invalidSimpleMigration._getSearchParams();
        } catch (e) {
          return;
        }

        (0, _expect.default)().fail('Exception not thrown!');
      });
      it('_shouldObjectUpgrade not implemented', /*#__PURE__*/_asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee() {
        return regeneratorRuntime.wrap(function _callee$(_context) {
          while (1) {
            switch (_context.prev = _context.next) {
              case 0:
                _context.prev = 0;
                _context.next = 3;
                return invalidSimpleMigration._shouldObjectUpgrade(dummySavedObject);

              case 3:
                _context.next = 8;
                break;

              case 5:
                _context.prev = 5;
                _context.t0 = _context["catch"](0);
                return _context.abrupt("return");

              case 8:
                (0, _expect.default)().fail('Exception not thrown!');

              case 9:
              case "end":
                return _context.stop();
            }
          }
        }, _callee, null, [[0, 5]]);
      })));
      it('_upgradeObject not implemented', /*#__PURE__*/_asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee2() {
        return regeneratorRuntime.wrap(function _callee2$(_context2) {
          while (1) {
            switch (_context2.prev = _context2.next) {
              case 0:
                _context2.prev = 0;
                _context2.next = 3;
                return invalidSimpleMigration._upgradeObject(dummySavedObject);

              case 3:
                _context2.next = 8;
                break;

              case 5:
                _context2.prev = 5;
                _context2.t0 = _context2["catch"](0);
                return _context2.abrupt("return");

              case 8:
                (0, _expect.default)().fail('Exception not thrown!');

              case 9:
              case "end":
                return _context2.stop();
            }
          }
        }, _callee2, null, [[0, 5]]);
      })));
    });
    describe('_getSearchParams', function () {
      var simpleMigration;
      beforeEach(function () {
        simpleMigration = new _simple_migration.default(configuration);
      });
      it('throws exception if both _savedObjectType and _savedObjectType defined', function () {
        simpleMigration._savedObjectType = savedObjectType;
        simpleMigration._searchQuery = 'query';
        (0, _expect.default)(function () {
          return simpleMigration._getSearchParams();
        }).to.throwError();
      });
      describe('_savedObjectType', function () {
        beforeEach(function () {
          simpleMigration._savedObjectType = savedObjectType;
        });
        it('returns correct params', function () {
          (0, _expect.default)(simpleMigration._getSearchParams()).to.eql({
            index: KIBANA_INDEX,
            type: DEFAULT_TYPE,
            query: {
              query: {
                match: {
                  type: savedObjectType
                }
              }
            }
          });
        });
        it('custom _index, _type works', function () {
          simpleMigration._index = 'custom-index';
          simpleMigration._type = 'custom-type';
          (0, _expect.default)(simpleMigration._getSearchParams()).to.eql({
            index: 'custom-index',
            type: 'custom-type',
            query: {
              query: {
                match: {
                  type: savedObjectType
                }
              }
            }
          });
        });
      });
      describe('_searchQuery', function () {
        var query = Object.freeze({
          query: {
            match: {
              field: 'value'
            }
          }
        });
        beforeEach(function () {
          simpleMigration._searchQuery = query;
        });
        it('returns correct params', function () {
          (0, _expect.default)(simpleMigration._getSearchParams()).to.eql({
            index: KIBANA_INDEX,
            type: DEFAULT_TYPE,
            query: query
          });
        });
        it('custom _index, _type works', function () {
          simpleMigration._index = 'custom-index';
          simpleMigration._type = 'custom-type';
          (0, _expect.default)(simpleMigration._getSearchParams()).to.eql({
            index: 'custom-index',
            type: 'custom-type',
            query: query
          });
        });
      });
    });
    Object.keys(_helpers.ES_API).forEach(function (version) {
      var esApi = _helpers.ES_API[version];
      describe("ES ".concat(version, ": If count: 0"), function () {
        var search;
        var simpleMigration = new _simple_migration.default(configuration);

        var _shouldObjectUpgradeSpy = _sinon.default.spy(simpleMigration, '_shouldObjectUpgrade');

        var _upgradeObjectSpy = _sinon.default.spy(simpleMigration, '_upgradeObject');

        simpleMigration._savedObjectType = savedObjectType;
        beforeEach(function () {
          search = _sinon.default.stub(client, 'search').callsFake(function () {
            return {
              _scroll_id: "".concat(esApi, "_scroll_id"),
              hits: {
                total: (0, _helpers.formatTotalHits)(0, esApi),
                hits: []
              }
            };
          });
        });
        afterEach(function () {
          search.restore();

          _shouldObjectUpgradeSpy.resetHistory();

          _upgradeObjectSpy.resetHistory();
        });
        it('_shouldObjectUpgrade not called', /*#__PURE__*/_asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee3() {
          var count;
          return regeneratorRuntime.wrap(function _callee3$(_context3) {
            while (1) {
              switch (_context3.prev = _context3.next) {
                case 0:
                  _context3.next = 2;
                  return simpleMigration.count();

                case 2:
                  count = _context3.sent;
                  (0, _expect.default)(count).to.be(0);

                  _sinon.default.assert.notCalled(_shouldObjectUpgradeSpy);

                case 5:
                case "end":
                  return _context3.stop();
              }
            }
          }, _callee3);
        })));
        it('_upgradeObject not called', /*#__PURE__*/_asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee4() {
          var count;
          return regeneratorRuntime.wrap(function _callee4$(_context4) {
            while (1) {
              switch (_context4.prev = _context4.next) {
                case 0:
                  _context4.next = 2;
                  return simpleMigration.upgrade();

                case 2:
                  count = _context4.sent;
                  (0, _expect.default)(count).to.be(0);

                  _sinon.default.assert.notCalled(_upgradeObjectSpy);

                case 5:
                case "end":
                  return _context4.stop();
              }
            }
          }, _callee4);
        })));
      });
      describe("ES ".concat(version, ": If object version > newVersion"), function () {
        var search;
        var simpleMigration = new _simple_migration.default(configuration);
        simpleMigration._newVersion = 1;

        var _shouldObjectUpgradeSpy = _sinon.default.spy(simpleMigration, '_shouldObjectUpgrade');

        var _upgradeObjectSpy = _sinon.default.spy(simpleMigration, '_upgradeObject');

        simpleMigration._savedObjectType = savedObjectType;
        beforeEach(function () {
          search = _sinon.default.stub(client, 'search').callsFake(function () {
            return {
              _scroll_id: "".concat(esApi, "_scroll_id"),
              hits: {
                total: (0, _helpers.formatTotalHits)(1, esApi),
                hits: [dummySavedObject]
              }
            };
          });
        });
        afterEach(function () {
          search.restore();

          _shouldObjectUpgradeSpy.resetHistory();

          _upgradeObjectSpy.resetHistory();
        });
        it('_shouldObjectUpgrade not called', /*#__PURE__*/_asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee5() {
          var count;
          return regeneratorRuntime.wrap(function _callee5$(_context5) {
            while (1) {
              switch (_context5.prev = _context5.next) {
                case 0:
                  _context5.next = 2;
                  return simpleMigration.count();

                case 2:
                  count = _context5.sent;
                  (0, _expect.default)(count).to.be(0);

                  _sinon.default.assert.notCalled(_shouldObjectUpgradeSpy);

                case 5:
                case "end":
                  return _context5.stop();
              }
            }
          }, _callee5);
        })));
        it('_upgradeObject not called', /*#__PURE__*/_asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee6() {
          var count;
          return regeneratorRuntime.wrap(function _callee6$(_context6) {
            while (1) {
              switch (_context6.prev = _context6.next) {
                case 0:
                  _context6.next = 2;
                  return simpleMigration.upgrade();

                case 2:
                  count = _context6.sent;
                  (0, _expect.default)(count).to.be(0);

                  _sinon.default.assert.notCalled(_upgradeObjectSpy);

                case 5:
                case "end":
                  return _context6.stop();
              }
            }
          }, _callee6);
        })));
      });
    });
  });
});