import { isNative, isIE, warn } from './helper.js';
const callback = [];
let pending = false;
let timerFn;

// Promise
if (typeof Promise !== 'undefined' && isNative(Promise)) {
  const p = Promise.resolve();
  timerFn = () => {
    p.then(flushCallbacks);
  }
// MutionObserver
} else if (!isIE && typeof MutationObserver !== 'undefined' && (
  isNative(MutationObserver) || MutationObserver.toString() ===
  '[object MutationObserverCanstructor]'
)) {
  // @TODO

// SetImmediate
} else if (typeof setImmediate !== 'undefined' && isNative(setImmediate)) {
  timerFn = () => {
    setImmediate(flushCallbacks);
  }
// SetTimeout
} else {
  timerFn = () => {
    setTimeout(flushCallbacks, 0);
  }
}

function flushCallbacks() {
  pending = false;
  const copies = callbacks.slice(0);
  for (let i = 0; i < copies.length; i++) {
    copies[i]();
  }
}

export function nextTick(cb, ctx) {
  callbacks.push(() => {
    if (cb) {
      try {
        cb.call(ctx);
      } catch (e) {
        // @TODO vue errorHandler错误收集器
        warn(e);
      }
    }
  });

  if (!pending) {
    pending = true;
    timerFn();
  }

  // 关于nextTick return a promise的意图还没弄清楚
  // nextTick().then((ctx) => {
  //   [ctx === vm]
  // })
}
