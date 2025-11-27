// 点击扩展图标时打开或激活 wallet.html 页面
chrome.action.onClicked.addListener(async () => {
  const url = chrome.runtime.getURL("wallet.html");

  try {
    // 查询是否已有该页面标签
    const tabs = await chrome.tabs.query({ url });

    if (tabs.length > 0) {
      // 如果已有 → 激活它
      chrome.tabs.update(tabs[0].id, { active: true });
    } else {
      // 如果没有 → 新建一个标签页
      chrome.tabs.create({ url });
    }
  } catch (err) {
    console.error("KSD Wallet 页面打开失败:", err);
    // 兜底：直接新建一个标签页
    chrome.tabs.create({ url });
  }
});

// 扩展安装时初始化
chrome.runtime.onInstalled.addListener(() => {
  console.log("✅ KSD Wallet 扩展已安装");
});
