"use strict";

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

var JSONAPIError =
/*#__PURE__*/
function () {
  function JSONAPIError() {
    var args = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

    _classCallCheck(this, JSONAPIError);

    var errors = Array.isArray(args.errors) ? args.errors : [];
    this.errors = errors.map(this.processError);
  }

  _createClass(JSONAPIError, [{
    key: "processError",
    value: function processError(error) {
      var object = {};

      if (error.id) {
        object.id = error.id;
      }

      if (error.status) {
        object.status = error.status;
      }

      if (error.code) {
        object.code = error.code;
      }

      if (error.title) {
        object.title = error.title;
      }

      if (error.detail) {
        object.detail = error.detail;
      }

      if (error.meta) {
        object.meta = error.meta;
      }

      if (error.links) {
        object.links = {};

        if (error.links.about) {
          object.links.about = error.links.about;
        }
      }

      if (error.source) {
        object.source = {};

        if (error.source.pointer) {
          object.source.pointer = error.source.pointer;
        }

        if (error.source.parameter) {
          object.source.parameter = error.source.parameter;
        }
      }

      return object;
    }
  }, {
    key: "clear",
    value: function clear() {
      this.errors = [];
    }
  }, {
    key: "count",
    value: function count() {
      return this.errors.length;
    }
  }, {
    key: "parsePointer",
    value: function parsePointer(pointer) {
      if (pointer === '/data') {
        return 'base';
      }

      if (pointer.indexOf('/data/attributes/') === 0) {
        return pointer.substring('/data/attributes/'.length, pointer.length);
      }

      return undefined;
    }
  }, {
    key: "extract",
    value: function extract() {
      var _this = this;

      return this.errors.reduce(function (object, error) {
        if (error.source) {
          var key;

          if (error.source.parameter) {
            key = error.source.parameter;
          }

          if (!key && error.source.pointer) {
            key = _this.parsePointer(error.source.pointer);
          }

          if (key) {
            object[key] = object[key] || [];
            object[key].push(error);
          }
        }

        return object;
      }, {});
    }
  }, {
    key: "add",
    value: function add(error) {
      this.errors.push(this.processError(error));
    }
  }]);

  return JSONAPIError;
}();

module.exports = JSONAPIError;