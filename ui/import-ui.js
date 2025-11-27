// /ui/import-ui.js
import { emit } from "../core/event-bus.js";
import { log, LOG_LEVELS } from "../core/logger.js";

export function renderImportUI(container) {
  container.innerHTML = `
    <div class="import-ui card">
      <h3>导入已有钱包</h3>
      <p>请选择导入方式：</p>
      <div class="import-actions">
        <button id="btn-mnemonic">使用助记词</button>
        <button id="btn-privatekey">使用私钥</button>
      </div>
      <div id="import-form"></div>
      <div id="import-status" class="card-status">等待选择...</div>
    </div>
  `;

  const statusEl = document.getElementById("import-status");
  const formEl = document.getElementById("import-form");

  // 助记词导入
  document.getElementById("btn-mnemonic").addEventListener("click", () => {
    formEl.innerHTML = `
      <textarea id="mnemonic-input" placeholder="请输入助记词"></textarea>
      <button id="mnemonic-confirm">确认导入</button>
    `;
    statusEl.textContent = "请输入助记词...";
    document.getElementById("mnemonic-confirm").addEventListener("click", () => {
      const mnemonic = document.getElementById("mnemonic-input").value.trim();
      if (!mnemonic) {
        statusEl.textContent = "助记词不能为空";
        return;
      }
      emit("importWalletMnemonic", mnemonic);
      log(LOG_LEVELS.INFO, "尝试导入助记词钱包", "IMPORT");
      statusEl.textContent = "正在导入助记词钱包...";
    });
  });

  // 私钥导入
  document.getElementById("btn-privatekey").addEventListener("click", () => {
    formEl.innerHTML = `
      <input id="privatekey-input" type="text" placeholder="请输入私钥" />
      <button id="privatekey-confirm">确认导入</button>
    `;
    statusEl.textContent = "请输入私钥...";
    document.getElementById("privatekey-confirm").addEventListener("click", () => {
      const pk = document.getElementById("privatekey-input").value.trim();
      if (!pk) {
        statusEl.textContent = "私钥不能为空";
        return;
      }
      emit("importWalletPrivateKey", pk);
      log(LOG_LEVELS.INFO, "尝试导入私钥钱包", "IMPORT");
      statusEl.textContent = "正在导入私钥钱包...";
    });
  });
}
