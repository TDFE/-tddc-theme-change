import lessFuns from 'tntd-theme-less';
import { generate } from '@ant-design/colors';
import cssVars from 'css-vars-ponyfill';

const cssVarsPrefix = [
  'blue',
  'purple',
  'cyan',
  'green',
  'magenta',
  'pink',
  'red',
  'orange',
  'yellow',
  'volcano',
  'geekblue',
  'lime',
  'gold'
];

// 需要动态计算的key
const computeKeys = ['fade', 'tint', 'shade', 'darken'];

/**
 * 获取root的css变量
 * @returns
 */
const getDefaultTheme = () => {
  // 获取文档中所有的样式表
  const styleSheets = document.styleSheets;
  const themes = {};
  // 遍历每个样式表
  for (let i = 0; i < styleSheets.length; i++) {
    const styleSheet = styleSheets[i];
    // 遍历每个规则
    if (styleSheet.cssRules) {
      for (let j = 0; j < styleSheet.cssRules.length; j++) {
        const rule = styleSheet.cssRules[j];

        if (rule.selectorText === ':root') {
          // 获取:root伪类中的所有声明
          const declarations = rule.style;

          // 遍历每个声明
          for (let k = 0; k < declarations.length; k++) {
            let property = declarations[k];

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
const getColorPaletteColors = (theme) => {
  let themes = {};
  for (let i in theme) {
    // 这个是计算antd 10个主题色
    if (cssVarsPrefix.includes(i)) {
      const list = generate(theme[i]);
      list.forEach((el, index) => {
        themes[`--${i}-${index + 1}`] = el;
      });
    } else {
      themes[`--${i}`] = theme[i];
    }
  }

  return themes;
};

/**
 * 获取所有css变量的值
 * @param {*} theme
 * @returns
 */
const getcssVariablesValues = (theme) => {
  const themes = getColorPaletteColors(theme);
  const currentThemes = getDefaultTheme();
  // 所有的颜色都是基于这几个颜色变化而来
  const originKeys = Object.keys(themes);
  const allVarKeys = Object.keys(currentThemes);
  const result = {};

  allVarKeys.forEach((i) => {
    const varName = computeKeys.find((el) => i.includes(el)); // fade / tint / shade / darken
    if (varName) {
      const originKey = originKeys.find((el) => i.includes(el)); // --blue-6
      const originColor = themes[originKey]; // --blue-6对应的颜色
      const unit = i.replace(`${originKey}-${varName}-`, ''); // 10

      if (originKey && originColor && unit) {
        const color = new lessFuns.Color(originColor?.replace('#', ''));
        if (varName === 'fade') {
          result[i] = color?.rgb?.join(',');
        } else {
          const amount = new lessFuns.Dimension(unit);
          const transFormColor = lessFuns?.[varName](color, amount);
          result[i] = transFormColor?.toRGB();
        }
      }
    }
  });
  return { ...currentThemes, ...themes, ...result };
};

/**
 * @param {*} theme 指定换肤的key
 */
export const setTheme = (theme) => {
  const variables = getcssVariablesValues(theme);
  document.documentElement.setAttribute('data-theme', variables);
  cssVars({
    rootElement: document.documentElement,
    updateDOM: true,
    watch: true,
    // variables 自定义属性名/值对的集合
    variables,
    // 当添加，删除或修改其<link>或<style>元素的禁用或href属性时，ponyfill将自行调用
    onlyLegacy: false // false 默认将css变量编译为浏览器识别的css样式 true 当浏览器不支持css变量的时候将css变量编译为识别的css
  });
};
