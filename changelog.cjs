const fs = require("fs");
const path = require("path");

// 获取当前版本号
const pkgPath = path.join(process.cwd(), "package.json");
const pkg = JSON.parse(fs.readFileSync(pkgPath, "utf-8"));
const version = pkg.version;

// 获取当前日期
const date = new Date().toISOString().split("T")[0];

// 生成 changelog 条目
const entry = `\n## [${version}] - ${date}\n- 自动生成版本更新记录\n`;

const changelogPath = path.join(process.cwd(), "CHANGELOG.md");

// 如果文件不存在，先创建
if (!fs.existsSync(changelogPath)) {
  fs.writeFileSync(changelogPath, "# Changelog\n\n所有版本更新记录：\n");
}

// 追加新条目
fs.appendFileSync(changelogPath, entry);
console.log(`✅ 已更新 CHANGELOG.md，版本 ${version}`);
