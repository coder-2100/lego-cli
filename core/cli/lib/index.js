"use strict";
import { createRequire } from "module";
import os from "node:os";
import path from "node:path";
import { readFileSync } from "fs";
import { pathExists } from "path-exists"; // 判断路径是否存在
import dotenv from "dotenv";
import { LOWEST_NODE_VERSION, DEFAULT_CLI_HOME } from "./const.js";
import log from "@coder-2100/log";
import rootCheck from "root-check";
import { Command } from "commander";
import { getNpmSemverVersion } from "@coder-2100/get-npm-info";
import init from "@coder-2100/init";
import exec from "@coder-2100/exec";

const require = createRequire(import.meta.url);
const semver = require("semver");
const colors = require("colors/safe");
const pkg = JSON.parse(
  readFileSync(new URL("../package.json", import.meta.url)),
);
// 拓展：require能加载什么文件 -> .js/.json/.node
// .js -> 满足module.exports /exports 导出
// .json -> 默认使用JSON.parse解析
// .node -> C++模块
// any -> 其他任何格式文件均按.js处理

const userHome = os.homedir(); // 获取用户主目录的路径
let args, config;

const program = new Command();

async function core() {
  try {
    await prepare();
    registerCommand();
  } catch (e) {
    log.error(e.message);
  }
}
// 前置过程
async function prepare() {
  checkPkgVersion();
  checkNodeVersion();
  checkRoot();
  await checkUserHome();
  // checkInputArgs();
  await checkEnv();
  await checkGlobalUpdate();
}
// 命令注册
function registerCommand() {
  program
    .name(Object.keys(pkg.bin)[0]) // 获取命令名称
    .usage("<command> [options]")
    .version(pkg.version)
    .option("-d, --debug", "是否开启调试模式", false)
    .option("-p, --targetPath <targetPath>", "是否指定本地调试文件路径", "");

  program
    .command("init [projectName]")
    .description("初始化项目")
    .option("-f, --force", "是否强制初始化项目")
    .action(exec);

  // 开启debug模式
  program.on("option:debug", () => {
    if (program.opts().debug) {
      process.env.LOG_LEVEL = "verbose"; // 改变级别，让debug生效
    } else {
      process.env.LOG_LEVEL = "info";
    }
    log.level = process.env.LOG_LEVEL; // 让环境变量在log工具中生效
  });

  // 监听targetPath参数，设置环境变量
  program.on("option:targetPath", () => {
    process.env.CLI_TARGET_PATH = program.opts().targetPath;
  });
  // 监听未知命令
  program.on("command:*", (obj) => {
    const availableCommands = program.commands.map((cmd) => cmd.name());
    log.error(colors.red(`未知的命令：${obj[0]}`));
    if (availableCommands.length > 0) {
      log.info(colors.green(`可用的命令：${availableCommands.join(", ")}`));
    }
  });

  program.parse(process.argv);

  if (program.args && program.args.length < 1) {
    program.outputHelp();
    console.log(); // 多一个空行，优化显示效果
  }
}

// 7. 检查是否需要更新
async function checkGlobalUpdate() {
  // 1. 获取当前版本号和模块名
  const currentVersion = pkg.version;
  const npmName = pkg.name;
  // 2. 调用npm API，获取所有版本号（http://registry.npmjs.org/${packagename}）
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
async function checkEnv() {
  const dotenvPath = path.resolve(userHome, ".env");
  const isExist = await pathExists(dotenvPath);
  if (isExist) {
    dotenv.config({ path: dotenvPath });
  }
  createDefaultConfig();
}
function createDefaultConfig() {
  const cliConfig = {
    home: userHome,
  };
  if (process.env.CLI_HOME) {
    cliConfig["cliHome"] = path.join(userHome, process.env.CLI_HOME);
  } else {
    cliConfig["cliHome"] = path.join(userHome, DEFAULT_CLI_HOME);
  }
  process.env.CLI_HOME_PATH = cliConfig.cliHome; // 存到环境变量中
  // return cliConfig;
}
// 5. 检查用户参数 --- 通过commander工具实现代替
// function checkInputArgs() {
//   const minimist = require("minimist");
//   args = minimist(process.argv.slice(2));
//   checkArgs();
// }
// function checkArgs() {
//   if (args.debug) {
//     process.env.LOG_LEVEL = "verbose"; // 改变级别，让debug生效
//   } else {
//     process.env.LOG_LEVEL = "info";
//   }
//   log.level = process.env.LOG_LEVEL; // 让环境变量在log工具中生效
// }
// 4. 检查用户主目录
async function checkUserHome() {
  const isExist = await pathExists(userHome);
  if (!userHome || !isExist) {
    throw new Error(colors.red("当前登录用户主目录不存在！"));
  }
}
// 3. 检查root账户
function checkRoot() {
  // process.geteuid() 0：管理员
  rootCheck(); // 降级
}
// 2. 检查版本号
function checkNodeVersion() {
  // 第一步，获取当前Node版本号
  const currentVersion = process.version;
  // 第二步，比对最低版本号
  const lowsetVersion = LOWEST_NODE_VERSION;
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

export { core };
