#! /usr/bin/env node
import { createRequire } from "module";
import importLocal from "import-local";
import { core } from "../lib/index.js";

const require = createRequire(import.meta.url);
const log = require("npmlog");

if (importLocal(import.meta.url)) {
  log.info("cli", "正在使用lego-cli本地版本");
} else {
  core(process.argv.slice(2));
}
