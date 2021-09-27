"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = indexSnapshot;

require("regenerator-runtime/runtime.js");

require("core-js/modules/es.object.to-string.js");

require("core-js/modules/es.promise.js");

require("core-js/modules/es.regexp.exec.js");

require("core-js/modules/es.string.search.js");

require("core-js/modules/es.array.reduce.js");

require("core-js/modules/es.array.iterator.js");

require("core-js/modules/es.map.js");

require("core-js/modules/es.string.iterator.js");

require("core-js/modules/esnext.map.delete-all.js");

require("core-js/modules/esnext.map.every.js");

require("core-js/modules/esnext.map.filter.js");

require("core-js/modules/esnext.map.find.js");

require("core-js/modules/esnext.map.find-key.js");

require("core-js/modules/esnext.map.includes.js");

require("core-js/modules/esnext.map.key-of.js");

require("core-js/modules/esnext.map.map-keys.js");

require("core-js/modules/esnext.map.map-values.js");

require("core-js/modules/esnext.map.merge.js");

require("core-js/modules/esnext.map.reduce.js");

require("core-js/modules/esnext.map.some.js");

require("core-js/modules/esnext.map.update.js");

require("core-js/modules/web.dom-collections.iterator.js");

function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(_next, _throw); } }

function _asyncToGenerator(fn) { return function () { var self = this, args = arguments; return new Promise(function (resolve, reject) { var gen = fn.apply(self, args); function _next(value) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "next", value); } function _throw(err) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "throw", err); } _next(undefined); }); }; }

/**
 * Takes a snapshot of an index during functional tests.
 *
 * @param {elasticsearch.client} An Elasticsearch client.
 * @param {String} index The index name.
 * @return {Map} having the id's as keys and the hits as values.
 */
function indexSnapshot(_x, _x2) {
  return _indexSnapshot.apply(this, arguments);
}

function _indexSnapshot() {
  _indexSnapshot = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee(client, index) {
    var response;
    return regeneratorRuntime.wrap(function _callee$(_context) {
      while (1) {
        switch (_context.prev = _context.next) {
          case 0:
            _context.next = 2;
            return client.search({
              index: index,
              size: 100
            });

          case 2:
            response = _context.sent;
            return _context.abrupt("return", response.hits.hits.reduce(function (acc, value) {
              return acc.set(value._id, value);
            }, new Map()));

          case 4:
          case "end":
            return _context.stop();
        }
      }
    }, _callee);
  }));
  return _indexSnapshot.apply(this, arguments);
}

module.exports = exports.default;