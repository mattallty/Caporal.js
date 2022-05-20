module.exports = {
  preset: 'ts-jest',
  verbose: true,
  testEnvironment: 'node',
  setupFilesAfterEnv: ['./test-utils/jest-setup.ts'],
  coveragePathIgnorePatterns: ['/node_modules/', '/__fixtures__/', '/examples/'],
  globals: {
    'ts-jest': {
      diagnostics: {
        pathRegex: /\.(spec|test)\.{js,ts}$/,
      },
    },
  },
}
