module.exports = {
  preset: 'jest-expo',
  testMatch: ['<rootDir>/ui-test/**/*.test.tsx'],
  transformIgnorePatterns: ['node_modules/(?!((jest-)?react-native|@react-native(-community)?|expo[^/]*|@expo(nent)?/.*|react-native-paper|@callstack/.*|@open-mountain/.*)/)'],
};
