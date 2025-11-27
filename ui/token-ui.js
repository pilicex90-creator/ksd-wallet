// ui/token-ui.js
import { on } from "../core/event-bus.js";

/**
 * 渲染代币列表组件
 * @param {HTMLElement} container - 挂载的 DOM 容器
 */
export function renderTokenUI(container) {
  container.innerHTML = `
    <div class="token-ui card">
      <h3>代币资产</h3>
      <input type="text" id="token-search" placeholder="搜索币种..." />
      <table class="token-table">
        <thead>
          <tr>
            <th>币种</th>
            <th>链</th>
            <th>余额</th>
            <th>估值</th>
            <th>年化收益</th>
          </tr>
        </thead>
        <tbody id="token-table-body">
          <tr><td colspan="5">暂无数据</td></tr>
        </tbody>
      </table>
      <div class="card-status" id="token-status">等待索引...</div>
    </div>
  `;

  const searchInput = document.getElementById("token-search");
  const statusEl = document.getElementById("token-status");

  // 搜索功能
  searchInput.addEventListener("input", () => {
    filterTokens(searchInput.value);
  });

  // 事件监听：资产索引完成时更新代币列表
  on("assetsIndexed", (snapshot) => {
    updateTokenTable(snapshot.tokens);
    setStatus("success", "代币列表已更新", statusEl);
  });

  // 事件监听：代币余额单独更新时也刷新
  on("balanceUpdated", (data) => {
    if (data.type === "tokens") {
      updateTokenTable(data.value);
      setStatus("success", "代币余额已刷新", statusEl);
    }
  });
}

/**
 * 更新代币表格内容
 * @param {object} tokens - 代币余额映射 { symbol: balance }
 */
function updateTokenTable(tokens) {
  const tbody = document.getElementById("token-table-body");
  if (!tbody) return;

  tbody.innerHTML = "";

  const metadata = getTokenMetadata();

  Object.entries(tokens).forEach(([symbol, balance]) => {
    const meta = metadata[symbol] || {};
    const row = document.createElement("tr");
    row.classList.add("token-row");

    const valuation = meta.price ? (parseFloat(balance) * meta.price).toFixed(2) : "—";
    const apy = meta.apy ? meta.apy + "%" : "—";

    row.innerHTML = `
      <td>${symbol}</td>
      <td>${meta.chain || "未知"}</td>
      <td>${balance}</td>
      <td>$${valuation}</td>
      <td>${apy}</td>
    `;

    tbody.appendChild(row);
  });

  if (tbody.innerHTML === "") {
    tbody.innerHTML = `<tr><td colspan="5">暂无代币资产</td></tr>`;
  }
}

/**
 * 搜索过滤代币
 */
function filterTokens(keyword) {
  const rows = document.querySelectorAll(".token-row");
  let visibleCount = 0;
  rows.forEach(row => {
    const text = row.textContent.toLowerCase();
    const match = text.includes(keyword.toLowerCase());
    row.style.display = match ? "" : "none";
    if (match) visibleCount++;
  });

  if (visibleCount === 0) {
    const tbody = document.getElementById("token-table-body");
    if (tbody) {
      tbody.innerHTML = `<tr><td colspan="5">未找到匹配代币</td></tr>`;
    }
  }
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
 * 获取代币元数据（链来源、价格、年化收益）
 */
function getTokenMetadata() {
  return {
    SOL:     { chain: "Solana", price: 142.3, apy: 6.85 },
    USDT:    { chain: "多链", price: 1.0, apy: 5.97 },
    USDC:    { chain: "多链", price: 1.0, apy: 7.02 },
    BTC:     { chain: "Bitcoin", price: 89877.1 },
    ETH:     { chain: "Ethereum", price: 3017.31, apy: 3.6 },
    OKB:     { chain: "X Layer", price: 110.21, apy: 4.07 },
    BNB:     { chain: "BNB Chain", price: 892.7, apy: 4.09 },
    TRX:     { chain: "TRON", price: 0.27712, apy: 1.32 },
    BASE_ETH:{ chain: "Base", price: 3017.31, apy: 1.83 },
    AK1111:  { chain: "Base", price: 0.13 },
    USDG:    { chain: "多链", price: 1.0 }
  };
}
