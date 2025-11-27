// core/token-updater.js
import fs from "fs";
import path from "path";
import fetch from "node-fetch";
import { emit, on } from "./event-bus.js";
import { log } from "./logger.js";
import { getApiBaseURL } from "./api-loader.js";

const tokenMapPath = "./config/token-map.json";
const ETHERSCAN_API_KEY = process.env.ETHERSCAN_API_KEY || "YOUR_API_KEY";

/**
 * 从链的 API 拉取代币列表
 * @param {number|string} chainId - 当前网络的 chainId
 * @returns {Promise<Array>} - 代币列表
 */
async function fetchTokens(chainId) {
  const apiInfo = getApiBaseURL(chainId);

  if (!apiInfo.available || !apiInfo.baseURL) {
    log("warn", `API not available for chainId ${chainId} (${apiInfo.name})`);
    return [];
  }

  try {
    // 示例：使用 Etherscan V2 API 的通用 token list 接口
    const url = `${apiInfo.baseURL}?module=token&action=list&apikey=${ETHERSCAN_API_KEY}`;
    const res = await fetch(url);
    const data = await res.json();

    if (data.status !== "1") {
      throw new Error(`API error: ${data.message}`);
    }

    return data.result.map(token => ({
      address: token.contractAddress,
      symbol: token.symbol,
      decimals: parseInt(token.decimals, 10),
      name: token.name
    }));
  } catch (err) {
    log("error", `Failed to fetch tokens for chainId ${chainId}: ${err.message}`);
    return [];
  }
}

/**
 * 更新 token-map.json
 * @param {number|string} chainId - 当前网络的 chainId
 */
export async function updateTokenMap(chainId) {
  const tokens = await fetchTokens(chainId);

  if (tokens.length === 0) {
    log("warn", `No tokens fetched for chainId ${chainId}`);
    return;
  }

  let tokenMap = {};
  if (fs.existsSync(tokenMapPath)) {
    tokenMap = JSON.parse(fs.readFileSync(tokenMapPath, "utf8"));
  }

  tokenMap[chainId] = tokens;
  fs.writeFileSync(tokenMapPath, JSON.stringify(tokenMap, null, 2), "utf8");

  log("info", `Token map updated for chainId ${chainId}, total tokens: ${tokens.length}`);
  emit("tokenMapUpdated", { chainId, tokens });
}

/**
 * 事件驱动：网络切换时自动更新代币列表
 */
on("networkChanged", (network) => {
  log("info", `Network changed → updating token map for ${network.name}`);
  updateTokenMap(network.chainId);
});
