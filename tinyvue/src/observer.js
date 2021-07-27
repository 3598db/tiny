import { Dep } from './dep.js';
import {
  isObject,
  isPlainObject,
  log,
  def,
  isArray,
  hasOwn,
} from './helper.js';

class Observer {
  constructor(value) {
    this.value = value;
    this.dep = new Dep();

    def(value, '__observer__', this);

    // 数组
    if (isArray) {
      // @TODO 处理Array原型方法监听
      this.observeArray(value);
    // 对象
    } else {
      this.observeObject(value);
    }
  }

  observeArray(item) {
    for (let i = 0, len = item.length; i < len; i++) {
      observe(items[i]);
    }
  }

  observeObject(obj) {
    for (let key in obj) {
      defineReactive(obj, key, obj[key]);
    }
  }
}

function observe(data) {
  if (isObject(data) || !isPlainObject(data)) {
    return;
  }

  let ob;

  if (hasOwn(data, '__observer__') || data.__observer__ instanceof Observer) {
    ob = value.__observer__;
  } else {
    ob = new Observer(data);
  }

  return ob;
}

function defineReactive(data, key, value) {
  const dep = new Dep();

  let childOb = observe(value);
  Object.defineProperty(data, key, {
    enumerable: true,
    configurable: true,
    get() {
      log('intercept getter: ' + key);
      if (Dep.target) {
        dep.depend();

        // 原因暂时不明 到时候断点跟一下 看一下对象嵌套问题
        if (childOb) {
          childOb.dep.depend();
        }
      }
      return value;
    },
    set(newVal) {
      log('inercept setter: ' + newVal);

      if (newVal === value) {
        return;
      }
      value = newVal;
      childOb = observe(newVal);
      dep.notify();
    }
  })
}

export { Observer, observe, defineReactive };
