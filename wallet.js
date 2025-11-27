// wallet.js
import { on, emit } from "./core/event-bus.js";
import { log, LOG_LEVELS } from "./core/logger.js";
import { indexAssets } from "./core/asset-indexer.js";
import { getCurrentAccount, getCurrentNetwork } from "./core/state.js";
import { mountUI } from "./ui/mount.js";

// 初始化 UI
document.addEventListener("DOMContentLoaded", () => {
  log(LOG_LEVELS.INFO, "Wallet UI initializing...");
  mountUI();

  // 初始资产索引
  try {
    const account = getCurrentAccount();
    const network = getCurrentNetwork();
    if (account && network) {
      indexAssets().then(snapshot => {
        emit("assetsIndexed", snapshot);
      });
    } else {
      log(LOG_LEVELS.WARN, "No active account or network at UI startup.");
    }
  } catch (err) {
    log(LOG_LEVELS.ERROR, `UI startup asset indexing failed: ${err.message}`);
  }
});

// 事件驱动：监听资产更新
on("assetsIndexed", (snapshot) => {
  log(LOG_LEVELS.INFO, "Assets reindexed → updating UI");
  const assetSection = document.getElementById("asset-ui");
  if (assetSection) {
    assetSection.querySelector(".native-balance").textContent = snapshot.native;
    const tokenList = assetSection.querySelector(".token-list");
    if (tokenList) {
      tokenList.innerHTML = "";
      Object.entries(snapshot.tokens).forEach(([symbol, balance]) => {
        const li = document.createElement("li");
        li.textContent = `${symbol}: ${balance}`;
        tokenList.appendChild(li);
      });
    }
  }
});

// 事件驱动：监听网络切换
on("networkChanged", (network) => {
  log(LOG_LEVELS.INFO, `UI detected network change → ${network.name}`);
  const netLabel = document.getElementById("network-label");
  if (netLabel) {
    netLabel.textContent = `${network.name} (chainId: ${network.chainId})`;
  }
});

// 事件驱动：监听账户切换
on("accountChanged", (account) => {
  log(LOG_LEVELS.INFO, `UI detected account change → ${account.address}`);
  const accLabel = document.getElementById("account-label");
  if (accLabel) {
    accLabel.textContent = account.address;
  }
});

// 与后台通信：请求重新索引
document.getElementById("btn-reindex")?.addEventListener("click", () => {
  log(LOG_LEVELS.INFO, "User triggered asset reindex");
  chrome.runtime.sendMessage({ type: "reindexAssets" }, (response) => {
    if (response.success) {
      emit("assetsIndexed", response.snapshot);
    } else {
      log(LOG_LEVELS.ERROR, `Reindex failed: ${response.error}`);
    }
  });
});
