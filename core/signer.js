import { getState } from "./state.js";
import { log, LOG_LEVELS } from "./logger.js";

/**
 * 获取当前签名器（私钥或 provider signer）
 */
export function getSigner() {
  const account = getState().account;
  if (!account || !account.privateKey) {
    log(LOG_LEVELS.ERROR, "No active account or private key found", "SIGNER");
    throw new Error("未连接钱包或缺少私钥");
  }
  return account.privateKey; // 可替换为 provider.getSigner() 或其他签名器
}

/**
 * 对交易对象进行签名（支持 EIP-712 或 raw tx）
 * @param {Object} tx - 交易对象
 * @returns {string} 签名字符串
 */
export async function signTransaction(tx) {
  const signer = getSigner();
  try {
    // 示例：使用 ethers.js 的 Wallet 签名
    const { Wallet } = await import("ethers");
    const wallet = new Wallet(signer);
    const signedTx = await wallet.signTransaction(tx);
    log(LOG_LEVELS.INFO, "Transaction signed", "SIGNER");
    return signedTx;
  } catch (err) {
    log(LOG_LEVELS.ERROR, `Failed to sign transaction: ${err.message}`, "SIGNER");
    throw err;
  }
}

/**
 * 对消息进行签名（用于 DApp 授权、登录等）
 * @param {string} message - 原始消息
 * @returns {string} 签名字符串
 */
export async function signMessage(message) {
  const signer = getSigner();
  try {
    const { Wallet } = await import("ethers");
    const wallet = new Wallet(signer);
    const signature = await wallet.signMessage(message);
    log(LOG_LEVELS.INFO, "Message signed", "SIGNER");
    return signature;
  } catch (err) {
    log(LOG_LEVELS.ERROR, `Failed to sign message: ${err.message}`, "SIGNER");
    throw err;
  }
}

/**
 * 验证签名是否由指定地址生成
 * @param {string} message - 原始消息
 * @param {string} signature - 签名字符串
 * @param {string} expectedAddress - 预期地址
 * @returns {boolean}
 */
export async function verifySignature(message, signature, expectedAddress) {
  try {
    const { verifyMessage } = await import("ethers");
    const recovered = verifyMessage(message, signature);
    const match = recovered.toLowerCase() === expectedAddress.toLowerCase();
    log(LOG_LEVELS.INFO, `Signature verification: ${match}`, "SIGNER");
    return match;
  } catch (err) {
    log(LOG_LEVELS.ERROR, `Failed to verify signature: ${err.message}`, "SIGNER");
    return false;
  }
}
