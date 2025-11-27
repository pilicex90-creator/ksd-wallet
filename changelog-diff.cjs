// changelog-diff.cjs
// 自动生成 CHANGELOG 条目，比较上一个 tag 和当前 tag 的 commit 差异

const { execSync } = require('child_process');
const fs = require('fs');

function run(cmd) {
  return execSync(cmd, { stdio: 'pipe' }).toString().trim();
}

function main() {
  const version = process.argv[2];
  if (!version) {
    console.error('❌ Missing version argument (e.g. v1.0.12)');
    process.exit(1);
  }

  // 获取所有 tag，找到上一个 tag
  const tags = run('git tag --sort=-creatordate').split('\n').filter(Boolean);
  const currentIndex = tags.indexOf(version);
  const prevTag = currentIndex >= 0 && currentIndex < tags.length - 1 ? tags[currentIndex + 1] : null;

  let commits;
  if (prevTag) {
    commits = run(`git log ${prevTag}..${version} --pretty=format:"%s"`).split('\n');
    console.log(`🔍 Comparing commits between ${prevTag} and ${version}`);
  } else {
    commits = run(`git log -10 --pretty=format:"%s"`).split('\n');
    console.log(`⚠️ No previous tag found, using last 10 commits`);
  }

  const sections = { Features: [], Fixes: [], Docs: [], Chore: [], Other: [] };
  commits.forEach(msg => {
    if (/feat/i.test(msg)) sections.Features.push(`- ${msg}`);
    else if (/fix/i.test(msg)) sections.Fixes.push(`- ${msg}`);
    else if (/doc/i.test(msg)) sections.Docs.push(`- ${msg}`);
    else if (/chore/i.test(msg)) sections.Chore.push(`- ${msg}`);
    else sections.Other.push(`- ${msg}`);
  });

  let entry = `\n## ${version} - ${new Date().toISOString().split('T')[0]}\n`;
  for (const [section, items] of Object.entries(sections)) {
    if (items.length > 0) entry += `\n### ${section}\n${items.join('\n')}\n`;
  }

  fs.appendFileSync('CHANGELOG.md', entry);
  console.log(`✅ CHANGELOG updated for ${version}`);
}

main();
