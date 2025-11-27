import { getCurrentNetwork, getCurrentAccount, setSnapshot } from "./state.js";
import { emit, on } from "./event-bus.js";
import { log } from "./logger.js";
import {
  JsonRpcProvider,
  Contract,
  formatEther,
  formatUnits
} from "ethers";

// 使用 chrome.runtime.getURL 来定位扩展内的资源
const tokenMapUrl = chrome.runtime.getURL("config/token-map.json");

export async function getNativeBalance() {
  const account = getCurrentAccount();
  const network = getCurrentNetwork();
  if (!account || !network?.rpc) throw new Error("No active account or network");

  const provider = new JsonRpcProvider(network.rpc);
  const balance = await provider.getBalance(account.address);
  const formatted = formatEther(balance);

  log("info", `Native balance for ${account.address} on ${network.name}: ${formatted}`);
  emit("balanceUpdated", { type: "native", value: formatted });
  return formatted;
}

export async function getTokenBalances() {
  const account = getCurrentAccount();
  const network = getCurrentNetwork();
  if (!account || !network?.rpc) throw new Error("No active account or network");

  let tokenMap;
  try {
    const res = await fetch(tokenMapUrl);
    tokenMap = await res.json();
  } catch (err) {
    log("warn", "token-map.json not found or failed to load, skipping token balances");
    return {};
  }

  const tokens = tokenMap[network.chainId] || [];
  const provider = new JsonRpcProvider(network.rpc);

  const balances = {};
  await Promise.all(tokens.map(async (token) => {
    try {
      const contract = new Contract(
        token.address,
        ["function balanceOf(address owner) view returns (uint256)", "function decimals() view returns (uint8)"],
        provider
      );
      const rawBalance = await contract.balanceOf(account.address);
      const decimals = token.decimals || await contract.decimals();
      const formatted = formatUnits(rawBalance, decimals);

      balances[token.symbol] = formatted;
      log("info", `Token balance for ${token.symbol}: ${formatted}`);
    } catch (err) {
      log("error", `Failed to fetch balance for ${token.symbol}: ${err.message}`);
    }
  }));

  emit("balanceUpdated", { type: "tokens", value: balances });
  return balances;
}

export async function indexAssets() {
  try {
    const native = await getNativeBalance();
    const tokens = await getTokenBalances();
    const snapshot = { native, tokens };

    setSnapshot(snapshot); // 更新全局状态
    emit("assetsIndexed", snapshot);

    log("info", `Assets indexed for ${getCurrentAccount().address} on ${getCurrentNetwork().name}`);
    return snapshot;
  } catch (err) {
    log("error", `Asset indexing failed: ${err.message}`);
    emit("assetsIndexFailed", err);
    throw err;
  }
}

export function startAssetPolling(intervalSeconds = 60) {
  setInterval(() => {
    indexAssets().catch(err => log("error", `Polling failed: ${err.message}`));
  }, intervalSeconds * 1000);
  log("info", `Asset polling started (interval: ${intervalSeconds}s)`);
}

on("tokenMapUpdated", () => {
  log("info", "Token map updated → reindexing assets");
  indexAssets();
});
