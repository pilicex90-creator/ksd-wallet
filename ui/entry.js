// 引入样式（确保打包后生成 dist/css/entry.css）
import "../styles/base.css";
import "../styles/nav.css";
import "../styles/card.css";
import "../styles/wallet.css";
import "../styles/assets.css";
import "../styles/token.css";
import "../styles/tx.css";
import "../styles/settings.css";
import "../styles/logs.css";

// 引入挂载逻辑和日志
import { mountUI } from "./mount.js";
import { log, LOG_LEVELS } from "../core/logger.js";

const TAG_ENTRY = "ENTRY";
const TAG_GLOBAL = "GLOBAL";

let mounted = false;

/**
 * 安全序列化
 */
function safeStringify(value) {
  try {
    return typeof value === "object" ? JSON.stringify(value) : String(value);
  } catch {
    return String(value);
  }
}

/**
 * 初始化并挂载 UI
 */
function initUI() {
  if (mounted) {
    log(LOG_LEVELS.WARN, "UI already mounted, skipping duplicate init", TAG_ENTRY);
    return;
  }

  log(LOG_LEVELS.INFO, "Starting UI mount process...", TAG_ENTRY);

  try {
    mountUI();
    mounted = true;
    log(LOG_LEVELS.INFO, "Wallet UI mounted successfully", TAG_ENTRY);
  } catch (err) {
    console.error("Failed to mount UI:", err);
    log(
      LOG_LEVELS.ERROR,
      `Failed to mount UI: ${err.message}\n${err.stack}`,
      TAG_ENTRY
    );
  }
}

/**
 * 启动入口逻辑
 */
function bootstrap() {
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initUI, { once: true });
  } else {
    initUI();
  }
}

// 执行启动
bootstrap();

/**
 * 全局错误捕获
 */
window.addEventListener("error", (event) => {
  const { message, filename, lineno, colno, error } = event;
  log(
    LOG_LEVELS.ERROR,
    `Global error: ${message} at ${filename}:${lineno}:${colno}\n${error?.stack || ""}`,
    TAG_GLOBAL
  );
});

/**
 * 全局 Promise 拒绝捕获
 */
window.addEventListener("unhandledrejection", (event) => {
  const reason = safeStringify(event.reason);
  log(LOG_LEVELS.ERROR, `Unhandled promise rejection: ${reason}`, TAG_GLOBAL);
});
