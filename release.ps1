# release.ps1
# 完整发布流程：提交 → bump → 校验 → 删除旧 tag → 打新 tag → 推送 → 触发 GitHub Actions

# Step 1: 提交所有改动
git add .
git commit -m "Auto commit: prepare for release"

# Step 2: 自动 bump patch 版本号
$packageJson = Get-Content package.json | Out-String | ConvertFrom-Json
$currentVersion = $packageJson.version
$parts = $currentVersion.Split(".")
$major = [int]$parts[0]
$minor = [int]$parts[1]
$patch = [int]$parts[2] + 1
$newVersion = "$major.$minor.$patch"

# Step 3: 更新 package.json 和 package-lock.json 中的版本号
(Get-Content package.json -Raw) -replace '"version":\s*"\d+\.\d+\.\d+"', ('"version": "' + $newVersion + '"') | Set-Content package.json
(Get-Content package-lock.json -Raw) -replace '"version":\s*"\d+\.\d+\.\d+"', ('"version": "' + $newVersion + '"') | Set-Content package-lock.json

# Step 4: 提交版本号更新
git add package.json package-lock.json
git commit -m "Version bumped to $newVersion"

# Step 5: 校验 zip 包完整性
npm run check:zip

# Step 6: 删除旧 tag（如果存在）
$tag = "v$newVersion"
if (git tag -l $tag) {
    git tag -d $tag
    git push origin :refs/tags/$tag
}

# Step 7: 打新 tag
git tag $tag

# Step 8: 推送代码和 tag 到远程
git push origin main --tags

Write-Host "Release process completed successfully. Version bumped to $newVersion and GitHub Actions will build and upload zip files."
