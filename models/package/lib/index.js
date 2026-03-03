"use strict";

import { isObject } from "@coder-2100/utils";

class Package {
  constructor(options) {
    if (!options) {
      throw new Error("Package类的options参数不能为空！");
    }
    if (!isObject(options)) {
      throw new Error("Package类的options参数必须是一个对象！");
    }
    // package的路径
    this.targetPath = options.targetPath;
    // package的存储路径
    this.storePath = options.storePath;
    // package的名称
    this.packageName = options.packageName;
    // package的版本
    this.packageVersion = options.packageVersion;
  }

  // 检查Package是否存在
  exists() {}
  // 安装Package
  install() {}
  // 更新Package
  update() {}
  // 获取Package入口文件路径
  getRootFilePath() {}
}

export default Package;
