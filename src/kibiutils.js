(function () {
  require('babel-polyfill');

  function KibiUtils() {}

  KibiUtils.prototype = (function () {

    //
    // PRIVATE methods
    //

    const _checkSingleQuery = function (query) {

      const entityRegex = /@doc\[.+?\]@/;
      const multilineCommentRegex = /\/\*(.|[\r\n])*?\*\//g;
      const singleLineRegex = /(-- |# |\/\/).*/g;

      // check for sparql and sql queries
      const activationQueryCheck = query.activationQuery &&
        entityRegex.test(query.activationQuery.replace(multilineCommentRegex, '').replace(singleLineRegex, ''));
      const resultQueryCheck = query.resultQuery &&
        entityRegex.test(query.resultQuery.replace(multilineCommentRegex, '').replace(singleLineRegex, ''));
      if (activationQueryCheck || resultQueryCheck) {
        // requires entityURI
        return true;
      }
      // test for rest queries
      if (query.rest_params || query.rest_headers || query.rest_body || query.rest_path) {
        if (entityRegex.test(query.rest_body)) {
          // requires entityURI
          return true;
        }
        if (entityRegex.test(query.rest_path)) {
          // requires entityURI
          return true;
        }

        let i;
        if (query.rest_params) {
          for (i = 0; i < query.rest_params.length; i++) {
            if (entityRegex.test(query.rest_params[i].value)) {
              return true;
            }
          }
        }
        if (query.rest_headers) {
          for (i = 0; i < query.rest_headers.length; i++) {
            if (entityRegex.test(query.rest_headers[i].value)) {
              return true;
            }
          }
        }
      }
      return false;
    };

    const doesQueryDependOnEntity = function (queries) {
      for (let i = 0; i < queries.length; i++) {
        if (_checkSingleQuery(queries[i])) {
          return true;
        }
      }
      return false;
    };

    /**
     * Returns the values at path. Contrary to _goToElement0 the path does not take care of index in an array,
     * it will check all values.
     *
     * @param json the JSON object
     * @param path the path as an array
     * @returns an array with all the values reachable from path
     */
    const getValuesAtPath = function (json, path) {
      if (!path || !path.length) {
        return [];
      }

      const values = [];

      const getValues = function (element, pathIndex) {
        if (!element) {
          return;
        }

        if (pathIndex >= path.length) {
          if (element) {
            if (element.constructor === Object) {
              throw new Error('The value at ' + path.join('.') + ' cannot be an object: ' + JSON.stringify(json, null, ' '));
            }
            if (element.constructor === Array) {
              for (let i = 0; i < element.length; i++) {
                if (element[i]) {
                  if (element[i].constructor === Object) {
                    throw new Error('The value at ' + path.join('.') + ' cannot be an object: ' + JSON.stringify(json, null, ' '));
                  }
                  values.push(element[i]);
                }
              }
            } else {
              values.push(element);
            }
          }
        } else if (element.constructor === Object) {
          if (element.hasOwnProperty(path[pathIndex])) {
            getValues(element[path[pathIndex]], pathIndex + 1);
          }
        } else if (element.constructor === Array) {
          for (let childi = 0; childi < element.length; childi++) {
            getValues(element[childi], pathIndex);
          }
        } else {
          throw new Error('Unexpected JSON type in object: ' + JSON.stringify(json, null, ' '));
        }
      };

      getValues(json, 0);
      return values;
    };

    const _goToElement0 = function (json, path, ind, cb) {
      // the path is created from splitting a string on PATH_SEPARATOR.
      // If that string is empty, then the element in the array
      // is an empty string.
      if (path.length === ind || path[ind].length === 0) {
        cb(json);
      } else {
        // Walk down the path
        if (json.constructor === Object) {
          if (!json.hasOwnProperty(path[ind])) {
            throw new Error('No property=[' + path[ind] + '] in ' + JSON.stringify(json, null, ' '));
          }
          _goToElement0(json[path[ind]], path, ind + 1, cb);
        } else if (json.constructor === Array) {
          const arrayInd = parseInt(path[ind], 10);
          _goToElement0(json[arrayInd], path, ind + 1, cb);
        } else {
          throw new Error('Unexpected JSON type: ' + JSON.stringify(json, null, ' '));
        }
      }
    };

    const slugifyId = function (id) {
      if (id == null) return;

      const trans = {
        '/': '-slash-',
        '\\?': '-questionmark-',
        '\\&': '-ampersand-',
        '=': '-equal-',
        '#': '-hash-'
      };

      for (const key in trans) {
        if (trans.hasOwnProperty(key)) {
          const regex = new RegExp(key, 'g');
          id = id.replace(regex, trans[key]);
        }
      }
      id = id.replace(/[\s]+/g, '-');
      id = id.replace(/[\-]+/g, '-');
      return id;
    };

    //
    // Datasource type helpers
    //

    const DatasourceTypes = {
      sqlite: 'sqlite',
      rest: 'rest',
      postgresql: 'postgresql',
      mysql: 'mysql',
      sparql_http: 'sparql_http',
      sql_jdbc: 'sql_jdbc',
      sparql_jdbc: 'sparql_jdbc'
    };

    const isJDBC = function (type) {
      switch (type) {
        case DatasourceTypes.sql_jdbc:
        case DatasourceTypes.sparql_jdbc:
          return true;
        default:
          return false;
      }
    };

    const isSPARQL = function (type) {
      switch (type) {
        case DatasourceTypes.sparql_http:
        case DatasourceTypes.sparql_jdbc:
          return true;
        default:
          return false;
      }
    };

    const isSQL = function (type) {
      switch (type) {
        case DatasourceTypes.mysql:
        case DatasourceTypes.sqlite:
        case DatasourceTypes.postgresql:
        case DatasourceTypes.sql_jdbc:
          return true;
        default:
          return false;
      }
    };

    //
    // PUBLIC METHODS
    //

    return {
      /**
      * Goto goes to the element located at path, and calls the callback
      * cb once there with that element as argument.
      * The path is an array.
      */
      goToElement: function (json, path, cb) {
        _goToElement0.call(this, json, path, 0, cb);
      },


      getUuid4: function () {
        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
          const r = Math.random() * 16 | 0;
          const v = c === 'x' ? r : (r & 0x3 | 0x8);
          return v.toString(16);
        });
      },

      slugifyId: slugifyId,

      isSQL: isSQL,
      isJDBC: isJDBC,
      isSPARQL: isSPARQL,
      DatasourceTypes: DatasourceTypes,
      doesQueryDependOnEntity: doesQueryDependOnEntity,
      getValuesAtPath: getValuesAtPath
    };

  }());

  // Make it to work in node and browser and AMD style
  if (typeof module !== 'undefined' && typeof module.exports !== 'undefined') {
    module.exports = new KibiUtils();
  } else {
    if (typeof define === 'function' && define.amd) {
      define([], function () {
        return new KibiUtils();
      });
    } else {
      window.jsonUtils = new KibiUtils();
    }
  }

} ());
