import { nextTick } from './next-tick.js';
const queue = [];
let has = {};
let waiting = false;
let flushing = false;

export function queueWatcher(watcher) {
  const id = watcher.id;

  if (has[id] == null) {
    has[id] = true;

    if (!flushing) {
      queue.push(watcher);
    }

    // @TODO flushing === true

    if (!waiting) {
      waiting = true;

      nextTick(flushSchedulerQueue);
    }
  }
}

function flushSchedulerQueue() {
  // 排序
  queue.sort((a, b) => a.id - b.id);

  for (let i = 0, len = queue.length; i< len; i++) {
    let watcher = queue[i];

    id = watcher.id;
    has[id] = null;
    watcher.run();
  }

  // @TODO updated activated 等生命周期调用

  resetSchedulerState();
}

function resetSchedulerState() {
  queue.length = 0;
  has = {};
  waiting = flushing = false;
}
