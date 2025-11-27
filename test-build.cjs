// test-build.js
// 在根目录运行：node test-build.js
// 用于检查最终打包 Checklist 的关键文件和路径闭合性

const fs = require("fs");
const path = require("path");

const root = __dirname;

// 必须存在的文件
const requiredFiles = [
  "manifest.json",
  "wallet.html",
  "wallet.js",
  "background.js",
  "icon16.png",
  "icon48.png",
  "icon128.png"
];

// 必须存在的目录
const requiredDirs = [
  "styles",
  "ui",
  "core",
  "config"
];

// 必须存在的 CSS 文件
const requiredCSS = [
  "styles/base.css",
  "styles/nav.css",
  "styles/card.css",
  "styles/wallet.css",
  "styles/assets.css",
  "styles/token.css",
  "styles/tx.css",
  "styles/settings.css",
  "styles/logs.css",
  "ui/wallet-ui.css"
];

// 检查文件是否存在
function checkFiles(files) {
  return files.map(f => {
    const fullPath = path.join(root, f);
    return fs.existsSync(fullPath) ? `[✔] ${f}` : `[✘] 缺失: ${f}`;
  });
}

// 检查目录是否存在
function checkDirs(dirs) {
  return dirs.map(d => {
    const fullPath = path.join(root, d);
    return fs.existsSync(fullPath) ? `[✔] ${d}/` : `[✘] 缺失目录: ${d}/`;
  });
}

// 读取 manifest.json 并检查关键字段
function checkManifest() {
  const manifestPath = path.join(root, "manifest.json");
  if (!fs.existsSync(manifestPath)) return "[✘] 缺失 manifest.json";

  const manifest = JSON.parse(fs.readFileSync(manifestPath, "utf8"));
  const checks = [];

  if (manifest.manifest_version === 3) checks.push("[✔] manifest_version = 3");
  else checks.push("[✘] manifest_version 错误");

  if (manifest.background?.service_worker === "background.js")
    checks.push("[✔] background.service_worker = background.js");
  else checks.push("[✘] background.service_worker 配置错误");

  if (manifest.action?.default_title === "KSD Wallet")
    checks.push("[✔] action.default_title = KSD Wallet");
  else checks.push("[✘] action.default_title 配置错误");

  if (manifest.permissions?.includes("tabs"))
    checks.push("[✔] permissions 包含 tabs");
  else checks.push("[✘] 缺少 tabs 权限");

  if (manifest.permissions?.includes("storage"))
    checks.push("[✔] permissions 包含 storage");
  else checks.push("[✘] 缺少 storage 权限");

  return checks.join("\n");
}

// 执行检查
console.log("=== 检查必需文件 ===");
console.log(checkFiles(requiredFiles).join("\n"));

console.log("\n=== 检查必需目录 ===");
console.log(checkDirs(requiredDirs).join("\n"));

console.log("\n=== 检查 CSS 文件 ===");
console.log(checkFiles(requiredCSS).join("\n"));

console.log("\n=== 检查 manifest.json 配置 ===");
console.log(checkManifest());
