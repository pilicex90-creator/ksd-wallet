// /ui/entry-ui.js
import { renderImportUI } from "./import-ui.js";
import { mountUI as renderDashboard } from "./mount.js";
import { log, LOG_LEVELS } from "../core/logger.js";

export function mountUI(container) {
  if (!container) {
    throw new Error("未找到挂载容器 #app");
  }

  container.innerHTML = `
    <div class="entry-ui card">
      <h2>KSD Wallet</h2>
      <p>请选择操作：</p>
      <div class="wallet-actions">
        <button id="btn-create">创建新的钱包</button>
        <button id="btn-import">导入已有钱包</button>
      </div>
      <div id="entry-status" class="card-status">等待操作...</div>
    </div>
  `;

  const statusEl = document.getElementById("entry-status");

  // 创建钱包
  document.getElementById("btn-create").addEventListener("click", () => {
    statusEl.textContent = "正在创建新的钱包...";
    log(LOG_LEVELS.INFO, "用户选择创建新钱包", "ENTRY");
    // TODO: emit("createWallet") 或调用核心逻辑
    // 创建完成后进入主界面
    renderDashboard();
  });

  // 导入钱包
  document.getElementById("btn-import").addEventListener("click", () => {
    log(LOG_LEVELS.INFO, "用户选择导入已有钱包", "ENTRY");
    renderImportUI(container); // 切换到导入界面
  });
}
