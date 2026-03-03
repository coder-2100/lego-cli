"use strict";
import Package from "@coder-2100/package";
const SETTINGS = {
  init: "@coder-2100/init",
};
function exec() {
  const targetPath = process.env.CLI_TARGET_PATH;
  const homePath = process.env.CLI_HOME_PATH;
  console.log(arguments);
  const cmdObj = arguments[arguments.length - 1]; // 获取command总体对象
  const cmdName = cmdObj.name(); // 获取命令名称
  const packageName = SETTINGS[cmdName]; // 获取package名称
  const pkg = new Package({
    targetPath,
    storePath: "",
    packageName,
    packageVersion: "latest",
  });
  console.log(pkg);
  console.log("exec ========");
}

export default exec;
