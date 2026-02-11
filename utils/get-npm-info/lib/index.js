"use strict";
import { createRequire } from "module";
import axios from "axios";
import urlJoin from "url-join";

const require = createRequire(import.meta.url);
const semver = require("semver");

function getNpmInfo(npmName, registry) {
  if (!npmName) return;
  const registryUrl = registry || getDefaultRegistry();
  const npmInfoUrl = urlJoin(registryUrl, npmName);
  return axios
    .get(npmInfoUrl)
    .then((response) => {
      if (response.status === 200) {
        return response.data;
      }
      return null;
    })
    .catch((err) => {
      return Promise.reject(err);
    });
}

function getDefaultRegistry(isOriginal = false) {
  return isOriginal
    ? "https://registry.npmjs.org"
    : "https://registry.npmmirror.com";
}

async function getNpmVersions(npmName, registry) {
  const data = await getNpmInfo(npmName, registry);
  if (data) {
    return Object.keys(data.versions);
  } else {
    return [];
  }
}

function getNpmSemverVersions(baseVersion, versions) {
  return (versions = versions
    .filter((version) => semver.satisfies(version, `^${baseVersion}`))
    .sort((a, b) => semver.gt(b, a)));
}

async function getNpmSemverVersion(baseVersion, npmName, registry) {
  const versions = await getNpmVersions(npmName, registry);
  const npmVersions = getNpmSemverVersions(baseVersion, versions);
  if (npmVersions && npmVersions.length > 0) {
    return npmVersions[0];
  }
}

export { getNpmInfo, getNpmVersions, getNpmSemverVersion };
