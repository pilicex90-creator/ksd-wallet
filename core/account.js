// core/account.js
import fs from "fs";
import path from "path";
import { ethers } from "ethers";
import config from "../config/config.json" assert { type: "json" };
import { emit } from "./event-bus.js";
import { log } from "./logger.js";

const keystoreDir = "./keystore";

// 确保 keystore 目录存在
if (!fs.existsSync(keystoreDir)) {
  fs.mkdirSync(keystoreDir, { recursive: true });
}

/**
 * 创建新账户
 * @param {string} password - 用于加密私钥的密码
 * @returns {object} - 新账户对象 { address, signer }
 */
export async function createAccount(password) {
  const wallet = ethers.Wallet.createRandom();
  const keystore = await wallet.encrypt(password);

  const filePath = path.join(keystoreDir, `${wallet.address}.json`);
  fs.writeFileSync(filePath, keystore, "utf8");

  log("info", `New account created: ${wallet.address}`);
  emit("accountCreated", { address: wallet.address });

  return { address: wallet.address, signer: wallet };
}

/**
 * 从私钥导入账户
 * @param {string} privateKey - 私钥字符串
 * @param {string} password - 用于加密的密码
 * @returns {object} - 导入的账户对象
 */
export async function importAccount(privateKey, password) {
  const wallet = new ethers.Wallet(privateKey);
  const keystore = await wallet.encrypt(password);

  const filePath = path.join(keystoreDir, `${wallet.address}.json`);
  fs.writeFileSync(filePath, keystore, "utf8");

  log("info", `Account imported: ${wallet.address}`);
  emit("accountImported", { address: wallet.address });

  return { address: wallet.address, signer: wallet };
}

/**
 * 从 keystore 文件解锁账户
 * @param {string} address - 账户地址
 * @param {string} password - 解锁密码
 * @returns {object} - 解锁的账户对象
 */
export async function unlockAccount(address, password) {
  const filePath = path.join(keystoreDir, `${address}.json`);
  if (!fs.existsSync(filePath)) {
    throw new Error(`Keystore file not found for address: ${address}`);
  }

  const keystore = fs.readFileSync(filePath, "utf8");
  const wallet = await ethers.Wallet.fromEncryptedJson(keystore, password);

  log("info", `Account unlocked: ${wallet.address}`);
  emit("accountUnlocked", { address: wallet.address });

  return { address: wallet.address, signer: wallet };
}

/**
 * 导出账户的 keystore 文件路径
 * @param {string} address - 账户地址
 * @returns {string} - keystore 文件路径
 */
export function exportAccount(address) {
  const filePath = path.join(keystoreDir, `${address}.json`);
  if (!fs.existsSync(filePath)) {
    throw new Error(`Keystore file not found for address: ${address}`);
  }

  log("info", `Account keystore exported: ${filePath}`);
  return filePath;
}

/**
 * 删除账户
 * @param {string} address - 账户地址
 */
export function deleteAccount(address) {
  const filePath = path.join(keystoreDir, `${address}.json`);
  if (fs.existsSync(filePath)) {
    fs.unlinkSync(filePath);
    log("warn", `Account deleted: ${address}`);
    emit("accountDeleted", { address });
  } else {
    log("error", `No keystore found for address: ${address}`);
  }
}
