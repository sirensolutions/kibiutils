import { defaults } from 'lodash';
import 'core-js/stable';
import 'regenerator-runtime/runtime';
import events from 'events';
import { getBatchSize } from './lib/bulk_operations';

/**
 * The base class for migrations.
 */
export default class Migration {
  /**
   * Returns the description of the migration.
   */
  static get description() {
    return 'No description';
  }

  /**
   * Creates a new Migration.
   *
   * @param configuration {object} The migration configuration.
   */
  constructor(configuration) {
    if (!configuration) throw new Error('Configuration not specified.');

    this._client = configuration.client;
    this._config = configuration.config;
    this._logger = configuration.logger;
  }

  get logger() {
    if (this._logger) {
      return this._logger;
    }
    return {
      // eslint-disable-next-line no-console
      info: console.info,
      // eslint-disable-next-line no-console
      error: console.error,
      // eslint-disable-next-line no-console
      warning: console.warn,
      // eslint-disable-next-line no-console
      debug: console.debug
    };
  }

  /**
   * Tries to parse objectString to JSON Object, logs warning and returns {} on failure.
   * @param {String} objectString
   * @returns Parsed JSON Object or {} on failure
   */
  parseJSON(objectString) {
    try {
      return JSON.parse(objectString);
    } catch (e) {
      this.logger.warning(`Unable to parse to JSON object: ${objectString}`);
      this.logger.error(e);
      return {};
    }
  }

  /**
   * Returns the number of objects that can be upgraded by this migration.
   */
  async count() {
    return 0;
  }

  /**
   * Retrieves the total hit count from a response object
   * @param  {Object} response
   * @return {Number} Total hit count
   */
  getTotalHitCount(response) {
    const total = response.hits.total;
    if (typeof total === 'object') {
      return total.value;
    }
    return total;
  }

  /**
   * Performs an upgrade and returns the number of objects upgraded.
   */
  async upgrade() {
    return 0;
  }

  /**
   * Performs an Elasticsearch query using the scroll API and returns the hits.
   *
   * @param index - The index to search.
   * @param type - The type to search.
   * @param query - The query body.
   * @param options - Additional options for the search method; currently the
   *                  only supported one is `size`.
   * @params returnEventEmitter - optional, if provided the method will return an event emitter instead of hits
   *                              and will emit "data", "error", and "end" events in order to reduce the memory usage
   * @return The search hits or event emitter.
   */
  async scrollSearch(index, type, query, options, returnEventEmitter = false) {
    if (!index) {
      throw new Error('Calling scroll search API without specifying an index is not allowed in migrations');
    }
    const objects = [];
    const emitter = returnEventEmitter === true ? new events.EventEmitter() : undefined;
    let emmitedObjects = 0;

    const opts = defaults(options || {}, {
      size: 100
    });

    const searchOptions = {
      index: index,
      type: type,
      scroll: '1m',
      size: opts.size
    };

    if (query) {
      searchOptions.body = query;
    }

    async function executeLoop() {
      let response = await this._client.search(searchOptions);

      while (true) {
        if (emitter) {
          emitter.emit('data', response.hits.hits);
          emmitedObjects += response.hits.hits.length;
        } else {
          objects.push(...response.hits.hits);
        }
        if (
          (emitter && emmitedObjects === this.getTotalHitCount(response)) ||
          (!emitter && objects.length === this.getTotalHitCount(response))
        ) {
          if (response._scroll_id) {
            try {
              await this._client.clearScroll({
                body: {
                  scroll_id: response._scroll_id
                }
              });
            } catch (error) {
              if (emitter) {
                emitter.emit('error', error);
              } else {
                throw error;
              }
            }
          }
          if (emitter) {
            emitter.emit('end', { total: emmitedObjects });
          }
          break;
        }
        try {
          response = await this._client.scroll({
            body: {
              scroll: '1m',
              scroll_id: response._scroll_id
            }
          });
        } catch (error) {
          if (emitter) {
            emitter.emit('error', error);
            break;
          } else {
            throw error;
          }
        }
      }
    }

    if (emitter) {
      // execute the loop in the next tick so the caller have a chance to register handlers
      setTimeout(() => executeLoop.call(this));
      return emitter
    }

    await executeLoop.call(this);
    return objects;
  }

  /**
   * Performs an Elasticsearch query and returns the number of hits.
   *
   * @param index - The index to search.
   * @param type - The type to search.
   * @param query - The query body.
   * @return The number of search hits.
   */
  async countHits(index, type, query) {
    const searchOptions = {
      index: index,
      type: type,
      body: query
    };

    const response = await this._client.count(searchOptions);
    return response.count;
  }

  /**
   * Executes an Elasticsearch bulk request to index documents in .siren index
   * To avoid too large request body it splits the request in batches
   * @param bulkBody - An array with bulk operations
   * @param batchOperationNumber - Number of operations to include in a single batch, by operation we mean index, delete, update
   */
  async executeteBulkRequest(bulkBody, batchOperationNumber = 250) {
    while (bulkBody.length > 0) {
      const batchSize = getBatchSize(bulkBody, batchOperationNumber)
      await this._client.bulk({
        refresh: true,
        body: bulkBody.splice(0, batchSize)
      });
    }
  }

}
