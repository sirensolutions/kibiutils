'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _lodash = require('lodash');

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

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
  function MigrationRunner(server, logger) {
    _classCallCheck(this, MigrationRunner);

    this._server = server;
    this._logger = logger;
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
      (0, _lodash.each)(this._server.plugins, function (plugin) {
        if ((0, _lodash.has)(plugin, 'getMigrations')) {
          var _iteratorNormalCompletion = true;
          var _didIteratorError = false;
          var _iteratorError = undefined;

          try {
            for (var _iterator = plugin.getMigrations()[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
              var Migration = _step.value;

              var configuration = {
                index: _this._server.config().get('kibana.index'),
                client: _this._server.plugins.elasticsearch.getCluster("admin").getClient(),
                logger: _this._logger
              };
              var migration = new Migration(configuration);
              migrations.push(migration);
            }
          } catch (err) {
            _didIteratorError = true;
            _iteratorError = err;
          } finally {
            try {
              if (!_iteratorNormalCompletion && _iterator.return) {
                _iterator.return();
              }
            } finally {
              if (_didIteratorError) {
                throw _iteratorError;
              }
            }
          }
        }
      });
      this._migrations = migrations;
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
      var _ref = _asyncToGenerator(regeneratorRuntime.mark(function _callee() {
        var count, _iteratorNormalCompletion2, _didIteratorError2, _iteratorError2, _iterator2, _step2, migration;

        return regeneratorRuntime.wrap(function _callee$(_context) {
          while (1) {
            switch (_context.prev = _context.next) {
              case 0:
                count = 0;
                _iteratorNormalCompletion2 = true;
                _didIteratorError2 = false;
                _iteratorError2 = undefined;
                _context.prev = 4;
                _iterator2 = this.getMigrations()[Symbol.iterator]();

              case 6:
                if (_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done) {
                  _context.next = 14;
                  break;
                }

                migration = _step2.value;
                _context.next = 10;
                return migration.count();

              case 10:
                count += _context.sent;

              case 11:
                _iteratorNormalCompletion2 = true;
                _context.next = 6;
                break;

              case 14:
                _context.next = 20;
                break;

              case 16:
                _context.prev = 16;
                _context.t0 = _context['catch'](4);
                _didIteratorError2 = true;
                _iteratorError2 = _context.t0;

              case 20:
                _context.prev = 20;
                _context.prev = 21;

                if (!_iteratorNormalCompletion2 && _iterator2.return) {
                  _iterator2.return();
                }

              case 23:
                _context.prev = 23;

                if (!_didIteratorError2) {
                  _context.next = 26;
                  break;
                }

                throw _iteratorError2;

              case 26:
                return _context.finish(23);

              case 27:
                return _context.finish(20);

              case 28:
                return _context.abrupt('return', count);

              case 29:
              case 'end':
                return _context.stop();
            }
          }
        }, _callee, this, [[4, 16, 20, 28], [21,, 23, 27]]);
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
      var _ref2 = _asyncToGenerator(regeneratorRuntime.mark(function _callee2() {
        var upgraded, _iteratorNormalCompletion3, _didIteratorError3, _iteratorError3, _iterator3, _step3, migration, count;

        return regeneratorRuntime.wrap(function _callee2$(_context2) {
          while (1) {
            switch (_context2.prev = _context2.next) {
              case 0:
                upgraded = 0;
                _iteratorNormalCompletion3 = true;
                _didIteratorError3 = false;
                _iteratorError3 = undefined;
                _context2.prev = 4;
                _iterator3 = this.getMigrations()[Symbol.iterator]();

              case 6:
                if (_iteratorNormalCompletion3 = (_step3 = _iterator3.next()).done) {
                  _context2.next = 18;
                  break;
                }

                migration = _step3.value;

                this._logger.info('Processing migration "' + migration.constructor.description + '"');
                _context2.next = 11;
                return migration.upgrade();

              case 11:
                count = _context2.sent;

                upgraded += count;
                if (count > 0) {
                  this._logger.info('Upgraded ' + count + ' objects.');
                } else {
                  this._logger.info('No objects upgraded.');
                }
                this._logger.info('Processed migration "' + migration.constructor.description + '"');

              case 15:
                _iteratorNormalCompletion3 = true;
                _context2.next = 6;
                break;

              case 18:
                _context2.next = 24;
                break;

              case 20:
                _context2.prev = 20;
                _context2.t0 = _context2['catch'](4);
                _didIteratorError3 = true;
                _iteratorError3 = _context2.t0;

              case 24:
                _context2.prev = 24;
                _context2.prev = 25;

                if (!_iteratorNormalCompletion3 && _iterator3.return) {
                  _iterator3.return();
                }

              case 27:
                _context2.prev = 27;

                if (!_didIteratorError3) {
                  _context2.next = 30;
                  break;
                }

                throw _iteratorError3;

              case 30:
                return _context2.finish(27);

              case 31:
                return _context2.finish(24);

              case 32:
                return _context2.abrupt('return', upgraded);

              case 33:
              case 'end':
                return _context2.stop();
            }
          }
        }, _callee2, this, [[4, 20, 24, 32], [25,, 27, 31]]);
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
;