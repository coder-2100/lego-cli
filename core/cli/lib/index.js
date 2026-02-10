"use strict";

module.exports = core;

const os = require("node:os");
const userHome = os.homedir(); // 获取用户主目录的路径
const pathExists = require("path-exists").sync; // 判断路径是否存在
const semver = require("semver");
const colors = require("colors/safe");
// 拓展：require能加载什么文件 -> .js/.json/.node
// .js -> 满足module.exports /exports 导出
// .json -> 默认使用JSON.parse解析
// .node -> C++模块
// any -> 其他任何格式文件均按.js处理
const pkg = require("../package.json");
const log = require("@coder-2100/log");
const constant = require("./const");
const path = require("node:path");
let args, config;

async function core() {
  try {
    checkPkgVersion();
    checkNodeVersion();
    checkRoot();
    checkUserHome();
    checkInputArgs();
    checkEnv();
    await checkGlobalUpdate();
  } catch (e) {
    log.error(e.message);
  }
}
// 7. 检查是否需要更新
async function checkGlobalUpdate() {
  // 1. 获取当前版本号和模块名
  const currentVersion = pkg.version;
  const npmName = pkg.name;
  // 2. 调用npm API，获取所有版本号（http://registry.npmjs.org/${packagename}）
  const { getNpmSemverVersion } = require("@coder-2100/get-npm-info");
  // 3. 提取所有版本号比对哪些版本号是大雨当前版本号
  const lastVersion = await getNpmSemverVersion(
    currentVersion,
    "vxe-table-middleware",
  );
  // 4. 是、获取最新的版本号，提醒用户更新到最新
  if (lastVersion && semver.gt(lastVersion, currentVersion)) {
    log.warn(
      colors.yellow(`请手动更新 ${npmName}，当前版本： ${currentVersion}，最新版本：${lastVersion}
      更新命令： npm install -g ${npmName}`),
    );
  }
}
// 6. 检查环境变量
function checkEnv() {
  const dotenv = require("dotenv");
  const dotenvPath = path.resolve(userHome, ".env");
  if (pathExists(dotenvPath)) {
    dotenv.config({ path: dotenvPath });
  }
  createDefaultConfig();
  log.verbose("环境变量", process.env.CLI_HOME_PATH);
}
function createDefaultConfig() {
  const cliConfig = {
    home: userHome,
  };
  if (process.env.CLI_HOME) {
    cliConfig["cliHome"] = path.join(userHome, process.env.CLI_HOME);
  } else {
    cliConfig["cliHome"] = path.join(userHome, constant.DEFAULT_CLI_HOME);
  }
  process.env.CLI_HOME_PATH = cliConfig.cliHome; // 存到环境变量中
  // return cliConfig;
}
// 5. 检查用户参数
function checkInputArgs() {
  const minimist = require("minimist");
  args = minimist(process.argv.slice(2));
  checkArgs();
}
function checkArgs() {
  if (args.debug) {
    process.env.LOG_LEVEL = "verbose"; // 改变级别，让debug生效
  } else {
    process.env.LOG_LEVEL = "info";
  }
  log.level = process.env.LOG_LEVEL; // 让环境变量在log工具中生效
}
// 4. 检查用户主目录
function checkUserHome() {
  if (!userHome || !pathExists(userHome)) {
    throw new Error(colors.red("当前登录用户主目录不存在！"));
  }
}
// 3. 检查root账户
function checkRoot() {
  // process.geteuid() 0：管理员
  const rootCheck = require("root-check"); // 降级
  rootCheck();
}
// 2. 检查版本号
function checkNodeVersion() {
  // 第一步，获取当前Node版本号
  const currentVersion = process.version;
  // 第二步，比对最低版本号
  const lowsetVersion = constant.LOWEST_NODE_VERSION;
  if (!semver.gte(currentVersion, lowsetVersion)) {
    throw new Error(
      colors.red(`lego-cli 需要安装 v${lowsetVersion}以上版本的Node.js`),
    );
  } else {
    log.success("Node版本正常");
  }
}
// 1. 检查版本号
function checkPkgVersion() {
  log.success(`当前版本：${pkg.version}`);
}
