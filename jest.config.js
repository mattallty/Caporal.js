module.exports = {
  preset: "ts-jest",
  testEnvironment: "node",
  setupFilesAfterEnv: ["./test-utils/jest-setup.ts"],
  coveragePathIgnorePatterns: ["/node_modules/", "/__fixtures__/", "/examples/"],
  globals: {
    "ts-jest": {
      diagnostics: {
        pathRegex: /\.(spec|test)\.{js,ts}$/,
      },
    },
  },
}
