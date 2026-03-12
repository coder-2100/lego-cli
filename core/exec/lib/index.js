"use strict";
import Package from "@coder-2100/package";
import { require } from "@coder-2100/utils";
import path from "path";

const SETTINGS = {
  init: "@coder-2100/init",
};
const CATCH_DIR = "dependencies";

async function exec() {
  let targetPath = process.env.CLI_TARGET_PATH;
  let storeDir = "";
  let pkg;
  const homePath = process.env.CLI_HOME_PATH;
  const cmdObj = arguments[arguments.length - 1]; // 获取command总体对象
  const cmdName = cmdObj.name(); // 获取命令名称
  const packageName = SETTINGS[cmdName]; // 获取package名称
  const packageVersion = "latest";

  if (!targetPath) {
    // 生成缓存路径
    targetPath = path.resolve(homePath, CATCH_DIR);
    storeDir = path.resolve(targetPath, "node_modules");
    pkg = new Package({
      targetPath,
      storeDir,
      packageName,
      packageVersion,
    });
    if (await pkg.exists()) {
      // 已经存在，则更新package
      await pkg.update();
    } else {
      // 否则则安装
      await pkg.install();
    }
  } else {
    pkg = new Package({
      targetPath,
      packageName,
      packageVersion,
    });
  }
  const rootFile = pkg.getRootFilePath();
  import(rootFile).then((init) => {
    init?.default?.apply(null, arguments);
  });
  console.log("exec ========");
}

export default exec;
