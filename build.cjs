// build.cjs
// 最终闭合版：一次性构建并生成 Chrome、Edge、Firefox 三个 zip 包
// 使用 npx 或直接调用 node_modules/.bin/vite，保证跨平台兼容

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

function run(cmd) {
  console.log(`▶ ${cmd}`);
  execSync(cmd, { stdio: 'inherit', shell: true });
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

  // Step 1: 执行 vite build，优先用 npx，失败时 fallback 到 node_modules/.bin/vite
  try {
    run('npx vite build');
  } catch (err) {
    const vitePath = path.resolve(__dirname, 'node_modules/.bin/vite');
    console.log('⚠️ npx vite build failed, fallback to local vite path');
    run(`"${vitePath}" build`);
  }

  // Step 2: 根据参数或默认生成 zip
  if (argTarget) {
    zip(argTarget);
  } else {
    validTargets.forEach(zip);
  }
}

main();
