'use strict';

var _expect = require('expect.js');

var _expect2 = _interopRequireDefault(_expect);

var _sinon = require('sinon');

var _sinon2 = _interopRequireDefault(_sinon);

var _migration = require('../migration');

var _migration2 = _interopRequireDefault(_migration);

var _helpers = require('../../test_utils/helpers');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; }

describe('migrations', function () {

  describe('Migration', function () {

    var client = {
      search: function search() {},
      scroll: function scroll() {},
      clearScroll: function clearScroll() {},
      count: function count() {}
    };
    var configuration = {
      index: 'index',
      client: client
    };

    it('should check arguments at instantiation time', function () {
      (0, _expect2.default)(function () {
        return new _migration2.default();
      }).to.throwError();
      (0, _expect2.default)(function () {
        return new _migration2.default(configuration);
      }).not.to.throwError();
    });
    describe('countHits', function () {
      var _this = this;

      before(function () {
        _sinon2.default.stub(client, 'count');
      });

      it('should return 0 if index not present', _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee() {
        var migration, index, type, query, result;
        return regeneratorRuntime.wrap(function _callee$(_context) {
          while (1) {
            switch (_context.prev = _context.next) {
              case 0:
                migration = new _migration2.default(configuration);
                index = 'index';
                type = 'type';
                query = {
                  query: {
                    match_all: {}
                  }
                };

                client.count.returns({ status: 404 });

                _context.next = 7;
                return migration.countHits(index, type, query);

              case 7:
                result = _context.sent;


                (0, _expect2.default)(result).to.be(0);
                (0, _expect2.default)(client.count.calledWith({
                  index: index,
                  type: type,
                  body: query,
                  ignore_unavailable: true,
                  ignore: [404]
                }));

              case 10:
              case 'end':
                return _context.stop();
            }
          }
        }, _callee, _this);
      })));

      it('should build the correct query and return the result', _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee2() {
        var migration, index, type, query, result;
        return regeneratorRuntime.wrap(function _callee2$(_context2) {
          while (1) {
            switch (_context2.prev = _context2.next) {
              case 0:
                migration = new _migration2.default(configuration);
                index = 'index';
                type = 'type';
                query = {
                  query: {
                    match_all: {}
                  }
                };

                client.count.returns({ count: 15 });

                _context2.next = 7;
                return migration.countHits(index, type, query);

              case 7:
                result = _context2.sent;


                (0, _expect2.default)(result).to.be(15);
                (0, _expect2.default)(client.count.calledWith({
                  index: index,
                  type: type,
                  body: query,
                  ignore_unavailable: true,
                  ignore: [404]
                }));

              case 10:
              case 'end':
                return _context2.stop();
            }
          }
        }, _callee2, _this);
      })));

      afterEach(function () {
        client.count.reset();
      });

      after(function () {
        client.count.restore();
      });
    });

    Object.keys(_helpers.ES_API).forEach(function (version) {
      var esApi = _helpers.ES_API[version];
      describe('ES ' + version + ': scrollSearch', function () {
        var _this2 = this;

        var search = void 0;
        var scroll = void 0;
        var clearScroll = void 0;

        beforeEach(function () {
          search = _sinon2.default.stub(client, 'search').callsFake(function (searchOptions) {
            if (searchOptions.index === 'empty') {
              return {
                _scroll_id: esApi + '_scroll_id',
                hits: {
                  total: (0, _helpers.formatTotalHits)(0, esApi),
                  hits: []
                }
              };
            }

            return {
              _scroll_id: esApi + '_scroll_id',
              hits: {
                total: (0, _helpers.formatTotalHits)(100, esApi),
                hits: new Array(10)
              }
            };
          });

          scroll = _sinon2.default.stub(client, 'scroll').callsFake(function (scrollOptions) {
            return {
              _scroll_id: scrollOptions.body.scroll_id,
              hits: {
                total: (0, _helpers.formatTotalHits)(100, esApi),
                hits: new Array(10)
              }
            };
          });

          clearScroll = _sinon2.default.stub(client, 'clearScroll').callsFake(function () {
            return { succeeded: true };
          });
        });

        it('should set default options if options have not been defined', _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee3() {
          var migration;
          return regeneratorRuntime.wrap(function _callee3$(_context3) {
            while (1) {
              switch (_context3.prev = _context3.next) {
                case 0:
                  migration = new _migration2.default(configuration);
                  _context3.next = 3;
                  return migration.scrollSearch('empty', 'type', {});

                case 3:

                  _sinon2.default.assert.calledOnce(search);
                  _sinon2.default.assert.alwaysCalledWith(search, _sinon2.default.match({ size: 100 }));

                case 5:
                case 'end':
                  return _context3.stop();
              }
            }
          }, _callee3, _this2);
        })));

        it('should set a default size if no size has been specified', _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee4() {
          var migration;
          return regeneratorRuntime.wrap(function _callee4$(_context4) {
            while (1) {
              switch (_context4.prev = _context4.next) {
                case 0:
                  migration = new _migration2.default(configuration);
                  _context4.next = 3;
                  return migration.scrollSearch('empty', 'type', {}, {});

                case 3:

                  _sinon2.default.assert.calledOnce(search);
                  _sinon2.default.assert.alwaysCalledWith(search, _sinon2.default.match({ size: 100 }));

                case 5:
                case 'end':
                  return _context4.stop();
              }
            }
          }, _callee4, _this2);
        })));

        it('should use the specified size', _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee5() {
          var migration;
          return regeneratorRuntime.wrap(function _callee5$(_context5) {
            while (1) {
              switch (_context5.prev = _context5.next) {
                case 0:
                  migration = new _migration2.default(configuration);
                  _context5.next = 3;
                  return migration.scrollSearch('empty', 'type', {}, { size: 1000 });

                case 3:

                  _sinon2.default.assert.calledOnce(search);
                  _sinon2.default.assert.alwaysCalledWith(search, _sinon2.default.match({ size: 1000 }));

                case 5:
                case 'end':
                  return _context5.stop();
              }
            }
          }, _callee5, _this2);
        })));

        it('should use the scroll API to fetch hits', _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee6() {
          var migration, index, type, query, options, results, i;
          return regeneratorRuntime.wrap(function _callee6$(_context6) {
            while (1) {
              switch (_context6.prev = _context6.next) {
                case 0:
                  migration = new _migration2.default(configuration);
                  index = 'index';
                  type = 'type';
                  query = {
                    query: {
                      match_all: {}
                    }
                  };
                  options = {
                    size: 10
                  };
                  _context6.next = 7;
                  return migration.scrollSearch(index, type, query, options);

                case 7:
                  results = _context6.sent;


                  _sinon2.default.assert.calledOnce(search);
                  _sinon2.default.assert.alwaysCalledWith(search, {
                    index: index,
                    type: type,
                    scroll: '1m',
                    size: options.size,
                    body: query
                  });

                  (0, _expect2.default)(scroll.callCount).to.be(9);
                  for (i = 0; i < scroll.callCount; i++) {
                    (0, _expect2.default)(scroll.getCall(i).args[0]).to.eql({
                      body: {
                        scroll: '1m',
                        scroll_id: esApi + '_scroll_id'
                      }
                    });
                  }

                  (0, _expect2.default)(clearScroll.callCount).to.be(1);
                  (0, _expect2.default)(clearScroll.getCall(0).args[0]).to.eql({
                    body: {
                      scroll_id: esApi + '_scroll_id'
                    }
                  });

                  (0, _expect2.default)(results.length).to.be(100);

                case 15:
                case 'end':
                  return _context6.stop();
              }
            }
          }, _callee6, _this2);
        })));

        afterEach(function () {
          _sinon2.default.restore();
        });
      });
    });
  });
});