/** @type {import('jest').Config} */
module.exports = {
  preset: 'jest-expo',
  setupFiles: ['./jest.setup.js'],
  testMatch: ['<rootDir>/__tests__/**/*.test.ts?(x)'],
  moduleNameMapper: { '^@/(.*)$': '<rootDir>/src/$1' },
  transformIgnorePatterns: [
    'node_modules/(?!((jest-)?react-native|@react-native(-community)?)|expo(nent)?|@expo(nent)?/.*|@expo-google-fonts/.*|react-navigation|@react-navigation/.*|@sentry/react-native|native-base|react-native-svg|@dreamsprout/.*|zustand|@tanstack/.*)',
  ],
  collectCoverageFrom: ['src/features/**/*.ts', 'src/store/**/*.ts', 'src/lib/**/*.ts', 'src/i18n/**/*.ts', 'src/components/**/*.tsx', '!src/**/*.generated.ts'],
  coverageReporters: ['text-summary', 'lcov'],
};
