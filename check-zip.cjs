const fs = require("fs");
const path = require("path");

function checkZipSize(filePath, maxSizeMB = 10) {
  if (!fs.existsSync(filePath)) {
    console.error(`❌ 未找到 zip 文件: ${filePath}`);
    process.exit(1);
  }

  const stats = fs.statSync(filePath);
  const sizeMB = stats.size / (1024 * 1024);

  if (sizeMB > maxSizeMB) {
    console.error(`❌ ${path.basename(filePath)} 大小为 ${sizeMB.toFixed(2)} MB，超过限制 ${maxSizeMB} MB`);
    process.exit(1);
  } else {
    console.log(`✅ ${path.basename(filePath)} 大小为 ${sizeMB.toFixed(2)} MB，符合要求`);
  }
}

// 校验三个 zip 包
["ksd-wallet-chrome.zip", "ksd-wallet-edge.zip", "ksd-wallet-firefox.zip"].forEach(file => {
  const filePath = path.join(process.cwd(), file);
  checkZipSize(filePath);
});
