const { execSync } = require("child_process");
const fs = require("fs");
const path = require("path");

const pkgPath = path.join(process.cwd(), "package.json");
const pkg = JSON.parse(fs.readFileSync(pkgPath, "utf-8"));
const version = pkg.version;

try {
  execSync("git add .", { stdio: "inherit" });
  execSync(`git commit -m "release: v${version}"`, { stdio: "inherit" });
  execSync(`git tag v${version}`, { stdio: "inherit" });

  // 自动推送到远程仓库
  execSync("git push origin main", { stdio: "inherit" });
  execSync("git push origin --tags", { stdio: "inherit" });

  console.log(`✅ 已提交并推送到远程仓库，版本 v${version}`);
} catch (err) {
  console.error("❌ Git 提交或推送失败，请确认已初始化仓库并配置远程仓库");
  process.exit(1);
}
