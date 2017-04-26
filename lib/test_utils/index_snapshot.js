"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; }

/**
 * Takes a snapshot of an index during functional tests.
 *
 * @param {elasticsearch.client} An Elasticsearch client.
 * @param {String} index The index name.
 * @return {Map} having the id's as keys and the hits as values.
 */
exports.default = function () {
  var _ref = _asyncToGenerator(regeneratorRuntime.mark(function _callee(client, index) {
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
    }, _callee, this);
  }));

  function indexSnapshot(_x, _x2) {
    return _ref.apply(this, arguments);
  }

  return indexSnapshot;
}();