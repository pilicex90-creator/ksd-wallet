// ui/bridge-ui.js
import { emit } from "../core/event-bus.js";

/**
 * 渲染跨链桥组件
 * @param {HTMLElement} container - 挂载的 DOM 容器
 */
export function renderBridgeUI(container) {
  container.innerHTML = `
    <div class="bridge-ui">
      <h3>跨链桥</h3>
      <div class="bridge-row">
        <label>源链</label>
        <select id="bridge-from"></select>
      </div>
      <div class="bridge-row">
        <label>目标链</label>
        <select id="bridge-to"></select>
      </div>
      <div class="bridge-row">
        <label>币种</label>
        <select id="bridge-token"></select>
      </div>
      <div class="bridge-row">
        <label>数量</label>
        <input type="number" id="bridge-amount" placeholder="输入数量" />
      </div>
      <div class="bridge-actions">
        <button id="btn-bridge-execute">跨链转移</button>
      </div>
      <div id="bridge-status" class="bridge-status">等待操作...</div>
    </div>
  `;

  const fromSelect = document.getElementById("bridge-from");
  const toSelect = document.getElementById("bridge-to");
  const tokenSelect = document.getElementById("bridge-token");
  const status = document.getElementById("bridge-status");

  // 初始化链和币种列表
  const networks = getSupportedNetworks();
  const tokens = getSupportedTokens();

  networks.forEach(n => {
    const optFrom = document.createElement("option");
    optFrom.value = n.name;
    optFrom.textContent = n.name;
    fromSelect.appendChild(optFrom);

    const optTo = document.createElement("option");
    optTo.value = n.name;
    optTo.textContent = n.name;
    toSelect.appendChild(optTo);
  });

  tokens.forEach(t => {
    const opt = document.createElement("option");
    opt.value = t.symbol;
    opt.textContent = `${t.symbol} (${t.chain})`;
    tokenSelect.appendChild(opt);
  });

  // 执行跨链转移
  document.getElementById("btn-bridge-execute").addEventListener("click", () => {
    const from = fromSelect.value;
    const to = toSelect.value;
    const token = tokenSelect.value;
    const amount = parseFloat(document.getElementById("bridge-amount").value);

    if (!from || !to || !token || !amount || amount <= 0) {
      status.textContent = "请输入有效的跨链信息";
      return;
    }

    if (from === to) {
      status.textContent = "源链和目标链不能相同";
      return;
    }

    status.textContent = `正在跨链转移 ${amount} ${token} 从 ${from} → ${to}...`;

    // 模拟跨链操作
    setTimeout(() => {
      status.textContent = `跨链成功: ${amount} ${token} 从 ${from} → ${to}`;
      emit("bridgeCompleted", { from, to, token, amount });
    }, 1500);
  });
}

/**
 * 支持的网络列表
 */
function getSupportedNetworks() {
  return [
    { name: "Ethereum", chainId: 1 },
    { name: "BNB Chain", chainId: 56 },
    { name: "Solana", chainId: "solana" },
    { name: "Polygon", chainId: 137 },
    { name: "Arbitrum One", chainId: 42161 },
    { name: "Avalanche C", chainId: 43114 },
    { name: "Base", chainId: 8453 },
    { name: "X Layer", chainId: "xlayer" },
    { name: "TRON", chainId: "tron" }
  ];
}

/**
 * 支持的代币列表
 */
function getSupportedTokens() {
  return [
    { symbol: "USDT", chain: "多链" },
    { symbol: "USDC", chain: "多链" },
    { symbol: "ETH", chain: "Ethereum" },
    { symbol: "BTC", chain: "Bitcoin" },
    { symbol: "SOL", chain: "Solana" },
    { symbol: "BNB", chain: "BNB Chain" },
    { symbol: "OKB", chain: "X Layer" },
    { symbol: "TRX", chain: "TRON" }
  ];
}
