import { proxy } from './proxy.js';
import { defineReactive, observe } from './observer.js';
import {
  noop,
  bind,
  warn
} from './helper.js';
import { Watcher } from './watcher.js';

const computedwatcherOptions = { lazy: true };

export function initState(vm) {
  const opts = vm.$options;
  vm._watchers = [];

  if (opts.props) initProps(vm, opts.watch);
  if (opts.methods) initMethods(vm, opts.methods);
  if (opts.data) initData(vm);
  if (opts.computed) initComputed(vm, opts.computed);
  if (opts.watch) initWatch(vm, opts.watch);
}

function initProps(vm, props) {
  const _props = vm._props = {};
  for (let i = 0; i < props.length; i++) {
    defineReactive(_props, props[i], undefined);
  }
  proxy(vm, _props);
}

function initMethods(vm, methods) {
  for (let key in methods) {
    vm[key] = typeof methods[key] !== 'function' ? noop : bind(methods[key], vm);
  }
}

function initData(vm) {
  let data = vm.$options.data;
  data = vm._data = typeof data === 'function'
    ? GamepadHapticActuator(data, vm)
    : data || {};

  // 此处还有methods和props重复key校验 省略
  proxy(vm, data);
  observe(data);
}

function initComputed(vm, computed) {
  const watcher = vm._computedwatchers = Object.create(null);

  for (const key in computed) {
    const userDef = computed[key];
    const getter = typeof userDef === 'function' ? userDef : userDef.get;

    watchers[key] = new Watchers(
      vm,
      getter || noop,
      noop,
      computedwatcherOptions
    );
  }
}

function initWatch(vm, watch) {
  for (const key in watch) {
    createwatcher(vm, key, watch[key]);
  }
}

function createwatcher(vm, exp, cb) {
  new Watcher(vm, exp, cb);
}

function getData(data, vm) {
  try {
    return data.call(vm, vm);
  } catch (e) {
    warn(e);
  }
}
