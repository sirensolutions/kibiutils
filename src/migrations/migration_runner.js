import { each } from 'lodash';
require('babel-polyfill');
import PatchedEsClient from './patched_es_client';

/**
 * A migration runner.
 */
export default class MigrationRunner {
  /**
   * Creates a new Migration runner.
   *
   * @param {MigrationLogger} logger A logger instance.
   * @param {KbnServer.server} server A server instance.
   */
  constructor(server, logger, kbnServer, debug = false) {
    this._server = server;
    this._logger = logger;
    this._kbnServer = kbnServer;
    this._patchedClient = new PatchedEsClient(server.plugins.elasticsearch.getCluster('admin').getClient(), logger);
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
  getMigrations() {
    if (this._migrations) {
      return this._migrations;
    }
    const migrations = [];
    const coreMigrations = [];
    each(this._kbnServer.migrations, (pluginMigrations, id) => {
      each(pluginMigrations, Migration => {
        const configuration = {
          config: this._server.config(),
          client: this._patchedClient.getEsClient(),
          logger: this._logger,
          server: this._server
        };
        const migration = new Migration(configuration);
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
  async count(loggingEnabled = true) {
    let toUpgrade = 0;
    let warning = 'The following migrations reported outdated objects:\n';
    const migrations = this.getMigrations();
    const migrationsNo = migrations.length;
    for (let i = 0; i < migrations.length; i++) {
      const migration = migrations[i];
      if (this._debug) {
        this._logger.debug('--------------------------------------------------------------------------------');
        this._logger.debug(`Migration ${i + 1} out of ${migrationsNo}: ${migration.constructor.description}`);
      }
      try {
        const start = Date.now();
        const count = await migration.count();
        if (this._debug) {
          const stop = Date.now();
          this._logger.debug(`${count} objects to upgrade detected`)
          this._logger.debug(`${((stop - start)/1000).toFixed(2)} s execution time`);
        }
        toUpgrade += count;
        if (count > 0) {
          warning += `${count} objects - "${migration.constructor.description}"\n`;
        }
      } catch (e) {
        this._logger.error(`Error during migration.count: ${migration.constructor.description}`);
        this._logger.error(e);
        throw e;
      }
    }
    if (toUpgrade > 0 && loggingEnabled) {
      this._logger.warning(warning);
    }
    return toUpgrade;
  }

  /**
   * Performs an upgrade by executing the `upgrade` method of each migration returned by the installed plugins.
   *
   * @returns The number of objects upgraded.
   */
  async upgrade() {
    const migrations = this.getMigrations();
    const migrationsNo = migrations.length;
    const maxIteration = 5;
    let iteration = 1;
    let upgradedTotal = 0;
    let upgradedThisIteration = 0;
    let totalCount = await this.count(false);
    let info;

    this._logger.info('The following migrations reported upgraded objects:');
    while (totalCount !== 0) {
      info = `Iteration: ${iteration}\n`;
      upgradedThisIteration = 0;
      for (let i = 0; i < migrations.length; i++) {
        const migration = migrations[i];
        if (this._debug) {
          this._logger.debug('--------------------------------------------------------------------------------');
          this._logger.debug(`Migration ${i + 1} out of ${migrationsNo}: ${migration.constructor.description}`);
        }
        try {
          const start = Date.now();
          const count = await migration.upgrade();
          if (this._debug) {
            const stop = Date.now();
            this._logger.debug(`${count} upgraded objects`)
            this._logger.debug(`${((stop - start)/1000).toFixed(2)} s execution time`);
          }
          upgradedTotal += count;
          upgradedThisIteration += count;
          if (count > 0) {
            info += `${count} objects - "${migration.constructor.description}"\n`;
          }
        } catch (e) {
          this._logger.error(`Error during migration.upgrade: ${migration.constructor.description}`);
          this._logger.error(e);
          throw e;
        }
      }
      if (upgradedThisIteration > 0) {
        this._logger.info(info);
      }
      if (++iteration > maxIteration) {
        break;
      }
      totalCount = await this.count(false);
    }
    if (iteration > maxIteration) {
      this._logger.error(`The upgrade procedure could not finish after ${maxIteration} iterations`);
    }
    return upgradedTotal;
  }

  cleanup() {
    this._patchedClient.cleanup();
  }
}
