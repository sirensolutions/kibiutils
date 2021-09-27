"use strict";

require("core-js/modules/es.array.slice.js");

require("core-js/modules/es.object.to-string.js");

require("core-js/modules/es.array.from.js");

require("core-js/modules/es.string.iterator.js");

require("core-js/modules/es.symbol.js");

require("core-js/modules/es.symbol.description.js");

require("core-js/modules/es.symbol.iterator.js");

require("core-js/modules/es.array.iterator.js");

require("core-js/modules/web.dom-collections.iterator.js");

require("core-js/modules/es.promise.js");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

require("core-js/modules/es.array.filter.js");

require("core-js/modules/es.array.map.js");

require("core-js/modules/es.array.reduce.js");

require("core-js/modules/es.array.find.js");

require("core-js/modules/es.array.for-each.js");

require("core-js/modules/web.dom-collections.for-each.js");

require("core-js/modules/es.array.concat.js");

require("regenerator-runtime/runtime.js");

function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(_next, _throw); } }

function _asyncToGenerator(fn) { return function () { var self = this, args = arguments; return new Promise(function (resolve, reject) { var gen = fn.apply(self, args); function _next(value) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "next", value); } function _throw(err) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "throw", err); } _next(undefined); }); }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

function _createForOfIteratorHelper(o, allowArrayLike) { var it = typeof Symbol !== "undefined" && o[Symbol.iterator] || o["@@iterator"]; if (!it) { if (Array.isArray(o) || (it = _unsupportedIterableToArray(o)) || allowArrayLike && o && typeof o.length === "number") { if (it) o = it; var i = 0; var F = function F() {}; return { s: F, n: function n() { if (i >= o.length) return { done: true }; return { done: false, value: o[i++] }; }, e: function e(_e) { throw _e; }, f: F }; } throw new TypeError("Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); } var normalCompletion = true, didErr = false, err; return { s: function s() { it = it.call(o); }, n: function n() { var step = it.next(); normalCompletion = step.done; return step; }, e: function e(_e2) { didErr = true; err = _e2; }, f: function f() { try { if (!normalCompletion && it.return != null) it.return(); } finally { if (didErr) throw err; } } }; }

function _unsupportedIterableToArray(o, minLen) { if (!o) return; if (typeof o === "string") return _arrayLikeToArray(o, minLen); var n = Object.prototype.toString.call(o).slice(8, -1); if (n === "Object" && o.constructor) n = o.constructor.name; if (n === "Map" || n === "Set") return Array.from(o); if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen); }

function _arrayLikeToArray(arr, len) { if (len == null || len > arr.length) len = arr.length; for (var i = 0, arr2 = new Array(len); i < len; i++) { arr2[i] = arr[i]; } return arr2; }

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
  var _iterator = _createForOfIteratorHelper(BULK_REQUEST_TYPES),
      _step;

  try {
    for (_iterator.s(); !(_step = _iterator.n()).done;) {
      var actionType = _step.value;
      var documentOpResponse = bulkResponseItem[actionType];

      if (documentOpResponse) {
        documentOpResponse._actionType = actionType;
        return documentOpResponse;
      }
    }
  } catch (err) {
    _iterator.e(err);
  } finally {
    _iterator.f();
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

var PatchedEsClient = /*#__PURE__*/function () {
  function PatchedEsClient(esClient, logger) {
    var _this = this;

    _classCallCheck(this, PatchedEsClient);

    this._client = esClient;
    this.logger = logger; // Wrapping bulk method to auto-parse (and throw) any errors

    this.originalBulk = this._client.bulk.bind(this._client);
    this._client.bulk = /*#__PURE__*/_asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee() {
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
              return _context.abrupt("return", resp);

            case 5:
            case "end":
              return _context.stop();
          }
        }
      }, _callee);
    }));
  }

  _createClass(PatchedEsClient, [{
    key: "getEsClient",
    value: function getEsClient() {
      return this._client;
    }
  }, {
    key: "cleanup",
    value: function cleanup() {
      this._client.bulk = this.originalBulk;
    }
  }], [{
    key: "checkBulkResponse",
    value:
    /**
     * Parses the {@link bulkResponse} for errors, logs (unique errors) and throws if found.
     * @param {Object} bulkResponse
     * @param {Logger} logger
     */
    function checkBulkResponse(bulkResponse, logger) {
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
          var causedBy = error.caused_by || error; // Should we also log (upto first 5) docIds?

          logger.error("(".concat(error.errorCount, ") ").concat(error.type, ": ").concat(causedBy.reason));
          totalErrors += error.errorCount;
        });
        throw new Error("".concat(totalErrors, " error(s) occurred in bulk request"));
      } else if (bulkResponse.error !== undefined) {
        logger.error(bulkResponse.error);
        throw new Error(bulkResponse.error);
      }
    }
  }]);

  return PatchedEsClient;
}();

exports.default = PatchedEsClient;
module.exports = exports.default;