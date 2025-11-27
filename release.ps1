param(
    [ValidateSet("major","minor","patch")]
    [string]$bumpType = "patch"
)

Write-Host "🚀 Starting release process with bump type: $bumpType"

# Step 1: 提交所有改动
git add .
try {
    git commit -m "Auto commit: prepare for release"
} catch {
    Write-Host "ℹ️ No changes to commit"
}

# Step 2: 读取当前版本号
$packageJson = Get-Content package.json | Out-String | ConvertFrom-Json
$currentVersion = $packageJson.version
$parts = $currentVersion.Split(".")
$major = [int]$parts[0]
$minor = [int]$parts[1]
$patch = [int]$parts[2]

# Step 3: 根据 bumpType 计算新版本号
switch ($bumpType) {
    "major" { $major++; $minor = 0; $patch = 0 }
    "minor" { $minor++; $patch = 0 }
    "patch" { $patch++ }
}
$newVersion = "$major.$minor.$patch"

# Step 4: 更新 package.json 和 package-lock.json
(Get-Content package.json -Raw) -replace '"version":\s*"\d+\.\d+\.\d+"', ('"version": "' + $newVersion + '"') | Set-Content package.json
if (Test-Path package-lock.json) {
    (Get-Content package-lock.json -Raw) -replace '"version":\s*"\d+\.\d+\.\d+"', ('"version": "' + $newVersion + '"') | Set-Content package-lock.json
}

# Step 5: 提交版本号更新
git add package.json
if (Test-Path package-lock.json) { git add package-lock.json }
try {
    git commit -m "Version bumped to $newVersion"
} catch {
    Write-Host "ℹ️ No changes to commit after bump"
}

# Step 6: 构建三个 zip 包（一次性）
node build.cjs   # 增强版 build.cjs 会一次性生成 chrome/edge/firefox zip

# Step 7: 校验 zip 包完整性
npm run check:zip

# Step 8: 删除旧 tag（如果存在）
$tag = "v$newVersion"
if (git tag -l $tag) {
    git tag -d $tag
    git push origin :refs/tags/$tag
    Write-Host "ℹ️ Old tag $tag deleted"
}

# Step 9: 打新 tag
git tag $tag

# Step 10: 推送代码和 tag 到远程
git push origin main --tags

Write-Host "✅ Release process completed successfully. Version bumped to $newVersion ($bumpType). GitHub Actions will build and upload zip files."
