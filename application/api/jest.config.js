module.exports = {
  // Stop running tests after `n` failures
  // bail: 3,
  // Indicates whether the coverage information should be collected while executing the test
  collectCoverage: true,
  // The directory where Jest should output its coverage files
  coverageDirectory: "coverage",
  // An array of regexp pattern strings used to skip coverage collection
  coveragePathIgnorePatterns: ["/node_modules/"],
  // A list of reporter names that Jest uses when writing coverage reports
  coverageReporters: [
    "json",
    //   "text",
    //   "lcov",
    //   "clover"
  ],
  reporters: [
    "default",
    [
      "jest-html-reporter",
      {
        outputPath: "./test-report/report.html",
        includeConsoleLog: true,
        includeFailureMsg: true,
      },
    ],
  ],
  // Make calling deprecated APIs throw helpful error messages
  errorOnDeprecated: true,
  // Activates notifications for test results
  notify: true,
  verbose: true,
  // The test environment that will be used for testing
  testEnvironment: "node",
  testTimeout: 6000,
  maxConcurrency: 1,
};
