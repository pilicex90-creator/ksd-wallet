// core/event-bus.js

/**
 * 简单事件总线实现
 * - on(event, handler): 订阅事件
 * - off(event, handler): 取消订阅
 * - once(event, handler): 订阅一次性事件
 * - emit(event, payload): 广播事件
 * - clearAll(): 清空所有事件监听器
 */

const listeners = new Map();

/**
 * 订阅事件
 */
export function on(event, handler) {
  if (!listeners.has(event)) {
    listeners.set(event, new Set());
  }
  listeners.get(event).add(handler);
}

/**
 * 取消订阅事件
 */
export function off(event, handler) {
  if (!listeners.has(event)) return;
  listeners.get(event).delete(handler);
}

/**
 * 一次性订阅事件
 */
export function once(event, handler) {
  const wrapper = (payload) => {
    handler(payload);
    off(event, wrapper);
  };
  on(event, wrapper);
}

/**
 * 广播事件
 */
export function emit(event, payload) {
  if (!listeners.has(event)) return;
  for (const handler of listeners.get(event)) {
    try {
      handler(payload);
    } catch (err) {
      console.error(`事件处理错误: ${event}`, err);
    }
  }
}

/**
 * 清空所有事件监听器
 */
export function clearAll() {
  listeners.clear();
}
