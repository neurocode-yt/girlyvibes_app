const { getDefaultConfig } = require("expo/metro-config");
const path = require("path");

const config = getDefaultConfig(__dirname);
const workspaceRoot = path.resolve(__dirname, "../..");

config.resolver.blockList = [
  /postal-mime_tmp/,
];

config.watchFolders = Array.from(new Set([...(config.watchFolders ?? []), workspaceRoot]));
config.resolver.nodeModulesPaths = [
  path.resolve(__dirname, "node_modules"),
  path.resolve(workspaceRoot, "node_modules"),
];

module.exports = config;
