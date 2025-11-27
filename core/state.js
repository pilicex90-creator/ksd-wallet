// core/state.js
import { emit } from "./event-bus.js";

const state = {
  network: null,
  account: null,
  snapshot: {
    native: "0",
    tokens: {}
  }
};

export function getCurrentNetwork() {
  return state.network;
}

export function setCurrentNetwork(network) {
  state.network = network;
  emit("networkChanged", network);
}

export function getCurrentAccount() {
  return state.account;
}

export function setCurrentAccount(account) {
  state.account = account;
  emit("accountChanged", account);
}

export function getSnapshot() {
  return state.snapshot;
}

export function updateNativeBalance(balance) {
  state.snapshot.native = balance;
  emit("balanceUpdated", { type: "native", value: balance });
}

export function updateTokenBalances(tokens) {
  state.snapshot.tokens = tokens;
  emit("balanceUpdated", { type: "tokens", value: tokens });
}

export function setSnapshot(snapshot) {
  state.snapshot = snapshot;
  emit("assetsIndexed", snapshot);
}

/**
 * 合并快照更新（避免覆盖已有数据）
 */
export function mergeSnapshot(partial) {
  state.snapshot = {
    native: partial.native ?? state.snapshot.native,
    tokens: { ...state.snapshot.tokens, ...partial.tokens }
  };
  emit("assetsIndexed", state.snapshot);
}

/**
 * 锁定钱包：清空账户和快照
 */
export function lockWallet() {
  state.account = null;
  state.snapshot = { native: "0", tokens: {} };
  emit("walletLocked");
}
