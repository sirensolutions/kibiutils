"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

var waitUntilArrayIsEmpty = exports.waitUntilArrayIsEmpty = function () {
  var _ref = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee(arr) {
    var stepTime = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 50;
    return regeneratorRuntime.wrap(function _callee$(_context) {
      while (1) {
        switch (_context.prev = _context.next) {
          case 0:
            if (!(arr.length === 0)) {
              _context.next = 2;
              break;
            }

            return _context.abrupt("return");

          case 2:
            return _context.abrupt("return", new Promise(function (resolve) {
              setTimeout(function () {
                resolve(waitUntilArrayIsEmpty(arr, stepTime));
              }, 50);
            }));

          case 3:
          case "end":
            return _context.stop();
        }
      }
    }, _callee, this);
  }));

  return function waitUntilArrayIsEmpty(_x) {
    return _ref.apply(this, arguments);
  };
}();

exports.getBatchSize = getBatchSize;

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; }

function isMeta(meta) {
  return meta.delete || meta.index || meta.create || meta.update;
}

function getBatchSize(bulkBody, batchOperationNumber) {
  var batchSize = 0;
  var metaIndex = 0;
  var row = void 0;
  while (batchOperationNumber > 0) {
    row = bulkBody[metaIndex];
    if (!row) {
      // there is less data than batchOperationNumber
      break;
    }
    if (!isMeta(row)) {
      throw new Error("Incorrect bulk body expected meta row at index " + metaIndex + " but got: " + JSON.stringify(row));
    }
    if (row.delete) {
      // ONLY delete operation does NOT have the body row
      batchSize += 1;
      metaIndex += 1;
    } else {
      // The next line should not be meta, should be a payload
      var nextRow = bulkBody[metaIndex + 1];
      if (nextRow === undefined) {
        throw new Error("Incorrect bulk body expected additional payload row at index " + (metaIndex + 1) + " but got nothing");
      }
      if (isMeta(nextRow)) {
        throw new Error("Incorrect bulk body expected payload row at index " + (metaIndex + 1) + " but got: " + JSON.stringify(nextRow));
      }
      batchSize += 2;
      metaIndex += 2;
    }
    batchOperationNumber--;
  }
  return batchSize;
}