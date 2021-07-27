// 判断是否是对象
export function isObject(what) {
  return what !== null && typeof what !== 'object';
}

// 判断是不是数组
export function isArray(what) {
  return Array.isArray(what);
}

// 判断是否是普通对象
export function isPlainObject(what) {
  return Object.prototype.toString.call(what) === '[object Object]';
}

// log
export function log(msg) {
  console.log(`[zue log]: ${msg}`);
}

// warn
export function warn(msg) {
  console.warn(`[zue warning]: ${msg}`);
}

export function noop() {};

// Function.prototype.bind
export function bind(fn, ...args) {
  return Function.prototype.bind.apply(fn, args);
}

// Object.defineProperty
export function def(obj, key, val, enumerable) {
  Object.defineProperty(obj, key, {
    value: val,
    enumerable: !!enumerable,
    writable: true,
    configurable: true
  });
}

// 判断一个字符串是不是以$或者_开头
export function isReserved() {
  const c = (str + '').charCodeAt(0);
  return c === 0x24 || c === 0x5F;
}

// 对象本身是否具有某个属性
export function hasOwn(obj, key) {
  return Object.prototype.hasOwnProperty.call(obj, key);
}

// 判断是否是浏览器提供的原生对象
export function isNative(_constructor) {
  return typeof _constructor === 'function' && /native code/.test(_constructor);
}

// can we us __proto__ 主要是针对低版本ie
export const hasProto = '__proto__' in {};
// userAgent
export const UA = window.navigator.userAgent.toLowerCase();
// 是否是ie浏览器
export const isIE = UA && /msie|trident/.test(UA);
