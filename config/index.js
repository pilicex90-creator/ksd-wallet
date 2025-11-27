// config/index.js
import mainnet from "./networks-mainnet.json" assert { type: "json" };
import testnet from "./networks-testnet.json" assert { type: "json" };
import l1 from "./networks-l1.json" assert { type: "json" };
import l2 from "./networks-l2.json" assert { type: "json" };
import extra from "./networks-extra.json" assert { type: "json" };

// 合并所有网络配置
export const networks = [
  ...mainnet,
  ...testnet,
  ...l1,
  ...l2,
  ...extra
];

// 按类型分类导出，方便调用
export const networksByType = {
  mainnet,
  testnet,
  l1,
  l2,
  extra
};

// 工具函数：根据名称查找网络
export function getNetworkByName(name) {
  return networks.find(n => n.name.toLowerCase() === name.toLowerCase());
}

// 工具函数：根据 chainId 查找网络
export function getNetworkByChainId(chainId) {
  return networks.find(n => n.chainId === chainId);
}
