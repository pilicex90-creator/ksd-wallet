// ui/logs-ui.js
import { on } from "../core/event-bus.js";

/**
 * 渲染交易历史 / 系统日志组件
 * @param {HTMLElement} container - 挂载的 DOM 容器
 */
export function renderLogsUI(container) {
  container.innerHTML = `
    <div class="logs-ui card">
      <h3>交易历史 / 系统日志</h3>
      <div class="logs-actions">
        <button id="btn-clear-logs">清空日志</button>
      </div>
      <ul id="logs-list" class="logs-list">
        <li>暂无交易记录</li>
      </ul>
      <div id="logs-status" class="card-status">等待事件...</div>
    </div>
  `;

  const listEl = document.getElementById("logs-list");
  const statusEl = document.getElementById("logs-status");
  const clearBtn = document.getElementById("btn-clear-logs");

  // 清空日志按钮
  clearBtn.addEventListener("click", () => {
    listEl.innerHTML = `<li>暂无交易记录</li>`;
    setStatus("success", "日志已清空", statusEl);
  });

  // 监听事件并记录日志
  on("txCompleted", (tx) => {
    addLog(`💰 交易完成: ${tx.amount} ${tx.from} → ${tx.to}`, "normal", listEl);
    setStatus("success", "交易日志已更新", statusEl);
  });

  on("bridgeCompleted", (bridge) => {
    addLog(`🌉 跨链交易: ${bridge.amount} ${bridge.token} 从 ${bridge.from} → ${bridge.to}`, "bridge", listEl);
    setStatus("success", "跨链日志已更新", statusEl);
  });

  on("assetsIndexed", (snapshot) => {
    addLog(`📊 资产索引完成: 原生资产 ${snapshot.native}, 代币数量 ${Object.keys(snapshot.tokens).length}`, "system", listEl);
    setStatus("success", "资产日志已更新", statusEl);
  });

  on("networkChanged", (network) => {
    addLog(`🔄 网络切换: ${network.name} (chainId: ${network.chainId})`, "system", listEl);
    setStatus("success", "网络日志已更新", statusEl);
  });

  on("accountChanged", (account) => {
    addLog(`🔑 账户切换: ${account ? account.address : "未连接"}`, "system", listEl);
    setStatus("success", "账户日志已更新", statusEl);
  });

  on("balanceUpdated", (data) => {
    if (data.type === "native") {
      addLog(`💰 原生资产余额更新: ${data.value}`, "system", listEl);
    } else if (data.type === "tokens") {
      addLog(`💰 代币余额更新: ${Object.keys(data.value).length} 个代币`, "system", listEl);
    }
    setStatus("success", "余额日志已更新", statusEl);
  });

  on("walletLocked", () => {
    addLog("🔒 钱包已锁定", "system", listEl);
    setStatus("error", "钱包已锁定", statusEl);
  });
}

/**
 * 添加日志条目
 * @param {string} message - 日志内容
 * @param {string} type - 日志类型: normal | bridge | system
 * @param {HTMLElement} listEl - 日志列表元素
 */
function addLog(message, type = "normal", listEl) {
  if (!listEl) return;

  const timestamp = new Date().toLocaleString();
  const li = document.createElement("li");
  li.textContent = `[${timestamp}] ${message}`;

  li.classList.add(type === "bridge" ? "log-bridge" : type === "system" ? "log-system" : "log-normal");

  // 如果是第一次日志，清空“暂无交易记录”
  if (listEl.children.length === 1 && listEl.children[0].textContent === "暂无交易记录") {
    listEl.innerHTML = "";
  }

  listEl.prepend(li); // 最新日志在最上方
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
