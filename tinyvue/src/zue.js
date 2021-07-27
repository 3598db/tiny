import { observe } from './observer.js';
import { complie } from './compiler.js';
import { initState } from './state.js';
import { proxy } from './proxy.js';

class Zue {
  constructor(options) {
    const vm = this;
    this.$options = options;
    this.$el = options.el;
    this.$data = options.data;

    initState(vm);
    proxy(vm, options.data);
    proxy(vm, options.methods);
    observe(this.$data);

    if (!this.$data.__observer) return;

    complie(options.el, this);
  }
}

export {
  Zue
};
