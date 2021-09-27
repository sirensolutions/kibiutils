"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.formatTotalHits = formatTotalHits;
exports.ES_API = void 0;

require("core-js/modules/es.object.freeze.js");

var ES_API = Object.freeze({
  v5_x: '5_x',
  v7_x: '7_x'
});
exports.ES_API = ES_API;

function formatTotalHits(value, format) {
  switch (format) {
    case ES_API.v5_x:
      return value;

    case ES_API.v7_x:
      return {
        value: value,
        relation: 'eq'
      };

    default:
      return value;
  }
}