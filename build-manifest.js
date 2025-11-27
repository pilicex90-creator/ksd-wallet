const fs = require("fs");
const path = require("path");

// 基础 manifest 配置（通用部分）
const baseManifest = {
  manifest_version: 3,
  name: "KSD Wallet",
  version: "1.0.0",
  description: "自建去中心化钱包扩展，支持账户管理、交易签名、资产索引和网络交互",
  icons: {
    "16": "icon16.png",
    "48": "icon48.png",
    "128": "icon128.png"
  },
  background: {
    service_worker: "background.js"
  },
  action: {
    default_title: "KSD Wallet"
    // 注意：这里不写 default_popup，避免 Chrome/Edge 阻塞 background.js
  },
  permissions: ["tabs", "storage"],
  host_permissions: ["<all_urls>"],
  content_scripts: [
    {
      matches: ["<all_urls>"],
      js: ["inject.js"],
      run_at: "document_start"
    }
  ],
  web_accessible_resources: [
    {
      resources: [
        "wallet.html",
        "sidebar.html",
        "js/wallet.bundle.js",
        "styles/base.css",
        "styles/nav.css",
        "styles/card.css",
        "styles/wallet.css",
        "styles/assets.css",
        "styles/token.css",
        "styles/tx.css",
        "styles/settings.css",
        "styles/logs.css",
        "ui/wallet-ui.css",
        "ui/asset-ui.js",
        "ui/bridge-ui.js",
        "ui/entry-ui.js",
        "ui/entry.js",
        "ui/import-ui.js",
        "ui/logs-ui.js",
        "ui/mount.js",
        "ui/network-selector.js",
        "ui/settings-ui.js",
        "ui/settings.js",
        "ui/token-ui.js",
        "ui/tx-ui.js",
        "ui/wallet-ui.js",
        "icon16.png",
        "icon48.png",
        "icon128.png"
      ],
      matches: ["<all_urls>"]
    }
  ]
};

// 根据目标浏览器生成 manifest
function buildManifest(target) {
  const manifest = { ...baseManifest };

  if (target === "firefox") {
    manifest.sidebar_action = {
      default_title: "KSD Wallet",
      default_panel: "sidebar.html"
    };
  }

  const outputPath = path.join(__dirname, `manifest.${target}.json`);
  fs.writeFileSync(outputPath, JSON.stringify(manifest, null, 2));
  console.log(`✅ 已生成 ${outputPath}`);
}

// 命令行参数：node build-manifest.js chrome / edge / firefox
const target = process.argv[2];
if (!target) {
  console.error("❌ 请指定目标浏览器: chrome | edge | firefox");
  process.exit(1);
}

buildManifest(target);
