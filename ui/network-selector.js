// ui/network-selector.js
import { emit } from "../core/event-bus.js";

/**
 * 渲染网络选择器组件
 * @param {HTMLElement} container - 挂载的 DOM 容器
 */
export function renderNetworkSelector(container) {
  container.innerHTML = `
    <div class="network-selector">
      <h3>选择网络</h3>
      <input type="text" id="network-search" placeholder="搜索网络名称..." />
      <ul id="network-list" class="network-list"></ul>
      <div id="network-status" class="network-status">等待选择...</div>
    </div>
  `;

  const list = document.getElementById("network-list");
  const searchInput = document.getElementById("network-search");

  // 初始化网络列表
  const networks = getPopularNetworks();
  renderNetworkList(list, networks);

  // 搜索过滤
  searchInput.addEventListener("input", () => {
    const keyword = searchInput.value.toLowerCase();
    const filtered = networks.filter(n => n.name.toLowerCase().includes(keyword));
    renderNetworkList(list, filtered);
  });
}

/**
 * 渲染网络列表
 */
function renderNetworkList(list, networks) {
  list.innerHTML = "";
  networks.forEach(network => {
    const li = document.createElement("li");
    li.classList.add("network-item");
    li.textContent = `${network.name} (chainId: ${network.chainId})`;
    li.addEventListener("click", () => {
      document.getElementById("network-status").textContent = `已选择网络: ${network.name}`;
      emit("networkChanged", network);
    });
    list.appendChild(li);
  });

  if (list.innerHTML === "") {
    list.innerHTML = `<li>未找到匹配的网络</li>`;
  }
}

/**
 * 获取热门网络列表（静态配置，可扩展为动态加载）
 */
function getPopularNetworks() {
  return [
    { name: "Ethereum", chainId: 1, rpc: "https://mainnet.infura.io/v3/YOUR_KEY" },
    { name: "BNB Chain", chainId: 56, rpc: "https://bsc-dataseed.binance.org" },
    { name: "Solana", chainId: "solana", rpc: "https://api.mainnet-beta.solana.com" },
    { name: "Polygon", chainId: 137, rpc: "https://polygon-rpc.com" },
    { name: "Arbitrum One", chainId: 42161, rpc: "https://arb1.arbitrum.io/rpc" },
    { name: "Avalanche C", chainId: 43114, rpc: "https://api.avax.network/ext/bc/C/rpc" },
    { name: "TRON", chainId: "tron", rpc: "https://api.trongrid.io" },
    { name: "Base", chainId: 8453, rpc: "https://mainnet.base.org" },
    { name: "X Layer", chainId: "xlayer", rpc: "https://rpc.xlayer.org" }
  ];
}
