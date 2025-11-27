// ui/wallet-ui.js
import { on, emit } from "../core/event-bus.js";
import { getCurrentNetwork, getCurrentAccount } from "../core/state.js";
import { indexAssets } from "../core/asset-indexer.js";

/**
 * 渲染钱包总览仪表盘
 * @param {HTMLElement} container - 挂载的 DOM 容器
 */
export function renderWalletUI(container) {
  container.innerHTML = `
    <div class="wallet-ui">
      <div class="wallet-header card">
        <h2>钱包总览</h2>
        <span class="card-status" id="wallet-status">初始化中...</span>
      </div>

      <div class="card">
        <h3>网络</h3>
        <p id="wallet-network">加载中...</p>
      </div>

      <div class="card">
        <h3>账户</h3>
        <p id="wallet-account">加载中...</p>
      </div>

      <div class="card">
        <h3>原生资产余额</h3>
        <p id="wallet-native">0</p>
      </div>

      <div class="wallet-actions card">
        <button id="btn-refresh">刷新资产</button>
        <button id="btn-lock">锁定钱包</button>
      </div>
    </div>
  `;

  // 缓存常用元素
  const statusEl = document.getElementById("wallet-status");
  const refreshBtn = document.getElementById("btn-refresh");
  const lockBtn = document.getElementById("btn-lock");

  // 初始化显示
  updateNetworkUI(getCurrentNetwork(), statusEl);
  updateAccountUI(getCurrentAccount());
  updateNativeBalance("0");
  indexAssets();

  // 事件监听
  on("networkChanged", (network) => updateNetworkUI(network, statusEl));
  on("accountChanged", updateAccountUI);
  on("balanceUpdated", (data) => {
    if (data.type === "native") updateNativeBalance(data.value);
  });
  on("walletLocked", () => {
    updateAccountUI(null);
    updateNativeBalance("0");
    if (statusEl) {
      statusEl.textContent = "钱包已锁定";
      statusEl.className = "card-status error";
    }
  });

  // 按钮事件
  refreshBtn.addEventListener("click", () => {
    disableButton(refreshBtn);
    if (statusEl) {
      statusEl.textContent = "正在刷新资产...";
      statusEl.className = "card-status loading";
    }
    indexAssets().finally(() => {
      enableButton(refreshBtn);
      if (statusEl) {
        statusEl.textContent = "刷新完成";
        statusEl.className = "card-status success";
      }
    });
  });

  lockBtn.addEventListener("click", () => emit("walletLocked"));
}

/**
 * 更新网络显示
 */
function updateNetworkUI(network, statusEl) {
  const el = document.getElementById("wallet-network");
  if (el && network) {
    el.textContent = `${network.name} (chainId: ${network.chainId})`;
    if (statusEl) {
      statusEl.textContent = `已连接 ${network.name}`;
      statusEl.className = "card-status success";
    }
  }
}

/**
 * 更新账户显示
 */
function updateAccountUI(account) {
  const el = document.getElementById("wallet-account");
  if (el) el.textContent = account ? account.address : "未连接";
}

/**
 * 更新原生资产余额显示
 */
function updateNativeBalance(balance) {
  const el = document.getElementById("wallet-native");
  if (el) el.textContent = balance;
}

/**
 * 禁用按钮
 */
function disableButton(btn) {
  if (btn) btn.disabled = true;
}

/**
 * 启用按钮
 */
function enableButton(btn) {
  if (btn) btn.disabled = false;
}
