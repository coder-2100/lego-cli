"use strict";

const log = require("npmlog");
// 对log进行定制
log.level = process.env.LOG_LEVEL ? process.env.LOG_LEVEL : "info";
log.heading = "coder-2100"; // 修改前缀
log.headingStyle = { fg: "green", bg: "black" }; // 修改样式
log.addLevel("success", 2000, { fg: "red", bg: "black" }); // 添加自定义的命令

module.exports = log;
