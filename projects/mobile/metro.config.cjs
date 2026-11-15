const { getDefaultConfig } = require('expo/metro-config');
// Expo handles npm workspace watch folders and package exports automatically.
module.exports = getDefaultConfig(__dirname);
