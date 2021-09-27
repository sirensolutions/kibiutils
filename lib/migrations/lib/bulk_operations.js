"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.getBatchSize = getBatchSize;
exports.waitUntilArrayIsEmpty = waitUntilArrayIsEmpty;

require("regenerator-runtime/runtime.js");

require("core-js/modules/es.array.concat.js");

require("core-js/modules/es.object.to-string.js");

require("core-js/modules/es.promise.js");

function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(_next, _throw); } }

function _asyncToGenerator(fn) { return function () { var self = this, args = arguments; return new Promise(function (resolve, reject) { var gen = fn.apply(self, args); function _next(value) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "next", value); } function _throw(err) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "throw", err); } _next(undefined); }); }; }

function isMeta(meta) {
  return meta.delete || meta.index || meta.create || meta.update;
}

function getBatchSize(bulkBody, batchOperationNumber) {
  var batchSize = 0;
  var metaIndex = 0;
  var row;

  while (batchOperationNumber > 0) {
    row = bulkBody[metaIndex];

    if (!row) {
      // there is less data than batchOperationNumber
      break;
    }

    if (!isMeta(row)) {
      throw new Error("Incorrect bulk body expected meta row at index ".concat(metaIndex, " but got: ").concat(JSON.stringify(row)));
    }

    if (row.delete) {
      // ONLY delete operation does NOT have the body row
      batchSize += 1;
      metaIndex += 1;
    } else {
      // The next line should not be meta, should be a payload
      var nextRow = bulkBody[metaIndex + 1];

      if (nextRow === undefined) {
        throw new Error("Incorrect bulk body expected additional payload row at index ".concat(metaIndex + 1, " but got nothing"));
      }

      if (isMeta(nextRow)) {
        throw new Error("Incorrect bulk body expected payload row at index ".concat(metaIndex + 1, " but got: ").concat(JSON.stringify(nextRow)));
      }

      batchSize += 2;
      metaIndex += 2;
    }

    batchOperationNumber--;
  }

  return batchSize;
}

function waitUntilArrayIsEmpty(_x) {
  return _waitUntilArrayIsEmpty.apply(this, arguments);
}

function _waitUntilArrayIsEmpty() {
  _waitUntilArrayIsEmpty = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee(arr) {
    var stepTime,
        _args = arguments;
    return regeneratorRuntime.wrap(function _callee$(_context) {
      while (1) {
        switch (_context.prev = _context.next) {
          case 0:
            stepTime = _args.length > 1 && _args[1] !== undefined ? _args[1] : 50;

            if (!(arr.length === 0)) {
              _context.next = 3;
              break;
            }

            return _context.abrupt("return");

          case 3:
            return _context.abrupt("return", new Promise(function (resolve) {
              setTimeout(function () {
                resolve(waitUntilArrayIsEmpty(arr, stepTime));
              }, 50);
            }));

          case 4:
          case "end":
            return _context.stop();
        }
      }
    }, _callee);
  }));
  return _waitUntilArrayIsEmpty.apply(this, arguments);
}