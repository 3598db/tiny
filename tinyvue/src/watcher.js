import { parseExpression } from './compiler.js';
import { pushTarget } from './dep.js';
import { queueWatcher } from './scheduler.js';
import { warn } from './helper.js';

let uid = 0;

class Watcher {
  constructor(vm, exp, cb, options) {
    this.vm = vm;
    vm._watchers.push(this);

    this.exp = exp;
    this.cb = cb;
    this.options = options;
    this.value = null;
    this.getter = parseExpression(exp).get;
    this.id = uid++;

    // 是否是同步的watcher
    // 即data变更是否同步到视图不等下一轮事件循环
    this.sync = false;
    this.deps = [];
    this.depIds = new Set();

    this.update();
  }

  addDep(dep) {
    const id = dep.id;

    if (!this.depIds.has(id)) {
      dep.addSub(this);
    }
  }

  get() {
    pushTarget(this);
    let value;
    const vm = this.vm;

    try {
      value = this.getter.call(vm, vm);
    } catch(e) {
      warn(e);
    }
  }

  update() {
    if (this.sync) {
      this.run();
    } else {
      queueWatcher(this);
    }
  }

  run() {
    const value = this.get();
    if (value !== this.value) {
      const oldValue = this.value;
      this.value = value;
      this.cb.call(this.vm, value, oldValue);
    }
  }
}

export { Watcher };
