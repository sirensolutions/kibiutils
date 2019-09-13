import Migration from './migration';

export default class SimpleMigration extends Migration {
  constructor(configuration) {
    super(configuration);
    this._defaultIndex = configuration.config.get('kibana.index');
    this._defaultType = 'doc';

  }

  /**
   * @return {number}
   */
  get newVersion() {
    if (!this._newVersion) {
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
   */
  async count() {
    const { index, type, query } = this._getSearchParams();
    const objects = await this.scrollSearch(index, type, query);
    let count = 0;
    for (let i = 0; i < objects.length; i++) {
      const savedObject = objects[i];
      const currentVersion = savedObject._source[savedObject.type].version;
      if (parseInt(currentVersion) < this.newVersion) {
        if (await this._shouldObjectUpgrade(savedObject)) {
          count++;
        }
      }
    }
    return count;
  }

  /**
   * Performs an upgrade and returns the number of objects upgraded.
   */
  async upgrade() {
    const migrationCount = await this.count();
    if (migrationCount > 0) {
      const { index, type, query } = this._getSearchParams();
      const objects = await this.scrollSearch(index, type, query, this.scrollOptions);
      const bulkIndex = [];
      let upgradeCount = 0;
      objects.forEach(obj => {
        if (this._shouldObjectUpgrade(obj)) {
          const { _index, _type, _id, _source } = this._upgradeObject(obj);
          bulkIndex.push({
            index: { _index, _type, _id }
          });
          bulkIndex.push(_source);
          upgradeCount++;
        }
      });

      if (upgradeCount > 0) {
        await this._client.bulk({
          refresh: true,
          body: bulkIndex
        });
      }
      return upgradeCount;
    }
    return migrationCount;
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
      params.index = this._defaultIndex;
      params.type = this._defaultType;
      params.query = {
        query: {
          match: {
            type: this._savedObjectType
          }
        }
      };
    } else if (this._searchQuery) {
      params.index = this._index || this._defaultIndex;
      params.type = this._type || this._defaultType;
      params.query = this._searchQuery;
    } else {
      throw new Error('Every SimpleMigration must define _savedObjectType (String) or _searchQuery (Object)!');
    }
    return params;
  }
};