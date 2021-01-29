import Migration from './migration';
const DEFAULT_TYPE = 'doc';

/**
 * SimpleMigration requires you to declare _savedObjectType OR _searchQuery, _newVersion, _index (optional), _type (optional),
 * in constructor and two methods: _shouldObjectUpgrade and _upgradeObject which would be passed the objects by
 * the base class to count and upgrade objects if the version is < _newVersion.
 *
 * Warning: Every new migration should bump the saved object's Version (defined by _newVersion, positive integer).
 */
export default class SimpleMigration extends Migration {
  constructor(configuration) {
    super(configuration);
    this._defaultIndex = configuration.config.get('kibana.index');
  }

  /**
   * @return {number}
   */
  get newVersion() {
    if (!this._newVersion || !(parseInt(this._newVersion) > 0)) {
      throw new Error('Every SimpleMigration must declare a new object version (positive integer).');
    }
    return parseInt(this._newVersion);
  }

  get scrollOptions() {
    return this._scrollOptions || {
      size: 100
    };
  }

  /**
   * Returns the number of objects that can be upgraded by this migration.
   * @return {number}
   */
  async count() {
    const { index, type, query } = this._getSearchParams();
    const objects = await this.scrollSearch(index, type, query);
    let count = 0;
    for (const savedObject of objects) {
      if (await this.checkOutdated(savedObject)) {
        count++;
      }
    }
    return count;
  }

  /**
   * Performs an upgrade and returns the number of objects upgraded.
   * @return {number}
   */
  async upgrade() {
    const migrationCount = await this.count();
    if (migrationCount > 0) {
      const { index, type, query } = this._getSearchParams();
      const objects = await this.scrollSearch(index, type, query, this.scrollOptions);
      const bulkBody = [];
      let upgradeCount = 0;
      const bulkAction = 'index';
      for (const savedObject of objects) {
        if (await this.checkOutdated(savedObject)) {
          const { _index, _type, _id, _source } = await this._upgradeObject(savedObject);
          _source[_source.type].version = this.newVersion;
          bulkBody.push({
            [bulkAction]: { _index, _type, _id }
          });
          bulkBody.push(_source);
          upgradeCount++;
        }
      }

      if (upgradeCount > 0) {
        const bulkResponse = await this._client.bulk({
          refresh: true,
          body:    bulkBody
        });
        Migration.checkBulkResponse(bulkResponse, bulkAction, this.logger);
      }
      return upgradeCount;
    }
    return migrationCount;
  }

  /**
   * Checks if the saved object is outdated.
   * @param  {Object} savedObject
   * @return {boolean}
   */
  async checkOutdated(savedObject) {
    const currentVersion = savedObject._source[savedObject._source.type].version || 0;
    if (parseInt(currentVersion) < this.newVersion) {
      return await this._shouldObjectUpgrade(savedObject);
    }
    return false;
  }

  /**
   * Determine if the passed object require a Migration
   * @param {Object} object; Saved Object of form:
   * {
   *   _index: {String},
   *   _type: {String},
   *   _id: {String},
   *   _source: {
   *     type: {String},
   *     [type]: {Object}
   *   }
   * }
   * @return {boolean}
   */
  async _shouldObjectUpgrade(object) {
    throw new Error('Every SimpleMigration must implement _shouldObjectUpgrade method.');
  }

  /**
   * Upgrades the passed object
   * @param {Object} object; Saved Object of form:
   * {
   *   _index: {String},
   *   _type: {String},
   *   _id: {String},
   *   _source: {
   *     type: {String},
   *     [type]: {Object}
   *   }
   * }
   * @return {Object} upgraded object
   */
  async _upgradeObject(object) {
    throw new Error('Every SimpleMigration must implement _upgradeObject method.');
  }

  _getSearchParams() {
    const params = {};
    if (this._savedObjectType) {
      if (this._searchQuery) {
        throw new Error('You may only define either _savedObjectType OR _searchQuery, Not Both!');
      }
      params.index = this._index || this._defaultIndex;
      params.type = this._type || DEFAULT_TYPE;
      params.query = {
        query: {
          match: {
            type: this._savedObjectType
          }
        }
      };
    } else if (this._searchQuery) {
      params.index = this._index || this._defaultIndex;
      params.type = this._type || DEFAULT_TYPE;
      params.query = this._searchQuery;
    } else {
      throw new Error('Every SimpleMigration must define _savedObjectType (String) or _searchQuery (Object)!');
    }
    return params;
  }
}
