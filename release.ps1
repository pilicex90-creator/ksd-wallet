# release.ps1
# 改进版一键发布脚本：检查 → 提交 → bump → 打 tag → 推送 → 触发 GitHub Actions

# Step 1: 检查工作区状态
git status

# Step 2: 添加所有改动并提交
git add .
git commit -m "Auto commit: prepare for new release"

# Step 3: 读取当前版本号并 +1 (patch)
$packageJson = Get-Content package.json | Out-String | ConvertFrom-Json
$currentVersion = $packageJson.version
$parts = $currentVersion.Split(".")
$major = [int]$parts[0]
$minor = [int]$parts[1]
$patch = [int]$parts[2] + 1
$newVersion = "$major.$minor.$patch"

# 更新 package.json 和 package-lock.json
(Get-Content package.json -Raw) -replace '"version":\s*".*?"', '"version": "' + $newVersion + '"' | Set-Content package.json
(Get-Content package-lock.json -Raw) -replace '"version":\s*".*?"', '"version": "' + $newVersion + '"' | Set-Content package-lock.json

# 提交版本号更新
git add package.json package-lock.json
git commit -m "Version bumped to $newVersion"

# Step 4: 打 tag
$tag = "v$newVersion"
git tag $tag

# Step 5: 推送代码和 tag 到远程
git push origin main --tags

Write-Host "Release process completed successfully. Version bumped to $newVersion and GitHub Actions will build and upload zip files."
