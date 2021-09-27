"use strict";

require("core-js/modules/es.object.to-string.js");

require("core-js/modules/es.promise.js");

require("regenerator-runtime/runtime.js");

require("core-js/modules/es.symbol.js");

require("core-js/modules/es.symbol.description.js");

require("core-js/modules/es.array.map.js");

require("core-js/modules/es.array.index-of.js");

var _expect = _interopRequireDefault(require("expect.js"));

var _sinon = _interopRequireDefault(require("sinon"));

var _migration_runner = _interopRequireDefault(require("../migration_runner"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(_next, _throw); } }

function _asyncToGenerator(fn) { return function () { var self = this, args = arguments; return new Promise(function (resolve, reject) { var gen = fn.apply(self, args); function _next(value) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "next", value); } function _throw(err) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "throw", err); } _next(undefined); }); }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

describe('migrations', function () {
  describe('MigrationRunner', function () {
    /**
     * Fake migration class factory.
     *
     * @param description The description of the migration.
     * @param counts The number of objects reported by the migration for each pass.
     * @param upgrades The number of objects processed by the migration for each pass.
     * @param invalid If true, the constructor will throw an error.
     * @return a fake migration class.
     */
    function fakeMigrationClass(description, counts, upgrades, invalid) {
      return /*#__PURE__*/function () {
        function Migration(_ref) {
          var client = _ref.client;

          _classCallCheck(this, Migration);

          this._client = client;
          this.countCallNo = -1;
          this.upgradeCallNo = -1;
          this.description = description;
          if (invalid) throw new Error('invalid');
        }

        _createClass(Migration, [{
          key: "count",
          value: function () {
            var _count = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee() {
              return regeneratorRuntime.wrap(function _callee$(_context) {
                while (1) {
                  switch (_context.prev = _context.next) {
                    case 0:
                      this.countCallNo++;

                      if (!(this.countCallNo >= 0 && this.countCallNo <= counts.length - 1)) {
                        _context.next = 5;
                        break;
                      }

                      return _context.abrupt("return", counts[this.countCallNo]);

                    case 5:
                      return _context.abrupt("return", 0);

                    case 6:
                    case "end":
                      return _context.stop();
                  }
                }
              }, _callee, this);
            }));

            function count() {
              return _count.apply(this, arguments);
            }

            return count;
          }()
        }, {
          key: "upgrade",
          value: function () {
            var _upgrade = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee2() {
              return regeneratorRuntime.wrap(function _callee2$(_context2) {
                while (1) {
                  switch (_context2.prev = _context2.next) {
                    case 0:
                      this.upgradeCallNo++;

                      if (!(this.upgradeCallNo >= 0 && this.upgradeCallNo <= upgrades.length - 1)) {
                        _context2.next = 5;
                        break;
                      }

                      return _context2.abrupt("return", upgrades[this.upgradeCallNo]);

                    case 5:
                      return _context2.abrupt("return", 0);

                    case 6:
                    case "end":
                      return _context2.stop();
                  }
                }
              }, _callee2, this);
            }));

            function upgrade() {
              return _upgrade.apply(this, arguments);
            }

            return upgrade;
          }()
        }], [{
          key: "description",
          get: function get() {
            return description;
          }
        }]);

        return Migration;
      }();
    } //Create a fake server having three plugins with fake migrations.


    var investigateCorePlugin = {
      status: {
        id: 'investigate_core'
      }
    };
    var plugin1 = {
      status: {
        id: 'plugin1'
      }
    };
    var plugin2 = {
      status: {
        id: 'plugin2'
      }
    };
    var plugin3 = {
      status: {
        id: 'plugin3'
      }
    };
    var plugin3callsNo2 = {
      status: {
        id: 'plugin3callsNo2'
      }
    };
    var plugin3callsNo6 = {
      status: {
        id: 'plugin3callsNo6'
      }
    };
    var server = {
      config: function config() {
        return {
          get: function get() {
            return 'index';
          }
        };
      },
      plugins: {
        elasticsearch: {
          getCluster: function getCluster() {
            return {
              getClient: function getClient() {
                return {
                  bulk: function bulk() {}
                };
              }
            };
          }
        },
        plugin1: plugin1,
        plugin2: plugin2,
        plugin3: plugin3
      }
    };
    var kbnServer = {
      migrations: {
        plugin1: [fakeMigrationClass('plugin1_1', [2], [2]), fakeMigrationClass('plugin1_2', [5], [5])],
        plugin2: [],
        plugin3: [fakeMigrationClass('plugin3_1', [3], [3])]
      }
    };
    var server2 = {
      config: function config() {
        return {
          get: function get() {
            return 'index';
          }
        };
      },
      plugins: {
        elasticsearch: {
          getCluster: function getCluster() {
            return {
              getClient: function getClient() {
                return {
                  bulk: function bulk() {}
                };
              }
            };
          }
        },
        plugin1: plugin1,
        plugin2: plugin2,
        plugin3: plugin3callsNo2
      }
    };
    var kbnServer2 = {
      migrations: {
        plugin1: [fakeMigrationClass('plugin1_1', [2], [2]), fakeMigrationClass('plugin1_2', [5], [5])],
        plugin2: [],
        plugin3: [fakeMigrationClass('plugin3_1', [3, 2], [3, 2])]
      }
    };
    var server3 = {
      config: function config() {
        return {
          get: function get() {
            return 'index';
          }
        };
      },
      plugins: {
        elasticsearch: {
          getCluster: function getCluster() {
            return {
              getClient: function getClient() {
                return {
                  bulk: function bulk() {}
                };
              }
            };
          }
        },
        plugin3: plugin3callsNo6
      }
    };
    var kbnServer3 = {
      migrations: {
        plugin3: [fakeMigrationClass('plugin3_1', [1, 1, 1, 1, 1, 1], [1, 1, 1, 1, 1, 1])]
      }
    };
    var server4 = {
      config: function config() {
        return {
          get: function get() {
            return 'index';
          }
        };
      },
      plugins: {
        elasticsearch: {
          getCluster: function getCluster() {
            return {
              getClient: function getClient() {
                return {
                  bulk: function bulk() {}
                };
              }
            };
          }
        },
        investigate_core: investigateCorePlugin,
        plugin1: plugin1
      }
    };
    var kbnServer4 = {
      migrations: {
        plugin1: [fakeMigrationClass('plugin1_1', [2], [2]), fakeMigrationClass('plugin1_2', [5], [5])],
        investigate_core: [fakeMigrationClass('investigate_core_1', [1], [1])]
      }
    };
    var logger = {
      // eslint-disable-next-line no-console
      info: function info(e) {
        return console.log('INFO', e);
      },
      // eslint-disable-next-line no-console
      warning: function warning(e) {
        return console.log('WARN', e);
      },
      // eslint-disable-next-line no-console
      error: function error(e) {
        return console.log('ERROR', e);
      }
    };
    var infoSpy;
    var warningSpy;
    var errorSpy;
    beforeEach(function () {
      infoSpy = _sinon.default.spy(logger, 'info');
      warningSpy = _sinon.default.spy(logger, 'warning');
      errorSpy = _sinon.default.spy(logger, 'error');
    });
    afterEach(function () {
      logger.info.restore();
      logger.warning.restore();
      logger.error.restore();
    });
    describe('getMigrations order', function () {
      var runner = new _migration_runner.default(server4, logger, kbnServer4);
      it('migrations from investigate_core should be last', function () {
        var migrations = runner.getMigrations();
        (0, _expect.default)(migrations.length).to.equal(3);
        (0, _expect.default)(migrations[0].description).to.equal('plugin1_1');
        (0, _expect.default)(migrations[1].description).to.equal('plugin1_2');
        (0, _expect.default)(migrations[2].description).to.equal('investigate_core_1');
      });
    });
    describe('upgrade more than 5 passes', function () {
      var runner = new _migration_runner.default(server3, logger, kbnServer3);
      it('should stop on 5th iteration', /*#__PURE__*/_asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee3() {
        var result;
        return regeneratorRuntime.wrap(function _callee3$(_context3) {
          while (1) {
            switch (_context3.prev = _context3.next) {
              case 0:
                _context3.next = 2;
                return runner.upgrade();

              case 2:
                result = _context3.sent;
                (0, _expect.default)(result).to.be(5);

                _sinon.default.assert.notCalled(warningSpy);

                _sinon.default.assert.callCount(infoSpy, 6);

                (0, _expect.default)(infoSpy.getCall(0).args[0]).to.equal('The following migrations reported upgraded objects:');
                (0, _expect.default)(infoSpy.getCall(1).args[0]).to.equal('Iteration: 1\n1 objects - "plugin3_1"\n');
                (0, _expect.default)(infoSpy.getCall(2).args[0]).to.equal('Iteration: 2\n1 objects - "plugin3_1"\n');
                (0, _expect.default)(infoSpy.getCall(3).args[0]).to.equal('Iteration: 3\n1 objects - "plugin3_1"\n');
                (0, _expect.default)(infoSpy.getCall(4).args[0]).to.equal('Iteration: 4\n1 objects - "plugin3_1"\n');
                (0, _expect.default)(infoSpy.getCall(5).args[0]).to.equal('Iteration: 5\n1 objects - "plugin3_1"\n');

                _sinon.default.assert.calledOnce(errorSpy);

                _sinon.default.assert.calledWith(errorSpy, 'The upgrade procedure could not finish after 5 iterations');

              case 14:
              case "end":
                return _context3.stop();
            }
          }
        }, _callee3);
      })));
    });
    describe('upgrade 2 passes', function () {
      var runner = new _migration_runner.default(server2, logger, kbnServer2);
      before(function () {
        _sinon.default.spy(runner, 'getMigrations');
      });
      it('should execute second iteration if there are still migrations after the first one', /*#__PURE__*/_asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee4() {
        var result;
        return regeneratorRuntime.wrap(function _callee4$(_context4) {
          while (1) {
            switch (_context4.prev = _context4.next) {
              case 0:
                _context4.next = 2;
                return runner.upgrade();

              case 2:
                result = _context4.sent;
                (0, _expect.default)(result).to.be(12);

                _sinon.default.assert.notCalled(warningSpy);

                _sinon.default.assert.notCalled(errorSpy);

                _sinon.default.assert.callCount(infoSpy, 3);

                (0, _expect.default)(infoSpy.getCall(0).args[0]).to.equal('The following migrations reported upgraded objects:');
                (0, _expect.default)(infoSpy.getCall(1).args[0]).to.equal('Iteration: 1\n2 objects - "plugin1_1"\n5 objects - "plugin1_2"\n3 objects - "plugin3_1"\n');
                (0, _expect.default)(infoSpy.getCall(2).args[0]).to.equal('Iteration: 2\n2 objects - "plugin3_1"\n');

              case 10:
              case "end":
                return _context4.stop();
            }
          }
        }, _callee4);
      })));
      after(function () {
        runner.getMigrations.restore();
      });
    });
    describe('upgrade', function () {
      var runner = new _migration_runner.default(server, logger, kbnServer);
      before(function () {
        _sinon.default.spy(runner, 'getMigrations');
      });
      it('should execute migrations in the correct order', /*#__PURE__*/_asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee5() {
        var result, migrations, descriptions;
        return regeneratorRuntime.wrap(function _callee5$(_context5) {
          while (1) {
            switch (_context5.prev = _context5.next) {
              case 0:
                _context5.next = 2;
                return runner.upgrade();

              case 2:
                result = _context5.sent;
                (0, _expect.default)(result).to.be(10);
                _context5.next = 6;
                return runner.getMigrations.returnValues[0];

              case 6:
                migrations = _context5.sent;
                (0, _expect.default)(migrations.length).to.be(3);
                descriptions = migrations.map(function (migration) {
                  return migration.constructor.description;
                });
                (0, _expect.default)(descriptions).to.contain('plugin1_1');
                (0, _expect.default)(descriptions).to.contain('plugin1_2');
                (0, _expect.default)(descriptions).to.contain('plugin3_1');
                (0, _expect.default)(descriptions.indexOf('plugin1_2')).to.be.greaterThan(descriptions.indexOf('plugin1_1'));

                _sinon.default.assert.notCalled(warningSpy);

                _sinon.default.assert.notCalled(errorSpy);

                _sinon.default.assert.callCount(infoSpy, 2);

                (0, _expect.default)(infoSpy.getCall(0).args[0]).to.equal('The following migrations reported upgraded objects:');
                (0, _expect.default)(infoSpy.getCall(1).args[0]).to.equal('Iteration: 1\n2 objects - "plugin1_1"\n5 objects - "plugin1_2"\n3 objects - "plugin3_1"\n');

              case 18:
              case "end":
                return _context5.stop();
            }
          }
        }, _callee5);
      })));
      after(function () {
        runner.getMigrations.restore();
      });
    });
    describe('do not report zeros', function () {
      var plugin5 = {
        status: {
          id: 'plugin5'
        }
      };
      var server5 = {
        config: function config() {
          return {
            get: function get() {
              return 'index';
            }
          };
        },
        plugins: {
          elasticsearch: {
            getCluster: function getCluster() {
              return {
                getClient: function getClient() {
                  return {
                    bulk: function bulk() {}
                  };
                }
              };
            }
          },
          plugin5: plugin5
        }
      };
      var kbnServer = {
        migrations: {
          plugin5: [fakeMigrationClass('plugin5_1', [0], [0]), fakeMigrationClass('plugin5_2', [2], [2])]
        }
      };
      it('should not report 0 count in count phase', /*#__PURE__*/_asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee6() {
        var runner, result;
        return regeneratorRuntime.wrap(function _callee6$(_context6) {
          while (1) {
            switch (_context6.prev = _context6.next) {
              case 0:
                runner = new _migration_runner.default(server5, logger, kbnServer);
                _context6.next = 3;
                return runner.count();

              case 3:
                result = _context6.sent;
                (0, _expect.default)(result).to.be(2);

                _sinon.default.assert.callCount(warningSpy, 1);

                (0, _expect.default)(warningSpy.getCall(0).args[0]).to.equal('The following migrations reported outdated objects:\n' + '2 objects - "plugin5_2"\n');

              case 7:
              case "end":
                return _context6.stop();
            }
          }
        }, _callee6);
      })));
      it('should not report 0 count in upgrade phase', /*#__PURE__*/_asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee7() {
        var runner, result;
        return regeneratorRuntime.wrap(function _callee7$(_context7) {
          while (1) {
            switch (_context7.prev = _context7.next) {
              case 0:
                runner = new _migration_runner.default(server5, logger, kbnServer);
                _context7.next = 3;
                return runner.upgrade();

              case 3:
                result = _context7.sent;
                (0, _expect.default)(result).to.be(2);

                _sinon.default.assert.notCalled(warningSpy);

                _sinon.default.assert.notCalled(errorSpy);

                _sinon.default.assert.callCount(infoSpy, 2);

                (0, _expect.default)(infoSpy.getCall(0).args[0]).to.equal('The following migrations reported upgraded objects:');
                (0, _expect.default)(infoSpy.getCall(1).args[0]).to.equal('Iteration: 1\n2 objects - "plugin5_2"\n');

              case 10:
              case "end":
                return _context7.stop();
            }
          }
        }, _callee7);
      })));
    });
    describe('count', function () {
      var runner = new _migration_runner.default(server, logger, kbnServer);
      before(function () {
        _sinon.default.spy(runner, 'getMigrations');
      });
      it('should execute migrations in the correct order', /*#__PURE__*/_asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee8() {
        var result, migrations, descriptions;
        return regeneratorRuntime.wrap(function _callee8$(_context8) {
          while (1) {
            switch (_context8.prev = _context8.next) {
              case 0:
                _context8.next = 2;
                return runner.count();

              case 2:
                result = _context8.sent;
                (0, _expect.default)(result).to.be(10);
                _context8.next = 6;
                return runner.getMigrations.returnValues[0];

              case 6:
                migrations = _context8.sent;
                (0, _expect.default)(migrations.length).to.be(3);
                descriptions = migrations.map(function (migration) {
                  return migration.constructor.description;
                });
                (0, _expect.default)(descriptions).to.contain('plugin1_1');
                (0, _expect.default)(descriptions).to.contain('plugin1_2');
                (0, _expect.default)(descriptions).to.contain('plugin3_1');
                (0, _expect.default)(descriptions.indexOf('plugin1_2')).to.be.greaterThan(descriptions.indexOf('plugin1_1'));

                _sinon.default.assert.notCalled(infoSpy);

                _sinon.default.assert.notCalled(errorSpy);

                _sinon.default.assert.callCount(warningSpy, 1);

                (0, _expect.default)(warningSpy.getCall(0).args[0]).to.equal('The following migrations reported outdated objects:\n' + '2 objects - "plugin1_1"\n5 objects - "plugin1_2"\n3 objects - "plugin3_1"\n');

              case 17:
              case "end":
                return _context8.stop();
            }
          }
        }, _callee8);
      })));
      after(function () {
        runner.getMigrations.restore();
      });
    });
    describe('getMigrations', function () {
      describe('should', function () {
        beforeEach(function () {
          _sinon.default.spy(server.plugins.elasticsearch, 'getCluster');
        });
        it('cache migrations', /*#__PURE__*/_asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee9() {
          var runner, firstCallResp, secondCallResp;
          return regeneratorRuntime.wrap(function _callee9$(_context9) {
            while (1) {
              switch (_context9.prev = _context9.next) {
                case 0:
                  runner = new _migration_runner.default(server, logger, kbnServer);
                  firstCallResp = runner.getMigrations();
                  secondCallResp = runner.getMigrations();
                  (0, _expect.default)(firstCallResp).to.equal(secondCallResp);

                case 4:
                case "end":
                  return _context9.stop();
              }
            }
          }, _callee9);
        })));
        it('should use patched es client for migrations', /*#__PURE__*/_asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee10() {
          var runner, patchedBulk, migrations;
          return regeneratorRuntime.wrap(function _callee10$(_context10) {
            while (1) {
              switch (_context10.prev = _context10.next) {
                case 0:
                  runner = new _migration_runner.default(server, logger, kbnServer);
                  patchedBulk = runner._patchedClient.getEsClient().bulk;
                  migrations = runner.getMigrations();
                  (0, _expect.default)(migrations.length).to.equal(3);
                  (0, _expect.default)(server.plugins.elasticsearch.getCluster.callCount).to.equal(1);
                  (0, _expect.default)(migrations[0]._client.bulk).to.equal(patchedBulk);
                  (0, _expect.default)(migrations[1]._client.bulk).to.equal(patchedBulk);
                  (0, _expect.default)(migrations[2]._client.bulk).to.equal(patchedBulk);

                case 8:
                case "end":
                  return _context10.stop();
              }
            }
          }, _callee10);
        })));
        afterEach(function () {
          server.plugins.elasticsearch.getCluster.restore();
        });
      });
      describe('should not', function () {
        it('swallow exceptions thrown by migration constructors', function () {
          var kbnServer = {
            migrations: {
              plugin1: [fakeMigrationClass('plugin1_1', [2], [2]), fakeMigrationClass('plugin1_2', [5], [5])],
              plugin2: [fakeMigrationClass('err', [0], [0], true)],
              plugin3: [fakeMigrationClass('plugin3_1', [3], [3])]
            }
          };
          var runner = new _migration_runner.default(server, logger, kbnServer);
          (0, _expect.default)(function () {
            return runner.getMigrations();
          }).to.throwError();
        });
      });
      describe('cleanup', function () {
        it('removes bulk patch from esClient', function () {
          var runner = new _migration_runner.default(server, logger, kbnServer);

          var esClient = runner._patchedClient.getEsClient();

          var beforeCleanup = esClient.bulk;
          runner.cleanup();
          var afterCleanup = esClient.bulk;
          (0, _expect.default)(beforeCleanup).to.not.equal(afterCleanup);
        });
      });
    });
  });
});