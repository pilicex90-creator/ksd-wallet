const fs = require("fs");
const path = require("path");

// 基础 manifest 配置
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
        "styles/wallet.css",
        "ui/wallet-ui.css",
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

  const distDir = path.join(__dirname, "dist");
  if (!fs.existsSync(distDir)) fs.mkdirSync(distDir);

  const manifestPath = path.join(distDir, "manifest.json");
  fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2));
  console.log(`✅ 已生成 ${target} 版 manifest.json`);
}

// 复制核心文件到 dist/
function copyFiles() {
  const filesToCopy = [
    "wallet.html",
    "sidebar.html",
    "background.js",
    "inject.js",
    "icon16.png",
    "icon48.png",
    "icon128.png"
  ];

  const distDir = path.join(__dirname, "dist");
  if (!fs.existsSync(distDir)) fs.mkdirSync(distDir);

  filesToCopy.forEach(file => {
    const src = path.join(__dirname, file);
    const dest = path.join(distDir, file);
    if (fs.existsSync(src)) {
      fs.copyFileSync(src, dest);
      console.log(`📦 已复制 ${file}`);
    } else {
      console.warn(`⚠️ 文件缺失: ${file}`);
    }
  });
}

// 命令行参数：node build.js chrome / edge / firefox
const target = process.argv[2];
if (!target) {
  console.error("❌ 请指定目标浏览器: chrome | edge | firefox");
  process.exit(1);
}

buildManifest(target);
copyFiles();
console.log("🎉 打包完成，产物已生成在 dist/");
