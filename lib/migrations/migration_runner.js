'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _lodash = require('lodash');

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

require('babel-polyfill');

/**
 * A migration runner.
 */

var MigrationRunner = function () {
  /**
   * Creates a new Migration runner.
   *
   * @param {MigrationLogger} logger A logger instance.
   * @param {KbnServer.server} server A server instance.
   */
  function MigrationRunner(server, logger, kbnServer) {
    _classCallCheck(this, MigrationRunner);

    this._server = server;
    this._logger = logger;
    this._kbnServer = kbnServer;
  }

  /**
   * Gets migration classes from plugins that expose the `getMigrations`
   * method and instantiates them.
   *
   * The runner passes a configuration object to the migration constructor which
   * contains the following attributes:
   *
   * - index: the name of the Kibi index.
   * - client: an instance of an Elasticsearch client configured to connect to the Kibi cluster.
   *
   * Each migration must expose the following:
   *
   * - `count`: returns the number of objects that can be upgraded.
   * - `upgrade`: runs the migration and returns the number of upgraded
   *              objects.
   *
   * Migrations are cached and executed in the order returned by each plugin;
   * the plugins are scanned in the order returned by the PluginCollection in
   * server.plugins.
   *
   * Currently it is not possible to defined dependencies between migrations
   * declared in different plugins, so be careful about modifying objects
   * shared by more than one plugin.
   */


  _createClass(MigrationRunner, [{
    key: 'getMigrations',
    value: function getMigrations() {
      var _this = this;

      if (this._migrations) {
        return this._migrations;
      }
      var migrations = [];
      var coreMigrations = [];
      (0, _lodash.each)(this._kbnServer.migrations, function (pluginMigrations, id) {
        (0, _lodash.each)(pluginMigrations, function (Migration) {
          var configuration = {
            config: _this._server.config(),
            client: _this._server.plugins.elasticsearch.getCluster('admin').getClient(),
            logger: _this._logger,
            server: _this._server
          };
          var migration = new Migration(configuration);
          if (id.indexOf('investigate_core') !== -1) {
            coreMigrations.push(migration);
          } else {
            migrations.push(migration);
          }
        });
      });
      this._migrations = migrations.concat(coreMigrations);
      return this._migrations;
    }

    /**
     * Counts objects that can be upgraded by executing the `count` method of each migration returned by the installed plugins.
     *
     * @returns The number of objects that can be upgraded.
     */

  }, {
    key: 'count',
    value: function () {
      var _ref = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee() {
        var loggingEnabled = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : true;

        var toUpgrade, warning, _iteratorNormalCompletion, _didIteratorError, _iteratorError, _iterator, _step, migration, _count;

        return regeneratorRuntime.wrap(function _callee$(_context) {
          while (1) {
            switch (_context.prev = _context.next) {
              case 0:
                toUpgrade = 0;
                warning = 'The following migrations reported outdated objects:\n';
                _iteratorNormalCompletion = true;
                _didIteratorError = false;
                _iteratorError = undefined;
                _context.prev = 5;
                _iterator = this.getMigrations()[Symbol.iterator]();

              case 7:
                if (_iteratorNormalCompletion = (_step = _iterator.next()).done) {
                  _context.next = 25;
                  break;
                }

                migration = _step.value;
                _context.prev = 9;
                _context.next = 12;
                return migration.count();

              case 12:
                _count = _context.sent;

                toUpgrade += _count;
                if (_count > 0) {
                  warning += _count + ' objects - "' + migration.constructor.description + '"\n';
                }
                _context.next = 22;
                break;

              case 17:
                _context.prev = 17;
                _context.t0 = _context['catch'](9);

                this._logger.error('Error during migration.count: ' + migration.constructor.description);
                this._logger.error(_context.t0);
                throw _context.t0;

              case 22:
                _iteratorNormalCompletion = true;
                _context.next = 7;
                break;

              case 25:
                _context.next = 31;
                break;

              case 27:
                _context.prev = 27;
                _context.t1 = _context['catch'](5);
                _didIteratorError = true;
                _iteratorError = _context.t1;

              case 31:
                _context.prev = 31;
                _context.prev = 32;

                if (!_iteratorNormalCompletion && _iterator.return) {
                  _iterator.return();
                }

              case 34:
                _context.prev = 34;

                if (!_didIteratorError) {
                  _context.next = 37;
                  break;
                }

                throw _iteratorError;

              case 37:
                return _context.finish(34);

              case 38:
                return _context.finish(31);

              case 39:
                if (toUpgrade > 0 && loggingEnabled) {
                  this._logger.warning(warning);
                }
                return _context.abrupt('return', toUpgrade);

              case 41:
              case 'end':
                return _context.stop();
            }
          }
        }, _callee, this, [[5, 27, 31, 39], [9, 17], [32,, 34, 38]]);
      }));

      function count() {
        return _ref.apply(this, arguments);
      }

      return count;
    }()

    /**
     * Performs an upgrade by executing the `upgrade` method of each migration returned by the installed plugins.
     *
     * @returns The number of objects upgraded.
     */

  }, {
    key: 'upgrade',
    value: function () {
      var _ref2 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee2() {
        var migrations, maxIteration, iteration, upgradedTotal, upgradedThisIteration, totalCount, info, _iteratorNormalCompletion2, _didIteratorError2, _iteratorError2, _iterator2, _step2, migration, count;

        return regeneratorRuntime.wrap(function _callee2$(_context2) {
          while (1) {
            switch (_context2.prev = _context2.next) {
              case 0:
                migrations = this.getMigrations();
                maxIteration = 5;
                iteration = 1;
                upgradedTotal = 0;
                upgradedThisIteration = 0;
                _context2.next = 7;
                return this.count(false);

              case 7:
                totalCount = _context2.sent;
                info = void 0;


                this._logger.info('The following migrations reported upgraded objects:');

              case 10:
                if (!(totalCount !== 0)) {
                  _context2.next = 59;
                  break;
                }

                info = 'Iteration: ' + iteration + '\n';
                upgradedThisIteration = 0;
                _iteratorNormalCompletion2 = true;
                _didIteratorError2 = false;
                _iteratorError2 = undefined;
                _context2.prev = 16;
                _iterator2 = migrations[Symbol.iterator]();

              case 18:
                if (_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done) {
                  _context2.next = 37;
                  break;
                }

                migration = _step2.value;
                _context2.prev = 20;
                _context2.next = 23;
                return migration.upgrade();

              case 23:
                count = _context2.sent;

                upgradedTotal += count;
                upgradedThisIteration += count;
                if (count > 0) {
                  info += count + ' objects - "' + migration.constructor.description + '"\n';
                }
                _context2.next = 34;
                break;

              case 29:
                _context2.prev = 29;
                _context2.t0 = _context2['catch'](20);

                this._logger.error('Error during migration.upgrade: ' + migration.constructor.description);
                this._logger.error(_context2.t0);
                throw _context2.t0;

              case 34:
                _iteratorNormalCompletion2 = true;
                _context2.next = 18;
                break;

              case 37:
                _context2.next = 43;
                break;

              case 39:
                _context2.prev = 39;
                _context2.t1 = _context2['catch'](16);
                _didIteratorError2 = true;
                _iteratorError2 = _context2.t1;

              case 43:
                _context2.prev = 43;
                _context2.prev = 44;

                if (!_iteratorNormalCompletion2 && _iterator2.return) {
                  _iterator2.return();
                }

              case 46:
                _context2.prev = 46;

                if (!_didIteratorError2) {
                  _context2.next = 49;
                  break;
                }

                throw _iteratorError2;

              case 49:
                return _context2.finish(46);

              case 50:
                return _context2.finish(43);

              case 51:
                if (upgradedThisIteration > 0) {
                  this._logger.info(info);
                }

                if (!(++iteration > maxIteration)) {
                  _context2.next = 54;
                  break;
                }

                return _context2.abrupt('break', 59);

              case 54:
                _context2.next = 56;
                return this.count(false);

              case 56:
                totalCount = _context2.sent;
                _context2.next = 10;
                break;

              case 59:
                if (iteration > maxIteration) {
                  this._logger.error('The upgrade procedure could not finish after ' + maxIteration + ' iterations');
                }
                return _context2.abrupt('return', upgradedTotal);

              case 61:
              case 'end':
                return _context2.stop();
            }
          }
        }, _callee2, this, [[16, 39, 43, 51], [20, 29], [44,, 46, 50]]);
      }));

      function upgrade() {
        return _ref2.apply(this, arguments);
      }

      return upgrade;
    }()
  }]);

  return MigrationRunner;
}();

exports.default = MigrationRunner;