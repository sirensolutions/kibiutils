'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _expect = require('expect.js');

var _expect2 = _interopRequireDefault(_expect);

var _sinon = require('sinon');

var _sinon2 = _interopRequireDefault(_sinon);

var _migration_runner = require('../migration_runner');

var _migration_runner2 = _interopRequireDefault(_migration_runner);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

describe('migrations', function () {

  describe('MigrationRunner', function () {

    /**
     * Fake migration class factory.
     *
     * @param description The description of the migration.
     * @param count The number of objects processed by the migration.
     * @param invalid If true, the constructor will throw an error.
     * @return a fake migration class.
     */
    function fakeMigrationClass(description, _count, invalid) {
      return function () {
        function _class() {
          _classCallCheck(this, _class);

          if (invalid) throw new Error('invalid');
        }

        _createClass(_class, [{
          key: 'count',
          value: function () {
            var _ref = _asyncToGenerator(regeneratorRuntime.mark(function _callee() {
              return regeneratorRuntime.wrap(function _callee$(_context) {
                while (1) {
                  switch (_context.prev = _context.next) {
                    case 0:
                      return _context.abrupt('return', _count);

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
        }, {
          key: 'upgrade',
          value: function () {
            var _ref2 = _asyncToGenerator(regeneratorRuntime.mark(function _callee2() {
              return regeneratorRuntime.wrap(function _callee2$(_context2) {
                while (1) {
                  switch (_context2.prev = _context2.next) {
                    case 0:
                      return _context2.abrupt('return', _count);

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
        }, {
          key: 'description',
          get: function get() {
            return description;
          }
        }]);

        return _class;
      }();
    }

    //Create a fake server having three plugins with fake migrations.
    var plugin1 = {
      getMigrations: function getMigrations() {
        return [fakeMigrationClass('plugin1_1', 2), fakeMigrationClass('plugin1_2', 5)];
      }
    };

    var plugin2 = {
      getMigrations: function getMigrations() {
        return [];
      }
    };

    var plugin3 = {
      getMigrations: function getMigrations() {
        return [fakeMigrationClass('plugin3_1', 3)];
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
                return {};
              }
            };
          }
        },
        plugin1: plugin1,
        plugin2: plugin2,
        plugin3: plugin3
      }
    };

    var logger = {
      info: function info() {}
    };

    describe('upgrade', function () {
      var _this = this;

      var runner = new _migration_runner2.default(server, logger);

      before(function () {
        _sinon2.default.spy(runner, 'getMigrations');
      });

      it('should execute migrations in the correct order', _asyncToGenerator(regeneratorRuntime.mark(function _callee3() {
        var result, migrations, descriptions;
        return regeneratorRuntime.wrap(function _callee3$(_context3) {
          while (1) {
            switch (_context3.prev = _context3.next) {
              case 0:
                _context3.next = 2;
                return runner.upgrade();

              case 2:
                result = _context3.sent;


                (0, _expect2.default)(result).to.be(10);

                _context3.next = 6;
                return runner.getMigrations.returnValues[0];

              case 6:
                migrations = _context3.sent;

                (0, _expect2.default)(migrations.length).to.be(3);
                descriptions = migrations.map(function (migration) {
                  return migration.description;
                });

                (0, _expect2.default)(descriptions).to.contain('plugin1_1');
                (0, _expect2.default)(descriptions).to.contain('plugin1_2');
                (0, _expect2.default)(descriptions).to.contain('plugin3_1');
                (0, _expect2.default)(descriptions.indexOf('plugin1_2')).to.be.greaterThan(descriptions.indexOf('plugin1_1'));

              case 13:
              case 'end':
                return _context3.stop();
            }
          }
        }, _callee3, _this);
      })));

      after(function () {
        runner.getMigrations.restore();
      });
    });

    describe('count', function () {
      var _this2 = this;

      var runner = new _migration_runner2.default(server, logger);

      before(function () {
        _sinon2.default.spy(runner, 'getMigrations');
      });

      it('should execute migrations in the correct order', _asyncToGenerator(regeneratorRuntime.mark(function _callee4() {
        var result, migrations, descriptions;
        return regeneratorRuntime.wrap(function _callee4$(_context4) {
          while (1) {
            switch (_context4.prev = _context4.next) {
              case 0:
                _context4.next = 2;
                return runner.count();

              case 2:
                result = _context4.sent;


                (0, _expect2.default)(result).to.be(10);

                _context4.next = 6;
                return runner.getMigrations.returnValues[0];

              case 6:
                migrations = _context4.sent;

                (0, _expect2.default)(migrations.length).to.be(3);
                descriptions = migrations.map(function (migration) {
                  return migration.description;
                });

                (0, _expect2.default)(descriptions).to.contain('plugin1_1');
                (0, _expect2.default)(descriptions).to.contain('plugin1_2');
                (0, _expect2.default)(descriptions).to.contain('plugin3_1');
                (0, _expect2.default)(descriptions.indexOf('plugin1_2')).to.be.greaterThan(descriptions.indexOf('plugin1_1'));

              case 13:
              case 'end':
                return _context4.stop();
            }
          }
        }, _callee4, _this2);
      })));

      after(function () {
        runner.getMigrations.restore();
      });
    });

    describe('getMigrations', function () {

      describe('should', function () {
        var _this3 = this;

        before(function () {
          _sinon2.default.spy(plugin1, 'getMigrations');
          _sinon2.default.spy(plugin2, 'getMigrations');
          _sinon2.default.spy(plugin3, 'getMigrations');
        });

        it('cache migrations', _asyncToGenerator(regeneratorRuntime.mark(function _callee5() {
          var runner;
          return regeneratorRuntime.wrap(function _callee5$(_context5) {
            while (1) {
              switch (_context5.prev = _context5.next) {
                case 0:
                  runner = new _migration_runner2.default(server);

                  runner.getMigrations();
                  runner.getMigrations();

                  (0, _expect2.default)(plugin1.getMigrations.calledOnce).to.be(true);
                  (0, _expect2.default)(plugin2.getMigrations.calledOnce).to.be(true);
                  (0, _expect2.default)(plugin3.getMigrations.calledOnce).to.be(true);

                case 6:
                case 'end':
                  return _context5.stop();
              }
            }
          }, _callee5, _this3);
        })));

        after(function () {
          plugin1.getMigrations.restore();
          plugin2.getMigrations.restore();
          plugin3.getMigrations.restore();
        });
      });

      describe('should not', function () {

        before(function () {
          _sinon2.default.stub(plugin2, 'getMigrations', function () {
            return [fakeMigrationClass('err', 0, true)];
          });
        });

        it('swallow exceptions thrown by migration constructors', function () {
          var runner = new _migration_runner2.default(server);
          (0, _expect2.default)(function () {
            return runner.getMigrations();
          }).to.throwError();
        });

        after(function () {
          plugin2.getMigrations.restore();
        });
      });
    });
  });
});