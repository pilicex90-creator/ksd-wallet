(function() {
  if (window.ksdWallet) {
    console.warn("KSD Wallet already injected");
    return;
  }

  console.log("KSD Wallet injected on", location.href);

  // 在网页环境挂载全局对象（只读保护）
  Object.defineProperty(window, "ksdWallet", {
    value: {
      connect: () => {
        window.postMessage({ type: "KSD_CONNECT" }, "*");
      },
      getAccount: () => {
        window.postMessage({ type: "KSD_GET_ACCOUNT" }, "*");
      }
    },
    writable: false
  });

  // 在页面上插入一个可见提示（调试用）
  const banner = document.createElement("div");
  banner.textContent = "✅ KSD Wallet 已注入";
  banner.style.position = "fixed";
  banner.style.bottom = "10px";
  banner.style.right = "10px";
  banner.style.background = "#0078d7";
  banner.style.color = "#fff";
  banner.style.padding = "6px 12px";
  banner.style.borderRadius = "6px";
  banner.style.fontSize = "12px";
  banner.style.zIndex = "999999";
  document.body.appendChild(banner);

  // 监听扩展返回的消息
  window.addEventListener("message", (event) => {
    if (event.source !== window) return;

    if (event.data && event.data.type === "KSD_ACCOUNT") {
      console.log("账户信息:", event.data.account);

      // 更新提示内容
      banner.textContent = `✅ KSD Wallet 已注入 | 账户: ${event.data.account.address}`;
    }
  });
})();
