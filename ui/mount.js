import { renderWalletUI } from "./wallet-ui.js";
import { renderTxUI } from "./tx-ui.js";
import { renderAssetUI } from "./asset-ui.js";
import { renderTokenUI } from "./token-ui.js";
import { renderSettingsUI } from "./settings-ui.js";
import { renderLogsUI } from "./logs-ui.js";
import { renderBridgeUI } from "./bridge-ui.js";
import { log, LOG_LEVELS } from "../core/logger.js";
import { on } from "../core/event-bus.js";

export function mountUI() {
  const root = document.getElementById("app");
  if (!root) {
    console.error("No #app container found in HTML");
    return;
  }

  root.innerHTML = `
    <div class="wallet-container">
      <nav class="wallet-nav">
        <button data-target="wallet-ui">钱包</button>
        <button data-target="asset-ui">资产</button>
        <button data-target="token-ui">代币</button>
        <button data-target="tx-ui">交易</button>
        <button data-target="settings-ui">设置</button>
        <button data-target="logs-ui">日志</button>
        <button data-target="bridge-ui">跨链桥</button>
      </nav>
      <section id="wallet-ui"></section>
      <section id="tx-ui"></section>
      <section id="asset-ui"></section>
      <section id="token-ui"></section>
      <section id="settings-ui"></section>
      <section id="logs-ui"></section>
      <section id="bridge-ui"></section>
    </div>
  `;

  // 渲染各模块（带错误保护）
  safeRender(renderWalletUI, "wallet-ui");
  safeRender(renderTxUI, "tx-ui");
  safeRender(renderAssetUI, "asset-ui");
  safeRender(renderTokenUI, "token-ui");
  safeRender(renderSettingsUI, "settings-ui");
  safeRender(renderLogsUI, "logs-ui");
  safeRender(renderBridgeUI, "bridge-ui");

  // 恢复上次打开的 section
  try {
    chrome.storage.local.get(["lastSection"], (data) => {
      const section = data?.lastSection || "wallet-ui";
      switchSection(section);
    });
  } catch (err) {
    log(LOG_LEVELS.WARN, "Failed to restore last section, fallback to wallet-ui", "ENTRY");
    switchSection("wallet-ui");
  }

  // 导航按钮事件委托
  root.querySelector(".wallet-nav").addEventListener("click", (e) => {
    const btn = e.target.closest("button[data-target]");
    if (!btn) return;
    const target = btn.getAttribute("data-target");
    switchSection(target);
    log(LOG_LEVELS.INFO, `Switched to section: ${target}`);
    chrome.storage.local.set({ lastSection: target });
  });

  // 事件驱动：资产索引完成 → 自动切换到资产页
  on("assetsIndexed", () => {
    switchSection("asset-ui");
    log(LOG_LEVELS.INFO, "Assets indexed → switched to asset-ui");
  });

  // 事件驱动：跨链完成 → 自动切换到日志页
  on("bridgeCompleted", (data) => {
    switchSection("logs-ui");
    log(LOG_LEVELS.INFO, `Bridge completed: ${data.amount} ${data.token} ${data.from} → ${data.to}`);
  });

  // 事件驱动：钱包锁定 → 自动切换到设置页
  on("walletLocked", () => {
    switchSection("settings-ui");
    log(LOG_LEVELS.WARN, "Wallet locked → switched to settings-ui");
  });
}

function safeRender(fn, id) {
  try {
    const el = document.getElementById(id);
    if (!el) {
      log(LOG_LEVELS.ERROR, `Element #${id} not found`);
      return;
    }
    fn(el);
  } catch (err) {
    log(LOG_LEVELS.ERROR, `Failed to render ${id}: ${err.message}\n${err.stack}`);
  }
}

function switchSection(id) {
  const sections = document.querySelectorAll("#app > .wallet-container > section");
  sections.forEach((sec) => {
    sec.classList.toggle("active", sec.id === id);
  });

  const navButtons = document.querySelectorAll(".wallet-nav button");
  navButtons.forEach((btn) => {
    btn.classList.toggle("active", btn.getAttribute("data-target") === id);
  });
}
