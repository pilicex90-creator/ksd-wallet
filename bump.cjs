// bump.cjs
// 安全版本号升级脚本：只修改 package.json 和 package-lock.json，不做 git 操作

const fs = require('fs');

function bumpVersion(file, newVersion) {
  const json = JSON.parse(fs.readFileSync(file, 'utf8'));
  json.version = newVersion;
  fs.writeFileSync(file, JSON.stringify(json, null, 2) + '\n');
  console.log(`✅ Updated ${file} to version ${newVersion}`);
}

function main() {
  const pkg = JSON.parse(fs.readFileSync('package.json', 'utf8'));
  const [major, minor, patch] = pkg.version.split('.').map(Number);
  const newVersion = `${major}.${minor}.${patch + 1}`;

  bumpVersion('package.json', newVersion);
  if (fs.existsSync('package-lock.json')) {
    bumpVersion('package-lock.json', newVersion);
  }

  console.log(`📦 Version bumped to ${newVersion}`);
}

main();
