param(
    [ValidateSet("major","minor","patch")]
    [string]$bumpType = "patch"
)

Write-Host "🚀 Starting release process with bump type: $bumpType"

git add .
try { git commit -m "Auto commit: prepare for release" } catch { Write-Host "ℹ️ No changes to commit" }

$packageJson = Get-Content package.json | Out-String | ConvertFrom-Json
$currentVersion = $packageJson.version
$parts = $currentVersion.Split(".")
$major = [int]$parts[0]; $minor = [int]$parts[1]; $patch = [int]$parts[2]

switch ($bumpType) {
    "major" { $major++; $minor = 0; $patch = 0 }
    "minor" { $minor++; $patch = 0 }
    "patch" { $patch++ }
}
$newVersion = "$major.$minor.$patch"

(Get-Content package.json -Raw) -replace '"version":\s*"\d+\.\d+\.\d+"', ('"version": "' + $newVersion + '"') | Set-Content package.json
if (Test-Path package-lock.json) {
    (Get-Content package-lock.json -Raw) -replace '"version":\s*"\d+\.\d+\.\d+"', ('"version": "' + $newVersion + '"') | Set-Content package-lock.json
}

git add package.json
if (Test-Path package-lock.json) { git add package-lock.json }
try { git commit -m "Version bumped to $newVersion" } catch { Write-Host "ℹ️ No changes to commit after bump" }

# 构建产物
node build.cjs
npm run check:zip

# 自动生成 CHANGELOG
Write-Host "📝 Generating CHANGELOG..."
node changelog.cjs v$newVersion
git add CHANGELOG.md
try { git commit -m "Update CHANGELOG for v$newVersion" } catch { Write-Host "ℹ️ No changes to commit in CHANGELOG" }

# 打 tag
$tag = "v$newVersion"
if (git tag -l $tag) {
    git tag -d $tag
    git push origin :refs/tags/$tag
    Write-Host "ℹ️ Old tag $tag deleted"
}
git tag $tag
git push origin main --tags

Write-Host "✅ Release process completed successfully. Version bumped to $newVersion ($bumpType). CHANGELOG updated. GitHub Actions will build and upload zip files."
