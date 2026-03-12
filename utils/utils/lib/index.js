"use strict";
import { createRequire } from "module";

const require = createRequire(import.meta.url);

function isObject(o) {
  return Object.prototype.toString.call(o) === "[object Object]";
}

export { require, isObject };
