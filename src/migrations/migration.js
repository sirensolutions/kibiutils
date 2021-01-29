import { defaults } from 'lodash';
require('babel-polyfill');

function getErrorIdentifier(error) {
  let errorType = '';
  for (let i = 0; i < 3; i++) { //Limiting the nesting to 3 for performance
    errorType += error.type;
    if (error.caused_by) {
      error = error.caused_by;
    } else {
      break;
    }
  }
  return errorType;
}

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
   * Parses the {@link bulkResponse} for errors, logs (unique errors) and throws if found.
   * @param {Object} bulkResponse
   * @param {string} actionType
   * @param {Logger} logger
   */
  static checkBulkResponse(bulkResponse, actionType, logger) {
    if (bulkResponse.errors) {
      const errorsDuringIndexing = bulkResponse.items.filter((ele) => ele[actionType].error);
      errorsDuringIndexing.reduce(function (uniqueErrors, ele) {
        const errorIdentifier = getErrorIdentifier(ele.index.error);
        const existingError = uniqueErrors.find((ele) => ele.index.error._identifier === errorIdentifier);
        if (!existingError) {
          ele.index.error._identifier = errorIdentifier;
          ele.index.error.errorCount = 1;
          ele.index.docIds = [ ele.index._id ];
          uniqueErrors.push(ele);
        } else {
          existingError.index.error.errorCount++;
          if (existingError.index.docIds.length < 5) {
            existingError.index.docIds.push(ele.index._id);
          }
        }
        return uniqueErrors;
      }, []);

      let totalErrors = 0;
      errorsDuringIndexing.forEach(ele => {
        const error = ele[actionType].error;
        const causedBy = error.caused_by || error;
        // Should we also log (upto first 5) docIds?
        logger.error(`(${error.errorCount}) ${error.type}: ${causedBy.reason}`);
        totalErrors += error.errorCount;
      });
      throw new Error(`${totalErrors} error(s) occurred in bulk request`);

    } else if (bulkResponse.error !== undefined) {
      logger.error(bulkResponse.error);
      throw new Error(bulkResponse.error);
    }
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
      info:    console.info,
      // eslint-disable-next-line no-console
      error:   console.error,
      // eslint-disable-next-line no-console
      warning: console.warn
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
   * @return The search hits.
   */
  async scrollSearch(index, type, query, options) {
    const objects = [];

    const opts = defaults(options || {}, {
      size: 100
    });

    const searchOptions = {
      index:  index,
      type:   type,
      scroll: '1m',
      size:   opts.size
    };

    if (query) {
      searchOptions.body = query;
    }

    let response = await this._client.search(searchOptions);

    while (true) {
      objects.push(...response.hits.hits);
      if (objects.length === this.getTotalHitCount(response)) {
        if (response._scroll_id) {
          await this._client.clearScroll({
            body: {
              scroll_id: response._scroll_id
            }
          });
        }
        break;
      }
      response = await this._client.scroll({
        body: {
          scroll:    '1m',
          scroll_id: response._scroll_id
        }
      });
    }

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
      type:  type,
      body:  query
    };

    const response = await this._client.count(searchOptions);
    return response.count;
  }
}
