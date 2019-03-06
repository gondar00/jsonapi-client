"use strict";

function _typeof(obj) { if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

function _toConsumableArray(arr) { return _arrayWithoutHoles(arr) || _iterableToArray(arr) || _nonIterableSpread(); }

function _nonIterableSpread() { throw new TypeError("Invalid attempt to spread non-iterable instance"); }

function _iterableToArray(iter) { if (Symbol.iterator in Object(iter) || Object.prototype.toString.call(iter) === "[object Arguments]") return Array.from(iter); }

function _arrayWithoutHoles(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = new Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

var Errors = require('./jsonapi-error');

var Serializer = require('jsonapi-serializer/lib/serializer');

var Deserializer = require('jsonapi-serializer/lib/deserializer');

var Base =
/*#__PURE__*/
function () {
  function Base() {
    var args = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

    _classCallCheck(this, Base);

    this.id = !!args.id ? String(args.id) : Math.random().toString(36).substring(2, 15);
    this.errors = new Errors();
    this.persisted = !!args.id;
    this.links = args.links || {};
    this.meta = args.meta || {};
  }

  _createClass(Base, [{
    key: "hasMany",
    value: function hasMany(Thing) {
      var array = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : [];
      var things = array.map(function (object) {
        return new Thing(object);
      });
      things[this.constructor.symbols.relationship] = Thing;
      return things;
    }
  }, {
    key: "belongsTo",
    value: function belongsTo(Thing, object) {
      var thing = new Thing(object);
      thing[this.constructor.symbols.relationship] = Thing;
      return thing;
    }
  }, {
    key: "hasOne",
    value: function hasOne(Thing, object) {
      var thing = new Thing(object);
      thing[this.constructor.symbols.relationship] = Thing;
      return thing;
    }
  }, {
    key: "isRelationship",
    value: function isRelationship(key) {
      return this.hasOwnProperty(key) && Object.getOwnPropertySymbols(this[key] || {}).indexOf(this.constructor.symbols.relationship) > -1;
    }
  }, {
    key: "isAttribute",
    value: function isAttribute(key) {
      return this.hasOwnProperty(key) && key !== 'id' && typeof key !== 'function' && Object.getOwnPropertySymbols(this[key] || {}).indexOf(this.constructor.symbols.relationship) === -1;
    }
  }, {
    key: "attributes",
    value: function attributes() {
      var object = {};

      for (var key in this) {
        if (this.isAttribute(key)) {
          object[key] = this[key];
        }
      }

      return object;
    }
  }, {
    key: "constructBaseURL",
    value: function constructBaseURL() {
      var urlParams = this.constructor.urlParams();

      if (!urlParams) {
        return this.constructor.baseURL;
      }

      throw new Error('Missing url params: ' + urlParams.join(', ') + '.\n' + 'Override the #constructBaseURL() method of ' + this.constructor.name + '.');
    }
  }, {
    key: "serializerOptions",
    value: function serializerOptions() {
      var _this = this;

      var object = {};
      var keysForAttributes = this.constructor.keysForAttributes();
      var keysForRelationships = this.constructor.keysForRelationships();
      object.attributes = _toConsumableArray(keysForAttributes).concat(_toConsumableArray(keysForRelationships));
      keysForRelationships.forEach(function (key) {
        var Relationship = _this[key][_this.constructor.symbols.relationship];
        object[key] = {
          ref: 'id',
          attributes: Relationship.keysForAttributes()
        };
      });
      return object;
    }
  }, {
    key: "serialize",
    value: function serialize() {
      if (!this.constructor._type) {
        throw new Error('Resource object missing jsonapi type.\nSet static property _type to the model class.');
      }

      return new Serializer(this.constructor._type, this.serializerOptions()).serialize(this);
    }
  }, {
    key: "validate",
    // Run model validations in this hook
    // Ex:
    // class Foo extends Base {
    //   validate() {
    //     if (isBlank(this.name)) {
    //       this.errors.add({
    //         code: 'blank',
    //         source: {
    //           pointer: '/data/attributes/name'
    //         }
    //       });
    //     }
    //   }
    // }
    value: function validate() {}
  }, {
    key: "fetch",
    value: function fetch(id) {
      var _this2 = this;

      var args = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
      return this.adapter.get("".concat(this.constructBaseURL(args), "/").concat(id)).then(function (_ref) {
        var data = _ref.data;
        return _this2.deserialize(data);
      });
    }
  }, {
    key: "_create",
    value: function _create() {
      var _this3 = this;

      return this.constructor.adapter.post(this.constructBaseURL(), this.serialize()).then(function (_ref2) {
        var data = _ref2.data;
        return _this3.constructor.deserialize(data);
      }).catch(function (err) {
        _this3.errors = new Errors(err.data);
        throw err;
      });
    }
  }, {
    key: "_update",
    value: function _update() {
      var _this4 = this;

      return this.constructor.adapter.patch("".concat(this.constructBaseURL(), "/").concat(this.id), this.serialize()).then(function (_ref3) {
        var data = _ref3.data;
        return _this4.constructor.deserialize(data);
      }).catch(function (err) {
        _this4.errors = new Errors(err.data);
        throw err;
      });
    }
  }, {
    key: "save",
    value: function save() {
      if (!this.valid) return Promise.reject(new Error('Unprocessable Entity'));
      return this.persisted ? this._update() : this._create();
    }
  }, {
    key: "destroy",
    value: function destroy() {
      return this.constructor.adapter.delete("".concat(this.constructBaseURL(), "/").concat(this.id)).catch(function (err) {
        throw err;
      });
    }
  }, {
    key: "request",
    value: function request(method, url, data) {
      return this.constructor.adapter.request(method, url, data);
    }
  }, {
    key: "errors",
    get: function get() {
      return this[this.constructor.symbols.errors];
    },
    set: function set(errors) {
      this[this.constructor.symbols.errors] = new Errors(errors);
    }
  }, {
    key: "persisted",
    get: function get() {
      return this[this.constructor.symbols.persisted];
    },
    set: function set(persisted) {
      this[this.constructor.symbols.persisted] = persisted;
    }
  }, {
    key: "links",
    get: function get() {
      return this[this.constructor.symbols.links];
    },
    set: function set(links) {
      this[this.constructor.symbols.links] = links;
    }
  }, {
    key: "meta",
    get: function get() {
      return this[this.constructor.symbols.meta];
    },
    set: function set(meta) {
      this[this.constructor.symbols.meta] = meta;
    }
  }, {
    key: "valid",
    get: function get() {
      this.errors.clear();
      this.validate();
      return this.errors.count() === 0;
    }
  }], [{
    key: "keysForAttributes",
    value: function keysForAttributes() {
      var model = this.new();
      var keys = [];

      for (var key in model) {
        if (this.prototype.isAttribute.call(model, key)) {
          keys.push(key);
        }
      }

      return keys;
    }
  }, {
    key: "keysForRelationships",
    value: function keysForRelationships() {
      var model = this.new();
      var keys = [];

      for (var key in model) {
        if (this.prototype.isRelationship.call(model, key)) {
          keys.push(key);
        }
      }

      return keys;
    }
  }, {
    key: "urlParams",
    value: function urlParams() {
      return this.baseURL.match(/:\w+/g);
    }
  }, {
    key: "toQueryString",
    value: function toQueryString() {
      var _this5 = this;

      var params = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
      var prefix = arguments.length > 1 ? arguments[1] : undefined;
      var query = Object.keys(params).map(function (k) {
        var key = k;
        var value = params[key];

        switch (params.constructor) {
          case Array:
            key = encodeURIComponent("".concat(prefix, "[]"));
            break;

          case Object:
            key = prefix ? "".concat(prefix, "[").concat(key, "]") : key;
            break;

          default:
            break;
        }

        if (_typeof(value) === 'object') {
          return _this5.toQueryString(value, key); // for nested objects
        }

        return "".concat(key, "=").concat(encodeURIComponent(value));
      });
      return _toConsumableArray(query).join('&');
    }
  }, {
    key: "constructBaseURL",
    value: function constructBaseURL() {
      var args = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
      var urlParams = this.urlParams();

      if (!urlParams) {
        return this.baseURL;
      }

      var url = this.baseURL;
      urlParams.forEach(function (item) {
        url = url.replace(item, args[item.substring(1)]);
      });
      return url;
    }
  }, {
    key: "deserialize",
    value: function deserialize(response, deserializerOptions) {
      var _this6 = this;

      return new Deserializer(deserializerOptions || this.deserializerOptions).deserialize(response).then(function (data) {
        if (Array.isArray(data)) {
          var collection = data.map(function (object) {
            return new _this6(object);
          });

          if (data.links) {
            collection.links = data.links;
          }

          if (data.meta) {
            collection.meta = data.meta;
          }

          return collection;
        }

        return new _this6(data);
      });
    }
  }, {
    key: "fetchAll",
    value: function fetchAll() {
      var _this7 = this;

      var args = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
      return this.adapter.get("".concat(this.constructBaseURL(args))).then(function (_ref4) {
        var data = _ref4.data;
        return _this7.deserialize(data);
      });
    }
  }, {
    key: "query",
    value: function query() {
      var _this8 = this;

      var _query = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

      var args = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
      var queryString = this.toQueryString(_query);
      var requestURL = this.constructBaseURL(args);
      return this.adapter.get("".concat(requestURL, "?").concat(queryString)).then(function (_ref5) {
        var data = _ref5.data;
        return _this8.deserialize(data);
      });
    }
  }, {
    key: "destroy",
    value: function destroy(id) {
      var args = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
      return this.adapter.delete("".concat(this.constructBaseURL(args), "/").concat(id)).catch(function (err) {
        throw err;
      });
    }
  }, {
    key: "new",
    value: function _new() {
      var args = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
      return new this(args);
    }
  }]);

  return Base;
}();

Object.defineProperty(Base, "baseURL", {
  configurable: true,
  enumerable: true,
  writable: true,
  value: ''
});
Object.defineProperty(Base, "symbols", {
  configurable: true,
  enumerable: true,
  writable: true,
  value: {
    errors: Symbol('errors'),
    persisted: Symbol('persisted'),
    links: Symbol('links'),
    relationship: Symbol('relationship'),
    meta: Symbol('meta')
  }
});
Object.defineProperty(Base, "deserializerOptions", {
  configurable: true,
  enumerable: true,
  writable: true,
  value: {
    keyForAttribute: 'camelCase'
  }
});
module.exports = Base;