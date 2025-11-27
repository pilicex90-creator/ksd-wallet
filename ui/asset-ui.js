import { on, emit } from "../core/event-bus.js";
import { getCurrentNetwork, getCurrentAccount } from "../core/state.js";
import { indexAssets } from "../core/asset-indexer.js";

let lastSnapshot = null; // 保存上一次快照，用于涨幅计算

export function renderAssetUI(container) {
  container.innerHTML = `
    <div class="asset-ui">
      <h3>资产快照</h3>
      <div class="asset-summary card">
        <p>账户: <span id="asset-account">未连接</span></p>
        <p>网络: <span id="asset-network">未知</span></p>
        <p>原生资产: <span id="asset-native">0</span></p>
        <p>代币总估值: <span id="asset-total">$0.00</span></p>
        <p>代币数量: <span id="asset-count">0</span></p>
        <p>1日变化: <span id="asset-change" class="asset-change">—</span></p>
      </div>
      <div class="asset-actions card">
        <button id="btn-reindex">重新索引资产</button>
        <span id="asset-status" class="card-status">等待操作...</span>
      </div>
    </div>
  `;

  // 缓存常用元素
  const statusEl = document.getElementById("asset-status");
  const reindexBtn = document.getElementById("btn-reindex");

  // 初始化显示
  updateAccountUI(getCurrentAccount());
  updateNetworkUI(getCurrentNetwork());
  indexAssets();

  // 事件监听
  on("accountChanged", updateAccountUI);
  on("networkChanged", updateNetworkUI);
  on("assetsIndexed", (snapshot) => updateAssetSnapshot(snapshot, statusEl));

  // 按钮事件
  reindexBtn.addEventListener("click", () => {
    disableButton(reindexBtn);
    if (statusEl) {
      statusEl.textContent = "正在索引资产...";
      statusEl.className = "card-status loading";
    }
    indexAssets().finally(() => {
      enableButton(reindexBtn);
      if (statusEl) {
        statusEl.textContent = "索引完成";
        statusEl.className = "card-status success";
      }
    });
  });
}

function updateAccountUI(account) {
  const el = document.getElementById("asset-account");
  if (el) el.textContent = account ? account.address : "未连接";
}

function updateNetworkUI(network) {
  const el = document.getElementById("asset-network");
  if (el && network) el.textContent = `${network.name} (chainId: ${network.chainId})`;
}

function updateAssetSnapshot(snapshot, statusEl) {
  const nativeEl = document.getElementById("asset-native");
  const totalEl = document.getElementById("asset-total");
  const countEl = document.getElementById("asset-count");
  const changeEl = document.getElementById("asset-change");

  if (nativeEl) nativeEl.textContent = snapshot.native;

  // 计算代币总估值
  const { totalValue, tokenCount } = calculateSnapshotValue(snapshot.tokens);

  if (totalEl) totalEl.textContent = `$${totalValue.toFixed(2)}`;
  if (countEl) countEl.textContent = tokenCount;

  // 涨幅计算逻辑
  if (lastSnapshot) {
    const prevValue = calculateSnapshotValue(lastSnapshot.tokens).totalValue;
    const diff = totalValue - prevValue;
    const percent = prevValue > 0 ? (diff / prevValue) * 100 : 0;

    if (changeEl) {
      changeEl.textContent = `${diff >= 0 ? "+" : ""}$${diff.toFixed(2)} (${percent.toFixed(2)}%) 1日`;
      changeEl.className = `asset-change ${diff >= 0 ? "positive" : "negative"}`;
    }
  }

  // 保存当前快照用于下次对比
  lastSnapshot = snapshot;

  if (statusEl) {
    statusEl.textContent = "资产快照已更新";
    statusEl.className = "card-status success";
  }
}

function calculateSnapshotValue(tokens) {
  const metadata = getTokenMetadata();
  let totalValue = 0;
  let tokenCount = 0;
  for (const [symbol, balance] of Object.entries(tokens)) {
    const meta = metadata[symbol];
    if (meta && meta.price) {
      totalValue += parseFloat(balance) * meta.price;
    }
    tokenCount++;
  }
  return { totalValue, tokenCount };
}

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

function disableButton(btn) {
  if (btn) btn.disabled = true;
}

function enableButton(btn) {
  if (btn) btn.disabled = false;
}
