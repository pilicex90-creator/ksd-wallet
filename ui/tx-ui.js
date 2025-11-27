// ui/tx-ui.js
import { emit, on } from "../core/event-bus.js";

/**
 * 渲染交易界面（兑换面板）
 * @param {HTMLElement} container - 挂载的 DOM 容器
 */
export function renderTxUI(container) {
  container.innerHTML = `
    <div class="tx-ui card">
      <h3>资产兑换</h3>
      <form class="tx-form">
        <label>从币种</label>
        <select id="swap-from"></select>

        <label>到币种</label>
        <select id="swap-to"></select>

        <label>兑换数量</label>
        <input type="number" id="swap-amount" placeholder="输入数量" />
      </form>

      <div class="tx-actions">
        <button id="btn-swap">兑换</button>
        <button id="btn-bridge">跨链桥</button>
      </div>

      <div id="swap-status" class="card-status">等待操作...</div>
    </div>
  `;

  // 缓存元素
  const fromSelect = document.getElementById("swap-from");
  const toSelect = document.getElementById("swap-to");
  const amountInput = document.getElementById("swap-amount");
  const swapBtn = document.getElementById("btn-swap");
  const bridgeBtn = document.getElementById("btn-bridge");
  const statusEl = document.getElementById("swap-status");

  // 初始化币种列表
  getTokenList().forEach(token => {
    const optionFrom = new Option(`${token.symbol} (${token.chain})`, token.symbol);
    const optionTo = new Option(`${token.symbol} (${token.chain})`, token.symbol);
    fromSelect.add(optionFrom);
    toSelect.add(optionTo);
  });

  // 兑换按钮事件
  swapBtn.addEventListener("click", () => {
    const from = fromSelect.value;
    const to = toSelect.value;
    const amount = parseFloat(amountInput.value);

    if (!from || !to || !amount || amount <= 0) {
      setStatus("error", "请输入有效的兑换信息", statusEl);
      return;
    }

    setStatus("loading", `正在兑换 ${amount} ${from} → ${to}...`, statusEl);
    disableButton(swapBtn);

    // 模拟广播事件
    setTimeout(() => {
      setStatus("success", `兑换成功：${amount} ${from} → ${to}`, statusEl);
      emit("txCompleted", { from, to, amount });
      enableButton(swapBtn);
    }, 1000);
  });

  // 跨链桥按钮事件
  bridgeBtn.addEventListener("click", () => {
    setStatus("error", "跨链桥功能暂未启用", statusEl);
  });

  // 事件驱动：交易完成时自动提示
  on("txCompleted", (tx) => {
    setStatus("success", `交易完成：${tx.amount} ${tx.from} → ${tx.to}`, statusEl);
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
 * 按钮禁用/启用
 */
function disableButton(btn) {
  if (btn) btn.disabled = true;
}
function enableButton(btn) {
  if (btn) btn.disabled = false;
}

/**
 * 获取支持的代币列表（静态元数据）
 */
function getTokenList() {
  return [
    { symbol: "USDT", chain: "BNB Chain" },
    { symbol: "USDC", chain: "Ethereum" },
    { symbol: "SOL", chain: "Solana" },
    { symbol: "ETH", chain: "Base" },
    { symbol: "BTC", chain: "Bitcoin" },
    { symbol: "AK1111", chain: "Base" },
    { symbol: "USDG", chain: "多链" },
    { symbol: "OKB", chain: "X Layer" },
    { symbol: "TRX", chain: "TRON" }
  ];
}
