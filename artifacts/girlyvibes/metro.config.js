const { getDefaultConfig } = require("expo/metro-config");

const config = getDefaultConfig(__dirname);

config.resolver.blockList = [
  /postal-mime_tmp/,
];

module.exports = config;
