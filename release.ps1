# release.ps1
# 一键发布脚本：检查 → 提交 → bump → 推送 → 触发 GitHub Actions

# Step 1: 检查工作区状态
git status

# Step 2: 添加所有改动并提交
git add .
git commit -m "自动提交：准备发布新版本"

# Step 3: 升级版本号 (patch = 小版本号 +1)
npm version patch

# Step 4: 推送代码和 tag 到远程
git push origin main --tags

Write-Host "Release process completed successfully. GitHub Actions will build and upload zip files."
