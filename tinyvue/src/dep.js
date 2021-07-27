let uid = 0;

class Dep {
  static target

  constructor() {
    this.id = uid++;
    this.subs = [];
  }

  addSub(sub) {
    this.subs.push(sub);
  }

  depend() {
    if (Dep.target) {
      Dep.target.addDep(this);
    }
  }

  notify() {
    // 先浅复制
    const subs = this.subs.slice();
    for (let i = 0, len = subs.length; i < len; i++) {
      subs[i].update();
    }
  }
}

Dep.target = null;
const targetStack = [];

function pushTarget(target) {
  targetStack.push(target);
  Dep.target = target;
}

function popTarget() {
  targetStack.pop();
  Dep.target = targetStack[targetStack.length - 1];
}

export {
  Dep,
  pushTarget,
  popTarget
}
