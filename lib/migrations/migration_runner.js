"use strict";

require("core-js/modules/es.object.to-string.js");

require("core-js/modules/es.promise.js");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

require("regenerator-runtime/runtime.js");

require("core-js/modules/es.array.index-of.js");

require("core-js/modules/es.array.concat.js");

require("core-js/modules/es.symbol.js");

require("core-js/modules/es.symbol.description.js");

require("core-js/modules/es.number.to-fixed.js");

var _lodash = require("lodash");

require("core-js/stable");

require("regenerator-runtime/runtime");

var _patched_es_client = _interopRequireDefault(require("./patched_es_client"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(_next, _throw); } }

function _asyncToGenerator(fn) { return function () { var self = this, args = arguments; return new Promise(function (resolve, reject) { var gen = fn.apply(self, args); function _next(value) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "next", value); } function _throw(err) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "throw", err); } _next(undefined); }); }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

/**
 * A migration runner.
 */
var MigrationRunner = /*#__PURE__*/function () {
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
    this._patchedClient = new _patched_es_client.default(server.plugins.elasticsearch.getCluster('admin').getClient(), logger);
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
    key: "getMigrations",
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
    key: "count",
    value: function () {
      var _count = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee() {
        var loggingEnabled,
            toUpgrade,
            warning,
            migrations,
            migrationsNo,
            i,
            migration,
            start,
            _count2,
            stop,
            _args = arguments;

        return regeneratorRuntime.wrap(function _callee$(_context) {
          while (1) {
            switch (_context.prev = _context.next) {
              case 0:
                loggingEnabled = _args.length > 0 && _args[0] !== undefined ? _args[0] : true;
                toUpgrade = 0;
                warning = 'The following migrations reported outdated objects:\n';
                migrations = this.getMigrations();
                migrationsNo = migrations.length;
                i = 0;

              case 6:
                if (!(i < migrations.length)) {
                  _context.next = 27;
                  break;
                }

                migration = migrations[i];

                if (this._debug) {
                  this._logger.debug('--------------------------------------------------------------------------------');

                  this._logger.debug("Migration ".concat(i + 1, " out of ").concat(migrationsNo, ": ").concat(migration.constructor.description));
                }

                _context.prev = 9;
                start = Date.now();
                _context.next = 13;
                return migration.count();

              case 13:
                _count2 = _context.sent;

                if (this._debug) {
                  stop = Date.now();

                  this._logger.debug("".concat(_count2, " objects to upgrade detected"));

                  this._logger.debug("".concat(((stop - start) / 1000).toFixed(2), "s execution time"));
                }

                toUpgrade += _count2;

                if (_count2 > 0) {
                  warning += "".concat(_count2, " objects - \"").concat(migration.constructor.description, "\"\n");
                }

                _context.next = 24;
                break;

              case 19:
                _context.prev = 19;
                _context.t0 = _context["catch"](9);

                this._logger.error("Error during migration.count: ".concat(migration.constructor.description));

                this._logger.error(_context.t0);

                throw _context.t0;

              case 24:
                i++;
                _context.next = 6;
                break;

              case 27:
                if (toUpgrade > 0 && loggingEnabled) {
                  this._logger.warning(warning);
                }

                return _context.abrupt("return", toUpgrade);

              case 29:
              case "end":
                return _context.stop();
            }
          }
        }, _callee, this, [[9, 19]]);
      }));

      function count() {
        return _count.apply(this, arguments);
      }

      return count;
    }()
    /**
     * Performs an upgrade by executing the `upgrade` method of each migration returned by the installed plugins.
     *
     * @returns The number of objects upgraded.
     */

  }, {
    key: "upgrade",
    value: function () {
      var _upgrade = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee2() {
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

                this._logger.info('The following migrations reported upgraded objects:');

              case 10:
                if (!(totalCount !== 0)) {
                  _context2.next = 44;
                  break;
                }

                info = "Iteration: ".concat(iteration, "\n");
                upgradedThisIteration = 0;
                i = 0;

              case 14:
                if (!(i < migrations.length)) {
                  _context2.next = 36;
                  break;
                }

                migration = migrations[i];

                if (this._debug) {
                  this._logger.debug('--------------------------------------------------------------------------------');

                  this._logger.debug("Migration ".concat(i + 1, " out of ").concat(migrationsNo, ": ").concat(migration.constructor.description));
                }

                _context2.prev = 17;
                start = Date.now();
                _context2.next = 21;
                return migration.upgrade();

              case 21:
                count = _context2.sent;

                if (this._debug) {
                  stop = Date.now();

                  this._logger.debug("".concat(count, " upgraded objects"));

                  this._logger.debug("".concat(((stop - start) / 1000).toFixed(2), "s execution time"));
                }

                upgradedTotal += count;
                upgradedThisIteration += count;

                if (count > 0) {
                  info += "".concat(count, " objects - \"").concat(migration.constructor.description, "\"\n");
                }

                _context2.next = 33;
                break;

              case 28:
                _context2.prev = 28;
                _context2.t0 = _context2["catch"](17);

                this._logger.error("Error during migration.upgrade: ".concat(migration.constructor.description));

                this._logger.error(_context2.t0);

                throw _context2.t0;

              case 33:
                i++;
                _context2.next = 14;
                break;

              case 36:
                if (upgradedThisIteration > 0) {
                  this._logger.info(info);
                }

                if (!(++iteration > maxIteration)) {
                  _context2.next = 39;
                  break;
                }

                return _context2.abrupt("break", 44);

              case 39:
                _context2.next = 41;
                return this.count(false);

              case 41:
                totalCount = _context2.sent;
                _context2.next = 10;
                break;

              case 44:
                if (iteration > maxIteration) {
                  this._logger.error("The upgrade procedure could not finish after ".concat(maxIteration, " iterations"));
                }

                return _context2.abrupt("return", upgradedTotal);

              case 46:
              case "end":
                return _context2.stop();
            }
          }
        }, _callee2, this, [[17, 28]]);
      }));

      function upgrade() {
        return _upgrade.apply(this, arguments);
      }

      return upgrade;
    }()
  }, {
    key: "cleanup",
    value: function cleanup() {
      this._patchedClient.cleanup();
    }
  }]);

  return MigrationRunner;
}();

exports.default = MigrationRunner;
module.exports = exports.default;