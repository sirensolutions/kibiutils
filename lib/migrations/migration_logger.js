"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

require("core-js/stable");

require("regenerator-runtime/runtime");

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

/**
 * A logger for migrations.
 */
var MigrationLogger = /*#__PURE__*/function () {
  /**
   * Creates a new MigrationLogger.
   *
   * @param {KbnServer.server} server - A server instance.
   * @param {String} name - The logger name.
   */
  function MigrationLogger(server, name) {
    _classCallCheck(this, MigrationLogger);

    this._name = name;
    this._server = server;
  }

  _createClass(MigrationLogger, [{
    key: "error",
    value: function error(message) {
      this._server.log(['error', this._name], message);
    }
  }, {
    key: "warning",
    value: function warning(message) {
      this._server.log(['warning', this._name], message);
    }
  }, {
    key: "debug",
    value: function debug(message) {
      this._server.log(['info', this._name], message);
    }
  }, {
    key: "info",
    value: function info(message) {
      this._server.log(['info', this._name], message);
    }
  }]);

  return MigrationLogger;
}();

exports.default = MigrationLogger;
module.exports = exports.default;