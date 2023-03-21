/* eslint-disable */
export default {
  displayName: 'frontend',
  preset: '../../jest.preset.js',
  globals: {},
  testEnvironment: 'node',
  setupFiles: ['<rootDir>/.jest/setEnvVars.ts'],
  transform: {
    '^.+\\.[tj]s$': [
      'ts-jest',
      {
        tsconfig: '<rootDir>/tsconfig.spec.json',
      },
    ],
  },
  moduleFileExtensions: ['ts', 'js', 'html'],
  coverageDirectory: '../../coverage/apps/frontend',
};
