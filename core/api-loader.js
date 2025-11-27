// core/api-loader.js
import fs from "fs";
import path from "path";
import { log } from "./logger.js";

const apiMapPath = "./config/api-map.json";

let apiMap = {};

// 初始化加载路由表
function loadApiMap() {
  if (!fs.existsSync(apiMapPath)) {
    log("error", "api-map.json not found");
    return {};
  }
  try {
    const data = fs.readFileSync(apiMapPath, "utf8");
    apiMap = JSON.parse(data);
    log("info", "API map loaded successfully");
    return apiMap;
  } catch (err) {
    log("error", `Failed to load api-map.json: ${err.message}`);
    return {};
  }
}

// 首次加载
loadApiMap();

/**
 * 获取链的 API baseURL
 * @param {string|number} chainId - 链 ID 或特殊标识 (如 "solana")
 * @returns {object} - { baseURL, available, name }
 */
export function getApiBaseURL(chainId) {
  if (!apiMap[chainId]) {
    log("warn", `No API mapping found for chainId: ${chainId}`);
    return { baseURL: null, available: false, name: "Unknown" };
  }
  return apiMap[chainId];
}

/**
 * 刷新路由表（例如在文件更新后调用）
 */
export function reloadApiMap() {
  return loadApiMap();
}
