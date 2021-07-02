'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var BULK_REQUEST_TYPES = ['index', 'delete', 'create', 'update'];

/**
 *
 * @param {{
 *   ['index'|'delete'|'create'|'update']: {
 *     error?: Object,
 *     _id?: string
 *   }
 * }} bulkResponseItem
 * @returns {{
 *   error?: Object,
 *   _id?: string
 * }} documentOperationResponse
 */
function getDocumentOperationResponse(bulkResponseItem) {
  var _iteratorNormalCompletion = true;
  var _didIteratorError = false;
  var _iteratorError = undefined;

  try {
    for (var _iterator = BULK_REQUEST_TYPES[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
      var actionType = _step.value;

      var documentOpResponse = bulkResponseItem[actionType];
      if (documentOpResponse) {
        documentOpResponse._actionType = actionType;
        return documentOpResponse;
      }
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

function getErrorIdentifier(error) {
  var errorType = '';
  for (var i = 0; i < 3; i++) {
    //Limiting the nesting to 3 for performance
    errorType += error.type;
    if (error.caused_by) {
      error = error.caused_by;
    } else {
      break;
    }
  }
  return errorType;
}

var PatchedEsClient = function () {
  _createClass(PatchedEsClient, null, [{
    key: 'checkBulkResponse',

    /**
     * Parses the {@link bulkResponse} for errors, logs (unique errors) and throws if found.
     * @param {Object} bulkResponse
     * @param {Logger} logger
     */
    value: function checkBulkResponse(bulkResponse, logger) {
      if (bulkResponse.errors) {
        var errorsDuringIndexing = bulkResponse.items.map(function (item) {
          return getDocumentOperationResponse(item);
        }).filter(function (docResp) {
          return docResp.error;
        });
        errorsDuringIndexing.reduce(function (uniqueErrors, docResp) {
          var errorIdentifier = getErrorIdentifier(docResp.error);
          var existingError = uniqueErrors.find(function (ele) {
            return ele.error._identifier === errorIdentifier;
          });
          if (!existingError) {
            docResp.error._identifier = errorIdentifier;
            docResp.error.errorCount = 1;
            docResp.docIds = [docResp._id];
            uniqueErrors.push(docResp);
          } else {
            existingError.error.errorCount++;
            if (docResp._id && existingError.docIds.length < 5) {
              existingError.docIds.push(docResp._id);
            }
          }
          return uniqueErrors;
        }, []);

        var totalErrors = 0;
        errorsDuringIndexing.forEach(function (docResp) {
          var error = docResp.error;
          var causedBy = error.caused_by || error;
          // Should we also log (upto first 5) docIds?
          logger.error('(' + error.errorCount + ') ' + error.type + ': ' + causedBy.reason);
          totalErrors += error.errorCount;
        });
        throw new Error(totalErrors + ' error(s) occurred in bulk request');
      } else if (bulkResponse.error !== undefined) {
        logger.error(bulkResponse.error);
        throw new Error(bulkResponse.error);
      }
    }
  }]);

  function PatchedEsClient(esClient, logger) {
    var _this = this;

    _classCallCheck(this, PatchedEsClient);

    this._client = esClient;
    this.logger = logger;

    // Wrapping bulk method to auto-parse (and throw) any errors
    this.originalBulk = this._client.bulk.bind(this._client);
    this._client.bulk = function () {
      var _ref = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee() {
        var resp,
            _args = arguments;
        return regeneratorRuntime.wrap(function _callee$(_context) {
          while (1) {
            switch (_context.prev = _context.next) {
              case 0:
                _context.next = 2;
                return _this.originalBulk.apply(_this, _args);

              case 2:
                resp = _context.sent;

                PatchedEsClient.checkBulkResponse(resp, _this._logger);
                return _context.abrupt('return', resp);

              case 5:
              case 'end':
                return _context.stop();
            }
          }
        }, _callee, _this);
      }));

      return function () {
        return _ref.apply(this, arguments);
      };
    }();
  }

  _createClass(PatchedEsClient, [{
    key: 'getEsClient',
    value: function getEsClient() {
      return this._client;
    }
  }, {
    key: 'cleanup',
    value: function cleanup() {
      this._client.bulk = this.originalBulk;
    }
  }]);

  return PatchedEsClient;
}();

exports.default = PatchedEsClient;