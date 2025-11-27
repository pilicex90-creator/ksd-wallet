const fs = require("fs");
const path = require("path");

function validateManifest(filePath) {
  if (!fs.existsSync(filePath)) {
    console.error(`❌ 未找到 manifest.json: ${filePath}`);
    process.exit(1);
  }

  const manifest = JSON.parse(fs.readFileSync(filePath, "utf-8"));
  const requiredFields = ["name", "version", "background", "action"];

  let valid = true;
  for (const field of requiredFields) {
    if (!manifest[field]) {
      console.error(`❌ 缺少字段: ${field}`);
      valid = false;
    }
  }

  if (valid) {
    console.log("✅ manifest.json 校验通过，所有必需字段存在");
  } else {
    process.exit(1);
  }
}

const manifestPath = path.join(process.cwd(), "dist", "manifest.json");
validateManifest(manifestPath);
