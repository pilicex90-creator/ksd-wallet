// ui/settings-ui.js
import { emit, on } from "../core/event-bus.js";
import { getCurrentNetwork } from "../core/state.js";
import { log, LOG_LEVELS } from "../core/logger.js";

/**
 * 渲染设置界面组件
 * @param {HTMLElement} container - 挂载的 DOM 容器
 */
export function renderSettingsUI(container) {
  container.innerHTML = `
    <div class="settings-ui card">
      <h3>钱包设置</h3>
      <div class="settings-actions">
        <button id="btn-network">切换网络</button>
        <button id="btn-dapp">DApp连接管理</button>
        <button id="btn-sidebar">侧边栏模式</button>
        <button id="btn-lock">锁定钱包</button>
        <button id="btn-unlock">解锁钱包</button>
      </div>
      <div id="settings-status" class="card-status">等待操作...</div>
    </div>
  `;

  const statusEl = document.getElementById("settings-status");

  // 初始化状态：读取锁定状态
  chrome.storage.local.get(["locked"], (result) => {
    if (result.locked) {
      setStatus("error", "钱包已锁定", statusEl);
    } else {
      setStatus("success", "钱包已解锁", statusEl);
    }
  });

  // 网络切换
  bindButton("btn-network", () => {
    try {
      const current = getCurrentNetwork();
      setStatus("loading", `当前网络: ${current ? current.name : "未知"} → 打开网络选择器`, statusEl);
      emit("openNetworkSelector");
      log(LOG_LEVELS.INFO, "打开网络选择器");
    } catch (err) {
      setStatus("error", "网络切换失败", statusEl);
      log(LOG_LEVELS.ERROR, "网络切换失败: " + err.message);
    }
  });

  // 监听网络切换完成
  on("networkChanged", (network) => {
    setStatus("success", `已切换到 ${network.name} (chainId: ${network.chainId})`, statusEl);
    log(LOG_LEVELS.INFO, `网络已切换到 ${network.name}`);
  });

  // DApp连接管理
  bindButton("btn-dapp", () => {
    setStatus("loading", "打开 DApp 连接管理界面", statusEl);
    emit("openDappManager");
    log(LOG_LEVELS.INFO, "打开 DApp 连接管理界面");
  });

  // 侧边栏模式
  bindButton("btn-sidebar", () => {
    setStatus("loading", "切换到侧边栏模式", statusEl);
    emit("toggleSidebarMode");
    log(LOG_LEVELS.INFO, "切换到侧边栏模式");
    chrome.storage.local.set({ sidebarMode: true });
  });

  // 锁定钱包
  bindButton("btn-lock", () => {
    setStatus("error", "钱包已锁定", statusEl);
    emit("walletLocked");
    log(LOG_LEVELS.WARN, "钱包已锁定");
    chrome.storage.local.set({ locked: true });
  });

  // 解锁钱包
  bindButton("btn-unlock", () => {
    setStatus("success", "钱包已解锁", statusEl);
    emit("walletUnlocked");
    log(LOG_LEVELS.INFO, "钱包已解锁");
    chrome.storage.local.set({ locked: false });
  });

  // 事件驱动：钱包锁定时更新状态
  on("walletLocked", () => {
    setStatus("error", "钱包已锁定", statusEl);
  });

  // 事件驱动：钱包解锁时更新状态
  on("walletUnlocked", () => {
    setStatus("success", "钱包已解锁", statusEl);
  });
}

/**
 * 设置状态提示
 */
function setStatus(type, message, statusEl) {
  if (statusEl) {
    statusEl.className = `card-status ${type}`;
    statusEl.textContent = message;
  }
}

/**
 * 绑定按钮事件
 */
function bindButton(id, handler) {
  const btn = document.getElementById(id);
  if (btn) btn.addEventListener("click", handler);
}
