(function () {

  function KibiUtils() {}

  KibiUtils.prototype = (function () {

    //
    // PRIVATE methods
    //

    var _checkSingleQuery = function (query) {

      var entityRegex = /@doc\[.+?\]@/;
      var multilineCommentRegex = /\/\*(.|[\r\n])*?\*\//g;
      var singleLineRegex = /(-- |# |\/\/).*/g;

      // check for sparql and sql queries
      var activationQueryCheck = query.activationQuery &&
        entityRegex.test(query.activationQuery.replace(multilineCommentRegex, '').replace(singleLineRegex, ''));
      var resultQueryCheck = query.resultQuery &&
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

        var i;
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

    var doesQueryDependOnEntity = function (queries) {
      for (var i = 0; i < queries.length; i++) {
        if (_checkSingleQuery(queries[i])) {
          return true;
        }
      }
      return false;
    };

    var _goToElement0 = function (json, path, ind, cb) {
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
          var arrayInd = parseInt(path[ind], 10);
          _goToElement0(json[arrayInd], path, ind + 1, cb);
        } else {
          throw new Error('Unexpected JSON type: ' + JSON.stringify(json, null, ' '));
        }
      }
    };

    var slugifyId = function (id) {
      if (id == null) return;

      var trans = {
        '/' : '-slash-',
        '\\?' : '-questionmark-',
        '\\&' : '-ampersand-',
        '=' : '-equal-',
        '#' : '-hash-'
      };

      for (var key in trans) {
        if (trans.hasOwnProperty(key)) {
          var regex = new RegExp(key, 'g');
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

    var DatasourceTypes = {
      sqlite: 'sqlite',
      rest: 'rest',
      postgresql: 'postgresql',
      mysql: 'mysql',
      sparql_http: 'sparql_http',
      sql_jdbc: 'sql_jdbc',
      sparql_jdbc: 'sparql_jdbc',
      tinkerpop3: 'tinkerpop3'
    };

    var isJDBC = function (type) {
      switch (type) {
        case DatasourceTypes.sql_jdbc:
        case DatasourceTypes.sparql_jdbc:
          return true;
        default:
          return false;
      }
    };

    var isSPARQL = function (type) {
      switch (type) {
        case DatasourceTypes.sparql_http:
        case DatasourceTypes.sparql_jdbc:
          return true;
        default:
          return false;
      }
    };

    var isSQL = function (type) {
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
          var r = Math.random() * 16 | 0;
          var v = c === 'x' ? r : (r & 0x3 | 0x8);
          return v.toString(16);
        });
      },

      slugifyId: slugifyId,

      isSQL: isSQL,
      isJDBC: isJDBC,
      isSPARQL: isSPARQL,
      DatasourceTypes: DatasourceTypes,
      doesQueryDependOnEntity: doesQueryDependOnEntity
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
