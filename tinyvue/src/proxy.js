// 为vm代理data属性或者方法
export function proxy(vm, data) {
  for (let key in data) {
    (function (key) {
      Object.defineProperty(vm, key, {
        get() {
          return data[key];
        },
        set(newVal) {
          data[key] = newVal;
        }
      })
    })(key);
  }
}
