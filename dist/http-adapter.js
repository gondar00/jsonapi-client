"use strict";

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; var ownKeys = Object.keys(source); if (typeof Object.getOwnPropertySymbols === 'function') { ownKeys = ownKeys.concat(Object.getOwnPropertySymbols(source).filter(function (sym) { return Object.getOwnPropertyDescriptor(source, sym).enumerable; })); } ownKeys.forEach(function (key) { _defineProperty(target, key, source[key]); }); } return target; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

var HttpAdapter =
/*#__PURE__*/
function () {
  function HttpAdapter() {
    var args = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

    _classCallCheck(this, HttpAdapter);

    this.host = args.host || args.baseURL || '';
    this.namespace = args.namespace || '';
    this.headers = _objectSpread({
      Accept: 'application/json',
      'Content-Type': 'application/json',
      HTTP_X_REQUESTED_WITH: 'XMLHttpRequest'
    }, args.headers);
    this.fetch = args.fetch || window.fetch;
  }

  _createClass(HttpAdapter, [{
    key: "extractResponseHeaders",
    value: function extractResponseHeaders(response) {
      var object = {};
      response.headers.forEach(function (value, key) {
        object[key] = value;
      });
      return object;
    }
  }, {
    key: "extractResponseBody",
    value: function extractResponseBody(response) {
      return response.text().then(function (text) {
        try {
          return JSON.parse(text);
        } catch (err) {
          return undefined;
        }
      });
    }
  }, {
    key: "request",
    value: function request(method, url, data) {
      var _this = this;

      return this.fetch(this.host + this.namespace + url, {
        method: method,
        headers: this.headers,
        body: data && JSON.stringify(data)
      }).then(function (response) {
        var payload = {
          status: response.status,
          statusText: response.statusText,
          headers: _this.extractResponseHeaders(response)
        };
        return _this.extractResponseBody(response).then(function (json) {
          if (json) {
            payload.data = json;
          }

          if (response.ok) {
            return payload;
          }

          throw payload;
        });
      });
    }
  }]);

  return HttpAdapter;
}();

['get', 'delete', 'post', 'put', 'patch'].forEach(function (method) {
  HttpAdapter.prototype[method] = function fn() {
    var args = Array.prototype.slice.call(arguments);
    args.unshift(method.toUpperCase());
    return this.request.apply(this, args);
  };
});
module.exports = HttpAdapter;