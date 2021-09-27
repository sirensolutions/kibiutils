"use strict";

require("core-js/modules/es.array.for-each.js");

require("core-js/modules/web.dom-collections.for-each.js");

require("core-js/modules/es.object.keys.js");

require("core-js/modules/es.regexp.exec.js");

require("core-js/modules/es.string.match.js");

require("core-js/modules/es.object.to-string.js");

require("core-js/modules/es.promise.js");

require("regenerator-runtime/runtime.js");

var _expect = _interopRequireDefault(require("expect.js"));

var _sinon = _interopRequireDefault(require("sinon"));

var _migration = _interopRequireDefault(require("../migration"));

var _helpers = require("../../test_utils/helpers");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(_next, _throw); } }

function _asyncToGenerator(fn) { return function () { var self = this, args = arguments; return new Promise(function (resolve, reject) { var gen = fn.apply(self, args); function _next(value) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "next", value); } function _throw(err) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "throw", err); } _next(undefined); }); }; }

describe('migrations', function () {
  describe('Migration', function () {
    var client = {
      bulk: function bulk() {},
      search: function search() {},
      scroll: function scroll() {},
      clearScroll: function clearScroll() {},
      count: function count() {
        return {
          count: 15
        };
      }
    };
    var configuration = {
      index: 'index',
      client: client
    };
    afterEach(function () {
      _sinon.default.restore();
    });
    it('should check arguments at instantiation time', function () {
      (0, _expect.default)(function () {
        return new _migration.default();
      }).to.throwError();
      (0, _expect.default)(function () {
        return new _migration.default(configuration);
      }).not.to.throwError();
    });
    describe('bulk', function () {
      var bulkSpy;
      beforeEach(function () {
        bulkSpy = _sinon.default.spy(client, 'bulk');
      });
      it('should throw when incorrect bulk body detected - missing payload row', /*#__PURE__*/_asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee() {
        var migration, batchOperationNumber;
        return regeneratorRuntime.wrap(function _callee$(_context) {
          while (1) {
            switch (_context.prev = _context.next) {
              case 0:
                migration = new _migration.default(configuration);
                batchOperationNumber = 1;
                _context.prev = 2;
                _context.next = 5;
                return migration.executeteBulkRequest([{
                  index: {
                    _index: '.siren',
                    _id: '1'
                  }
                }, {
                  index: {
                    _index: '.siren',
                    _id: '2'
                  }
                }, {
                  field1: 'value2'
                }], batchOperationNumber);

              case 5:
                (0, _expect.default)('Should throw').to.equal(false);
                _context.next = 12;
                break;

              case 8:
                _context.prev = 8;
                _context.t0 = _context["catch"](2);

                _sinon.default.assert.notCalled(bulkSpy);

                (0, _expect.default)(_context.t0.message).to.equal('Incorrect bulk body expected payload row at index 1 but got: {"index":{"_index":".siren","_id":"2"}}');

              case 12:
              case "end":
                return _context.stop();
            }
          }
        }, _callee, null, [[2, 8]]);
      })));
      it('should throw when incorrect bulk body detected - extra payload row', /*#__PURE__*/_asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee2() {
        var migration, batchOperationNumber;
        return regeneratorRuntime.wrap(function _callee2$(_context2) {
          while (1) {
            switch (_context2.prev = _context2.next) {
              case 0:
                migration = new _migration.default(configuration);
                batchOperationNumber = 2;
                _context2.prev = 2;
                _context2.next = 5;
                return migration.executeteBulkRequest([{
                  index: {
                    _index: '.siren',
                    _id: '1'
                  }
                }, {
                  field1: 'value1'
                }, {
                  field1: 'value7'
                }, {
                  index: {
                    _index: '.siren',
                    _id: '2'
                  }
                }, {
                  field1: 'value2'
                }], batchOperationNumber);

              case 5:
                (0, _expect.default)('Should throw').to.equal(false);
                _context2.next = 12;
                break;

              case 8:
                _context2.prev = 8;
                _context2.t0 = _context2["catch"](2);

                _sinon.default.assert.notCalled(bulkSpy);

                (0, _expect.default)(_context2.t0.message).to.equal('Incorrect bulk body expected meta row at index 2 but got: {"field1":"value7"}');

              case 12:
              case "end":
                return _context2.stop();
            }
          }
        }, _callee2, null, [[2, 8]]);
      })));
      it('should throw when incorrect bulk body detected - missing payload at the end', /*#__PURE__*/_asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee3() {
        var migration, batchOperationNumber;
        return regeneratorRuntime.wrap(function _callee3$(_context3) {
          while (1) {
            switch (_context3.prev = _context3.next) {
              case 0:
                migration = new _migration.default(configuration);
                batchOperationNumber = 2;
                _context3.prev = 2;
                _context3.next = 5;
                return migration.executeteBulkRequest([{
                  index: {
                    _index: '.siren',
                    _id: '1'
                  }
                }, {
                  field1: 'value1'
                }, {
                  index: {
                    _index: '.siren',
                    _id: '2'
                  }
                }], batchOperationNumber);

              case 5:
                (0, _expect.default)('Should throw').to.equal(false);
                _context3.next = 12;
                break;

              case 8:
                _context3.prev = 8;
                _context3.t0 = _context3["catch"](2);

                _sinon.default.assert.notCalled(bulkSpy);

                (0, _expect.default)(_context3.t0.message).to.equal('Incorrect bulk body expected additional payload row at index 3 but got nothing');

              case 12:
              case "end":
                return _context3.stop();
            }
          }
        }, _callee3, null, [[2, 8]]);
      })));
      it('should send bulk request in batches - index operations, opearationsNo=1', /*#__PURE__*/_asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee4() {
        var migration, batchOperationNumber;
        return regeneratorRuntime.wrap(function _callee4$(_context4) {
          while (1) {
            switch (_context4.prev = _context4.next) {
              case 0:
                migration = new _migration.default(configuration);
                batchOperationNumber = 1;
                _context4.next = 4;
                return migration.executeteBulkRequest([{
                  index: {
                    _index: '.siren',
                    _id: '1'
                  }
                }, {
                  field1: 'value1'
                }, {
                  index: {
                    _index: '.siren',
                    _id: '2'
                  }
                }, {
                  field1: 'value2'
                }], batchOperationNumber);

              case 4:
                _sinon.default.assert.calledTwice(bulkSpy);

                (0, _expect.default)(bulkSpy.getCall(0).args[0]).to.eql({
                  refresh: true,
                  body: [{
                    index: {
                      _index: '.siren',
                      _id: '1'
                    }
                  }, {
                    field1: 'value1'
                  }]
                });
                (0, _expect.default)(bulkSpy.getCall(1).args[0]).to.eql({
                  refresh: true,
                  body: [{
                    index: {
                      _index: '.siren',
                      _id: '2'
                    }
                  }, {
                    field1: 'value2'
                  }]
                });

              case 7:
              case "end":
                return _context4.stop();
            }
          }
        }, _callee4);
      })));
      it('should send bulk request in batches - index operations, opearationsNo=2', /*#__PURE__*/_asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee5() {
        var migration, batchOperationNumber;
        return regeneratorRuntime.wrap(function _callee5$(_context5) {
          while (1) {
            switch (_context5.prev = _context5.next) {
              case 0:
                migration = new _migration.default(configuration);
                batchOperationNumber = 2;
                _context5.next = 4;
                return migration.executeteBulkRequest([{
                  index: {
                    _index: '.siren',
                    _id: '1'
                  }
                }, {
                  field1: 'value1'
                }, {
                  index: {
                    _index: '.siren',
                    _id: '2'
                  }
                }, {
                  field1: 'value2'
                }], batchOperationNumber);

              case 4:
                _sinon.default.assert.calledOnce(bulkSpy);

                (0, _expect.default)(bulkSpy.getCall(0).args[0]).to.eql({
                  refresh: true,
                  body: [{
                    index: {
                      _index: '.siren',
                      _id: '1'
                    }
                  }, {
                    field1: 'value1'
                  }, {
                    index: {
                      _index: '.siren',
                      _id: '2'
                    }
                  }, {
                    field1: 'value2'
                  }]
                });

              case 6:
              case "end":
                return _context5.stop();
            }
          }
        }, _callee5);
      })));
      it('should send bulk request in batches - mixed operations, opearationsNo=1', /*#__PURE__*/_asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee6() {
        var migration, batchOperationNumber;
        return regeneratorRuntime.wrap(function _callee6$(_context6) {
          while (1) {
            switch (_context6.prev = _context6.next) {
              case 0:
                migration = new _migration.default(configuration);
                batchOperationNumber = 1;
                _context6.next = 4;
                return migration.executeteBulkRequest([{
                  index: {
                    _index: '.siren',
                    _id: '1'
                  }
                }, {
                  field1: 'value1'
                }, {
                  delete: {
                    _index: '.siren',
                    _id: '3'
                  }
                }, {
                  index: {
                    _index: '.siren',
                    _id: '2'
                  }
                }, {
                  field1: 'value2'
                }], batchOperationNumber);

              case 4:
                _sinon.default.assert.calledThrice(bulkSpy);

                (0, _expect.default)(bulkSpy.getCall(0).args[0]).to.eql({
                  refresh: true,
                  body: [{
                    index: {
                      _index: '.siren',
                      _id: '1'
                    }
                  }, {
                    field1: 'value1'
                  }]
                });
                (0, _expect.default)(bulkSpy.getCall(1).args[0]).to.eql({
                  refresh: true,
                  body: [{
                    delete: {
                      _index: '.siren',
                      _id: '3'
                    }
                  }]
                });
                (0, _expect.default)(bulkSpy.getCall(2).args[0]).to.eql({
                  refresh: true,
                  body: [{
                    index: {
                      _index: '.siren',
                      _id: '2'
                    }
                  }, {
                    field1: 'value2'
                  }]
                });

              case 8:
              case "end":
                return _context6.stop();
            }
          }
        }, _callee6);
      })));
    });
    describe('countHits', function () {
      beforeEach(function () {
        _sinon.default.spy(client, 'count');
      });
      it('should build the correct query and return the result', /*#__PURE__*/_asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee7() {
        var migration, index, type, query, result;
        return regeneratorRuntime.wrap(function _callee7$(_context7) {
          while (1) {
            switch (_context7.prev = _context7.next) {
              case 0:
                migration = new _migration.default(configuration);
                index = 'index';
                type = 'type';
                query = {
                  query: {
                    match_all: {}
                  }
                };
                _context7.next = 6;
                return migration.countHits(index, type, query);

              case 6:
                result = _context7.sent;
                (0, _expect.default)(result).to.be(15);
                (0, _expect.default)(client.count.calledWith({
                  index: index,
                  type: type,
                  body: query
                }));

              case 9:
              case "end":
                return _context7.stop();
            }
          }
        }, _callee7);
      })));
    });
    Object.keys(_helpers.ES_API).forEach(function (version) {
      var esApi = _helpers.ES_API[version];
      describe("ES ".concat(version, ": scrollSearch"), function () {
        var search;
        var scroll;
        var clearScroll;
        beforeEach(function () {
          search = _sinon.default.stub(client, 'search').callsFake(function (searchOptions) {
            if (searchOptions.index === 'empty') {
              return {
                _scroll_id: "".concat(esApi, "_scroll_id"),
                hits: {
                  total: (0, _helpers.formatTotalHits)(0, esApi),
                  hits: []
                }
              };
            }

            return {
              _scroll_id: "".concat(esApi, "_scroll_id"),
              hits: {
                total: (0, _helpers.formatTotalHits)(100, esApi),
                hits: new Array(10)
              }
            };
          });
          scroll = _sinon.default.stub(client, 'scroll').callsFake(function (scrollOptions) {
            return {
              _scroll_id: scrollOptions.body.scroll_id,
              hits: {
                total: (0, _helpers.formatTotalHits)(100, esApi),
                hits: new Array(10)
              }
            };
          });
          clearScroll = _sinon.default.stub(client, 'clearScroll').callsFake(function () {
            return {
              succeeded: true
            };
          });
        });
        describe('Call it as no emmiter', function () {
          it('should set default options if options have not been defined', /*#__PURE__*/_asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee8() {
            var migration;
            return regeneratorRuntime.wrap(function _callee8$(_context8) {
              while (1) {
                switch (_context8.prev = _context8.next) {
                  case 0:
                    migration = new _migration.default(configuration);
                    _context8.next = 3;
                    return migration.scrollSearch('empty', 'type', {});

                  case 3:
                    _sinon.default.assert.calledOnce(search);

                    _sinon.default.assert.alwaysCalledWith(search, _sinon.default.match({
                      size: 100
                    }));

                  case 5:
                  case "end":
                    return _context8.stop();
                }
              }
            }, _callee8);
          })));
          it('should set a default size if no size has been specified', /*#__PURE__*/_asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee9() {
            var migration;
            return regeneratorRuntime.wrap(function _callee9$(_context9) {
              while (1) {
                switch (_context9.prev = _context9.next) {
                  case 0:
                    migration = new _migration.default(configuration);
                    _context9.next = 3;
                    return migration.scrollSearch('empty', 'type', {}, {});

                  case 3:
                    _sinon.default.assert.calledOnce(search);

                    _sinon.default.assert.alwaysCalledWith(search, _sinon.default.match({
                      size: 100
                    }));

                  case 5:
                  case "end":
                    return _context9.stop();
                }
              }
            }, _callee9);
          })));
          it('should use the specified size', /*#__PURE__*/_asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee10() {
            var migration;
            return regeneratorRuntime.wrap(function _callee10$(_context10) {
              while (1) {
                switch (_context10.prev = _context10.next) {
                  case 0:
                    migration = new _migration.default(configuration);
                    _context10.next = 3;
                    return migration.scrollSearch('empty', 'type', {}, {
                      size: 1000
                    });

                  case 3:
                    _sinon.default.assert.calledOnce(search);

                    _sinon.default.assert.alwaysCalledWith(search, _sinon.default.match({
                      size: 1000
                    }));

                  case 5:
                  case "end":
                    return _context10.stop();
                }
              }
            }, _callee10);
          })));
          it('should use the scroll API to fetch hits', /*#__PURE__*/_asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee11() {
            var migration, index, type, query, options, results, i;
            return regeneratorRuntime.wrap(function _callee11$(_context11) {
              while (1) {
                switch (_context11.prev = _context11.next) {
                  case 0:
                    migration = new _migration.default(configuration);
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
                    _context11.next = 7;
                    return migration.scrollSearch(index, type, query, options);

                  case 7:
                    results = _context11.sent;

                    _sinon.default.assert.calledOnce(search);

                    _sinon.default.assert.alwaysCalledWith(search, {
                      index: index,
                      type: type,
                      scroll: '1m',
                      size: options.size,
                      body: query
                    });

                    (0, _expect.default)(scroll.callCount).to.be(9);

                    for (i = 0; i < scroll.callCount; i++) {
                      (0, _expect.default)(scroll.getCall(i).args[0]).to.eql({
                        body: {
                          scroll: '1m',
                          scroll_id: "".concat(esApi, "_scroll_id")
                        }
                      });
                    }

                    (0, _expect.default)(clearScroll.callCount).to.be(1);
                    (0, _expect.default)(clearScroll.getCall(0).args[0]).to.eql({
                      body: {
                        scroll_id: "".concat(esApi, "_scroll_id")
                      }
                    });
                    (0, _expect.default)(results.length).to.be(100);

                  case 15:
                  case "end":
                    return _context11.stop();
                }
              }
            }, _callee11);
          })));
        });
        describe('Call it as emmiter', function () {
          it('should set default options if options have not been defined', /*#__PURE__*/_asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee12() {
            var migration, emitter;
            return regeneratorRuntime.wrap(function _callee12$(_context12) {
              while (1) {
                switch (_context12.prev = _context12.next) {
                  case 0:
                    migration = new _migration.default(configuration);
                    _context12.next = 3;
                    return migration.scrollSearch('empty', 'type', {}, undefined, true);

                  case 3:
                    emitter = _context12.sent;
                    return _context12.abrupt("return", new Promise(function (resolve, reject) {
                      emitter.on('end', function () {
                        _sinon.default.assert.calledOnce(search);

                        _sinon.default.assert.alwaysCalledWith(search, _sinon.default.match({
                          size: 100
                        }));

                        emitter.removeAllListeners();
                        resolve();
                      });
                      emitter.on('error', function (error) {
                        emitter.removeAllListeners();
                        reject(error);
                      });
                    }));

                  case 5:
                  case "end":
                    return _context12.stop();
                }
              }
            }, _callee12);
          })));
          it('should set a default size if no size has been specified', /*#__PURE__*/_asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee13() {
            var migration, emitter;
            return regeneratorRuntime.wrap(function _callee13$(_context13) {
              while (1) {
                switch (_context13.prev = _context13.next) {
                  case 0:
                    migration = new _migration.default(configuration);
                    _context13.next = 3;
                    return migration.scrollSearch('empty', 'type', {}, {}, true);

                  case 3:
                    emitter = _context13.sent;
                    return _context13.abrupt("return", new Promise(function (resolve, reject) {
                      emitter.on('end', function () {
                        _sinon.default.assert.calledOnce(search);

                        _sinon.default.assert.alwaysCalledWith(search, _sinon.default.match({
                          size: 100
                        }));

                        emitter.removeAllListeners();
                        resolve();
                      });
                      emitter.on('error', function (error) {
                        emitter.removeAllListeners();
                        reject(error);
                      });
                    }));

                  case 5:
                  case "end":
                    return _context13.stop();
                }
              }
            }, _callee13);
          })));
          it('should use the specified size', /*#__PURE__*/_asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee14() {
            var migration, emitter;
            return regeneratorRuntime.wrap(function _callee14$(_context14) {
              while (1) {
                switch (_context14.prev = _context14.next) {
                  case 0:
                    migration = new _migration.default(configuration);
                    _context14.next = 3;
                    return migration.scrollSearch('empty', 'type', {}, {
                      size: 1000
                    }, true);

                  case 3:
                    emitter = _context14.sent;
                    return _context14.abrupt("return", new Promise(function (resolve, reject) {
                      emitter.on('end', function () {
                        _sinon.default.assert.calledOnce(search);

                        _sinon.default.assert.alwaysCalledWith(search, _sinon.default.match({
                          size: 1000
                        }));

                        emitter.removeAllListeners();
                        resolve();
                      });
                      emitter.on('error', function (error) {
                        emitter.removeAllListeners();
                        reject(error);
                      });
                    }));

                  case 5:
                  case "end":
                    return _context14.stop();
                }
              }
            }, _callee14);
          })));
          it('should use the scroll API to fetch hits', /*#__PURE__*/_asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee15() {
            var migration, index, type, query, options, emitter;
            return regeneratorRuntime.wrap(function _callee15$(_context15) {
              while (1) {
                switch (_context15.prev = _context15.next) {
                  case 0:
                    migration = new _migration.default(configuration);
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
                    _context15.next = 7;
                    return migration.scrollSearch(index, type, query, options, true);

                  case 7:
                    emitter = _context15.sent;
                    return _context15.abrupt("return", new Promise(function (resolve, reject) {
                      var dataEventsNo = 0;
                      var totalEmittedObjects = 0;
                      emitter.on('data', function (data) {
                        dataEventsNo++;
                        totalEmittedObjects += data.length;
                      });
                      emitter.on('end', function (res) {
                        _sinon.default.assert.calledOnce(search);

                        _sinon.default.assert.alwaysCalledWith(search, {
                          index: index,
                          type: type,
                          scroll: '1m',
                          size: options.size,
                          body: query
                        });

                        (0, _expect.default)(scroll.callCount).to.be(9);

                        for (var i = 0; i < scroll.callCount; i++) {
                          (0, _expect.default)(scroll.getCall(i).args[0]).to.eql({
                            body: {
                              scroll: '1m',
                              scroll_id: "".concat(esApi, "_scroll_id")
                            }
                          });
                        }

                        (0, _expect.default)(clearScroll.callCount).to.be(1);
                        (0, _expect.default)(clearScroll.getCall(0).args[0]).to.eql({
                          body: {
                            scroll_id: "".concat(esApi, "_scroll_id")
                          }
                        });
                        (0, _expect.default)(totalEmittedObjects).to.be(100);
                        (0, _expect.default)(dataEventsNo).to.be(10);
                        emitter.removeAllListeners();
                        resolve();
                      });
                      emitter.on('error', function (error) {
                        emitter.removeAllListeners();
                        reject(error);
                      });
                    }));

                  case 9:
                  case "end":
                    return _context15.stop();
                }
              }
            }, _callee15);
          })));
        });
      });
    });
  });
});