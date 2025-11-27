import { on } from "./event-bus.js";

export const LOG_LEVELS = {
  DEBUG: 0,
  INFO: 1,
  WARN: 2,
  ERROR: 3
};

const levelNames = ["debug", "info", "warn", "error"];

const defaultConfig = {
  logging: {
    minLevel: "DEBUG",
    maxEntries: 1000,
    saveToStorage: true,
    debugRPC: false
  }
};

let config = defaultConfig;

// 从 storage 读取用户配置覆盖默认值
chrome.storage.local.get(["logging"], (data) => {
  if (data.logging) {
    config.logging = { ...defaultConfig.logging, ...data.logging };
  }
});

const minLevel = LOG_LEVELS[config.logging.minLevel?.toUpperCase() || "DEBUG"];
const maxEntries = config.logging.maxEntries || 1000;

let logs = [];

/**
 * 写日志
 */
export function log(level, message, context = "") {
  if (level < minLevel) return;

  const timestamp = new Date().toISOString();
  const levelName = levelNames[level];
  const entry = `[${timestamp}] [${levelName.toUpperCase()}] ${context ? `[${context}] ` : ""}${message}`;

  // 控制台输出
  if (level === LOG_LEVELS.ERROR) console.error(entry);
  else if (level === LOG_LEVELS.WARN) console.warn(entry);
  else console.log(entry);

  // 存储到内存
  logs.push(entry);
  if (logs.length > maxEntries) logs.shift();

  // 存储到扩展 storage
  if (config.logging.saveToStorage) {
    chrome.storage.local.set({ logs });
  }
}

export function logRPC(request, response) {
  if (config.logging.debugRPC) {
    log(LOG_LEVELS.DEBUG, `RPC Request: ${JSON.stringify(request)} Response: ${JSON.stringify(response)}`, "RPC");
  }
}

export function registerEventLogging() {
  on("networkChanged", (network) => {
    log(LOG_LEVELS.INFO, `Network changed to: ${network.name} (chainId: ${network.chainId})`, "STATE");
  });

  on("accountChanged", (account) => {
    log(LOG_LEVELS.INFO, `Account changed to: ${account?.address || "未连接"}`, "STATE");
  });

  on("walletLocked", () => {
    log(LOG_LEVELS.WARN, "Wallet locked, all accounts cleared.", "SECURITY");
  });

  on("txCompleted", (tx) => {
    log(LOG_LEVELS.INFO, `Transaction completed: ${tx.amount} ${tx.from} → ${tx.to}`, "TX");
  });

  on("assetsIndexed", (snapshot) => {
    log(LOG_LEVELS.INFO, `Assets indexed: native=${snapshot.native}, tokens=${Object.keys(snapshot.tokens).length}`, "ASSET");
  });
}
