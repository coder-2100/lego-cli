"use strict";

module.exports = core;

// 拓展：require能加载什么文件 -> .js/.json/.node
// .js -> 满足module.exports /exports 导出
// .json -> 默认使用JSON.parse解析
// .node -> C++模块
// any -> 其他任何格式文件均按.js处理
const pkg = require("../package.json");
const log = require("@coder-2100/log");

function core() {
  checkPkgVersion();
}

function checkPkgVersion() {
  log.success(`当前版本：${pkg.version}`);
}
