// core/tx-engine.js
import { getCurrentNetwork, getCurrentAccount } from "./state.js";
import { emit } from "./event-bus.js";
import { log } from "./logger.js";
import { ethers } from "ethers"; // 以太坊兼容链使用 ethers.js

/**
 * 构建交易对象
 * @param {object} txData - 交易数据 { to, value, data, gasLimit, gasPrice }
 * @returns {object} - 构建好的交易对象
 */
export function buildTransaction(txData) {
  const account = getCurrentAccount();
  const network = getCurrentNetwork();

  if (!account) {
    throw new Error("No active account");
  }
  if (!network || !network.rpc) {
    throw new Error("No active network or RPC not set");
  }

  const tx = {
    from: account.address,
    to: txData.to,
    value: ethers.utils.parseEther(txData.value.toString()),
    data: txData.data || "0x",
    gasLimit: txData.gasLimit || 21000,
    gasPrice: txData.gasPrice ? ethers.utils.parseUnits(txData.gasPrice.toString(), "gwei") : undefined,
    chainId: network.chainId
  };

  log("info", `Transaction built: ${JSON.stringify(tx)}`);
  return tx;
}

/**
 * 签名交易
 * @param {object} tx - 构建好的交易对象
 * @returns {string} - 签名后的原始交易
 */
export async function signTransaction(tx) {
  const account = getCurrentAccount();
  if (!account || !account.signer) {
    throw new Error("No signer available for current account");
  }

  const signedTx = await account.signer.signTransaction(tx);
  log("info", `Transaction signed for account: ${account.address}`);
  return signedTx;
}

/**
 * 广播交易
 * @param {string} signedTx - 签名后的原始交易
 * @returns {string} - 交易哈希
 */
export async function broadcastTransaction(signedTx) {
  const network = getCurrentNetwork();
  const provider = new ethers.providers.JsonRpcProvider(network.rpc);

  const txResponse = await provider.sendTransaction(signedTx);
  log("info", `Transaction broadcasted: ${txResponse.hash}`);

  emit("transactionSent", txResponse);
  return txResponse.hash;
}

/**
 * 完整交易流程：构建 -> 签名 -> 广播
 * @param {object} txData - 交易数据
 * @returns {string} - 交易哈希
 */
export async function sendTransaction(txData) {
  try {
    const tx = buildTransaction(txData);
    const signedTx = await signTransaction(tx);
    const txHash = await broadcastTransaction(signedTx);

    emit("transactionConfirmed", { hash: txHash });
    return txHash;
  } catch (err) {
    log("error", `Transaction failed: ${err.message}`);
    emit("transactionFailed", err);
    throw err;
  }
}
