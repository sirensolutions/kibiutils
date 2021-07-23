'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _lodash = require('lodash');

var _patched_es_client = require('./patched_es_client');

var _patched_es_client2 = _interopRequireDefault(_patched_es_client);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

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
    var debug = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : false;

    _classCallCheck(this, MigrationRunner);

    this._server = server;
    this._logger = logger;
    this._kbnServer = kbnServer;
    this._patchedClient = new _patched_es_client2.default(server.plugins.elasticsearch.getCluster('admin').getClient(), logger);
    this._debug = debug;
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
            client: _this._patchedClient.getEsClient(),
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

        var toUpgrade, warning, migrations, migrationsNo, i, migration, start, _count, stop;

        return regeneratorRuntime.wrap(function _callee$(_context) {
          while (1) {
            switch (_context.prev = _context.next) {
              case 0:
                toUpgrade = 0;
                warning = 'The following migrations reported outdated objects:\n';
                migrations = this.getMigrations();
                migrationsNo = migrations.length;
                i = 0;

              case 5:
                if (!(i < migrations.length)) {
                  _context.next = 26;
                  break;
                }

                migration = migrations[i];

                if (this._debug) {
                  this._logger.debug('--------------------------------------------------------------------------------');
                  this._logger.debug('Migration ' + (i + 1) + ' out of ' + migrationsNo + ': ' + migration.constructor.description);
                }
                _context.prev = 8;
                start = Date.now();
                _context.next = 12;
                return migration.count();

              case 12:
                _count = _context.sent;

                if (this._debug) {
                  stop = Date.now();

                  this._logger.debug(_count + ' objects to upgrade detected');
                  this._logger.debug(((stop - start) / 1000).toFixed(2) + 's execution time');
                }
                toUpgrade += _count;
                if (_count > 0) {
                  warning += _count + ' objects - "' + migration.constructor.description + '"\n';
                }
                _context.next = 23;
                break;

              case 18:
                _context.prev = 18;
                _context.t0 = _context['catch'](8);

                this._logger.error('Error during migration.count: ' + migration.constructor.description);
                this._logger.error(_context.t0);
                throw _context.t0;

              case 23:
                i++;
                _context.next = 5;
                break;

              case 26:
                if (toUpgrade > 0 && loggingEnabled) {
                  this._logger.warning(warning);
                }
                return _context.abrupt('return', toUpgrade);

              case 28:
              case 'end':
                return _context.stop();
            }
          }
        }, _callee, this, [[8, 18]]);
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
        var migrations, migrationsNo, maxIteration, iteration, upgradedTotal, upgradedThisIteration, totalCount, info, i, migration, start, count, stop;
        return regeneratorRuntime.wrap(function _callee2$(_context2) {
          while (1) {
            switch (_context2.prev = _context2.next) {
              case 0:
                migrations = this.getMigrations();
                migrationsNo = migrations.length;
                maxIteration = 5;
                iteration = 1;
                upgradedTotal = 0;
                upgradedThisIteration = 0;
                _context2.next = 8;
                return this.count(false);

              case 8:
                totalCount = _context2.sent;
                info = void 0;


                this._logger.info('The following migrations reported upgraded objects:');

              case 11:
                if (!(totalCount !== 0)) {
                  _context2.next = 45;
                  break;
                }

                info = 'Iteration: ' + iteration + '\n';
                upgradedThisIteration = 0;
                i = 0;

              case 15:
                if (!(i < migrations.length)) {
                  _context2.next = 37;
                  break;
                }

                migration = migrations[i];

                if (this._debug) {
                  this._logger.debug('--------------------------------------------------------------------------------');
                  this._logger.debug('Migration ' + (i + 1) + ' out of ' + migrationsNo + ': ' + migration.constructor.description);
                }
                _context2.prev = 18;
                start = Date.now();
                _context2.next = 22;
                return migration.upgrade();

              case 22:
                count = _context2.sent;

                if (this._debug) {
                  stop = Date.now();

                  this._logger.debug(count + ' upgraded objects');
                  this._logger.debug(((stop - start) / 1000).toFixed(2) + 's execution time');
                }
                upgradedTotal += count;
                upgradedThisIteration += count;
                if (count > 0) {
                  info += count + ' objects - "' + migration.constructor.description + '"\n';
                }
                _context2.next = 34;
                break;

              case 29:
                _context2.prev = 29;
                _context2.t0 = _context2['catch'](18);

                this._logger.error('Error during migration.upgrade: ' + migration.constructor.description);
                this._logger.error(_context2.t0);
                throw _context2.t0;

              case 34:
                i++;
                _context2.next = 15;
                break;

              case 37:
                if (upgradedThisIteration > 0) {
                  this._logger.info(info);
                }

                if (!(++iteration > maxIteration)) {
                  _context2.next = 40;
                  break;
                }

                return _context2.abrupt('break', 45);

              case 40:
                _context2.next = 42;
                return this.count(false);

              case 42:
                totalCount = _context2.sent;
                _context2.next = 11;
                break;

              case 45:
                if (iteration > maxIteration) {
                  this._logger.error('The upgrade procedure could not finish after ' + maxIteration + ' iterations');
                }
                return _context2.abrupt('return', upgradedTotal);

              case 47:
              case 'end':
                return _context2.stop();
            }
          }
        }, _callee2, this, [[18, 29]]);
      }));

      function upgrade() {
        return _ref2.apply(this, arguments);
      }

      return upgrade;
    }()
  }, {
    key: 'cleanup',
    value: function cleanup() {
      this._patchedClient.cleanup();
    }
  }]);

  return MigrationRunner;
}();

exports.default = MigrationRunner;