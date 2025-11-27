const fs = require("fs");
const path = require("path");

// 读取并更新 JSON 文件版本号
function bumpVersion(filePath) {
  if (!fs.existsSync(filePath)) {
    console.warn(`⚠️ 文件不存在: ${filePath}`);
    return null;
  }

  const data = JSON.parse(fs.readFileSync(filePath, "utf-8"));
  if (!data.version) {
    console.warn(`⚠️ 文件缺少 version 字段: ${filePath}`);
    return null;
  }

  const parts = data.version.split(".").map(Number);
  parts[2] += 1; // patch 递增
  const newVersion = parts.join(".");

  data.version = newVersion;
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
  console.log(`✅ 已更新 ${filePath} → ${newVersion}`);

  return newVersion;
}

// 更新 package.json
const pkgPath = path.join(process.cwd(), "package.json");
const newVersion = bumpVersion(pkgPath);

// 更新 dist/manifest.json
if (newVersion) {
  const manifestPath = path.join(process.cwd(), "dist", "manifest.json");
  if (fs.existsSync(manifestPath)) {
    const manifest = JSON.parse(fs.readFileSync(manifestPath, "utf-8"));
    manifest.version = newVersion;
    fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2));
    console.log(`✅ 已同步 dist/manifest.json → ${newVersion}`);
  } else {
    console.warn("⚠️ dist/manifest.json 不存在，跳过同步");
  }
}
