const dotenv = require("dotenv");
dotenv.config({
  path: ".env.development",
});

const nextJest = require("next/jest");
const createJestConfig = nextJest({
  dir: ".",
});

const TIMEOUT_IN_MILLISECONDS = 60_000;
const jestConfig = createJestConfig({
  moduleDirectories: ["node_modules", "<rootDir>"],
  testTimeout: TIMEOUT_IN_MILLISECONDS,
});

module.exports = jestConfig;
