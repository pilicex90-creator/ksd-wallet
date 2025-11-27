// build.cjs
// 增强版构建脚本：一次性构建并生成 Chrome、Edge、Firefox 三个 zip 包

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

function run(cmd) {
  console.log(`▶ ${cmd}`);
  execSync(cmd, { stdio: 'inherit' });
}

function zip(target) {
  const distDir = path.resolve(__dirname, 'dist');
  const zipFile = path.resolve(__dirname, `ksd-wallet-${target}.zip`);

  if (!fs.existsSync(distDir)) {
    throw new Error('❌ dist directory not found, build failed.');
  }

  run(`cd dist && tar -czf ../ksd-wallet-${target}.zip .`);
  console.log(`✅ Created ${zipFile}`);
}

function main() {
  const validTargets = ['chrome', 'edge', 'firefox'];
  const argTarget = process.argv[2];

  if (argTarget && !validTargets.includes(argTarget)) {
    console.error(`❌ Invalid target: ${argTarget}. Must be one of ${validTargets.join(', ')}`);
    process.exit(1);
  }

  // Step 1: 执行一次 vite build
  run('vite build');

  // Step 2: 根据参数或默认生成 zip
  if (argTarget) {
    zip(argTarget);
  } else {
    validTargets.forEach(zip);
  }
}

main();
