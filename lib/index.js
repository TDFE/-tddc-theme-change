"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.setTheme = void 0;
var _tntdThemeLess = _interopRequireDefault(require("tntd-theme-less"));
var _colors = require("@ant-design/colors");
var _cssVarsPonyfill = _interopRequireDefault(require("css-vars-ponyfill"));
function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }
function _typeof(o) { "@babel/helpers - typeof"; return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (o) { return typeof o; } : function (o) { return o && "function" == typeof Symbol && o.constructor === Symbol && o !== Symbol.prototype ? "symbol" : typeof o; }, _typeof(o); }
function ownKeys(e, r) { var t = Object.keys(e); if (Object.getOwnPropertySymbols) { var o = Object.getOwnPropertySymbols(e); r && (o = o.filter(function (r) { return Object.getOwnPropertyDescriptor(e, r).enumerable; })), t.push.apply(t, o); } return t; }
function _objectSpread(e) { for (var r = 1; r < arguments.length; r++) { var t = null != arguments[r] ? arguments[r] : {}; r % 2 ? ownKeys(Object(t), !0).forEach(function (r) { _defineProperty(e, r, t[r]); }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(t)) : ownKeys(Object(t)).forEach(function (r) { Object.defineProperty(e, r, Object.getOwnPropertyDescriptor(t, r)); }); } return e; }
function _defineProperty(obj, key, value) { key = _toPropertyKey(key); if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }
function _toPropertyKey(t) { var i = _toPrimitive(t, "string"); return "symbol" == _typeof(i) ? i : String(i); }
function _toPrimitive(t, r) { if ("object" != _typeof(t) || !t) return t; var e = t[Symbol.toPrimitive]; if (void 0 !== e) { var i = e.call(t, r || "default"); if ("object" != _typeof(i)) return i; throw new TypeError("@@toPrimitive must return a primitive value."); } return ("string" === r ? String : Number)(t); }
var cssVarsPrefix = ['blue', 'purple', 'cyan', 'green', 'magenta', 'pink', 'red', 'orange', 'yellow', 'volcano', 'geekblue', 'lime', 'gold'];

// 需要动态计算的key
var computeKeys = ['fade', 'tint', 'shade', 'darken'];

/**
 * 获取root的css变量
 * @returns
 */
var getDefaultTheme = function getDefaultTheme() {
  // 获取文档中所有的样式表
  var styleSheets = document.styleSheets;
  var themes = {};
  // 遍历每个样式表
  for (var i = 0; i < styleSheets.length; i++) {
    var styleSheet = styleSheets[i];
    // 遍历每个规则
    if (styleSheet.cssRules) {
      for (var j = 0; j < styleSheet.cssRules.length; j++) {
        var rule = styleSheet.cssRules[j];
        if (rule.selectorText === ':root') {
          // 获取:root伪类中的所有声明
          var declarations = rule.style;

          // 遍历每个声明
          for (var k = 0; k < declarations.length; k++) {
            var property = declarations[k];

            // 检查声明是否是变量
            if (property.startsWith('--') && !property.includes('jjext')) {
              themes[property] = declarations.getPropertyValue(property);
            }
          }
        }
      }
    }
  }
  return themes;
};

/**
 * 获取十个颜色
 * @param {*} theme
 * @returns
 */
var getColorPaletteColors = function getColorPaletteColors(theme) {
  var themes = {};
  var _loop = function _loop(i) {
    // 这个是计算antd 10个主题色
    if (cssVarsPrefix.includes(i)) {
      var list = (0, _colors.generate)(theme[i]);
      list.forEach(function (el, index) {
        themes["--".concat(i, "-").concat(index + 1)] = el;
      });
    } else {
      themes["--".concat(i)] = theme[i];
    }
  };
  for (var i in theme) {
    _loop(i);
  }
  return themes;
};

/**
 * 获取所有css变量的值
 * @param {*} theme
 * @returns
 */
var getcssVariablesValues = function getcssVariablesValues(theme) {
  var themes = getColorPaletteColors(theme);
  var currentThemes = getDefaultTheme();
  // 所有的颜色都是基于这几个颜色变化而来
  var originKeys = Object.keys(themes);
  var allVarKeys = Object.keys(currentThemes);
  var result = {};
  allVarKeys.forEach(function (i) {
    var varName = computeKeys.find(function (el) {
      return i.includes(el);
    }); // fade / tint / shade / darken
    if (varName) {
      var originKey = originKeys.find(function (el) {
        return i.includes(el);
      }); // --blue-6
      var originColor = themes[originKey]; // --blue-6对应的颜色
      var unit = i.replace("".concat(originKey, "-").concat(varName, "-"), ''); // 10

      if (originKey && originColor && unit) {
        var color = new _tntdThemeLess["default"].Color(originColor === null || originColor === void 0 ? void 0 : originColor.replace('#', ''));
        if (varName === 'fade') {
          var _color$rgb;
          result[i] = color === null || color === void 0 || (_color$rgb = color.rgb) === null || _color$rgb === void 0 ? void 0 : _color$rgb.join(',');
        } else {
          var amount = new _tntdThemeLess["default"].Dimension(unit);
          var transFormColor = _tntdThemeLess["default"] === null || _tntdThemeLess["default"] === void 0 ? void 0 : _tntdThemeLess["default"][varName](color, amount);
          result[i] = transFormColor === null || transFormColor === void 0 ? void 0 : transFormColor.toRGB();
        }
      }
    }
  });
  return _objectSpread(_objectSpread(_objectSpread({}, currentThemes), themes), result);
};

/**
 * @param {*} theme 指定换肤的key
 */
var setTheme = exports.setTheme = function setTheme(theme) {
  var variables = getcssVariablesValues(theme);
  document.documentElement.setAttribute('data-theme', variables);
  (0, _cssVarsPonyfill["default"])({
    rootElement: document.documentElement,
    updateDOM: true,
    watch: true,
    // variables 自定义属性名/值对的集合
    variables: variables,
    // 当添加，删除或修改其<link>或<style>元素的禁用或href属性时，ponyfill将自行调用
    onlyLegacy: false // false 默认将css变量编译为浏览器识别的css样式 true 当浏览器不支持css变量的时候将css变量编译为识别的css
  });
};