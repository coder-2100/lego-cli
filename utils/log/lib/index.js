"use strict";
import { createRequire } from "module";
const require = createRequire(import.meta.url);
const log = require("npmlog");
// 对log进行定制
log.level = process.env.LOG_LEVEL ? process.env.LOG_LEVEL : "info"; // 判断控制debugger模式
log.heading = "coder-2100"; // 修改前缀
log.headingStyle = { fg: "green", bg: "black" }; // 修改样式
log.addLevel("success", 2000, { fg: "red", bg: "black" }); // 添加自定义的命令

export default log;
