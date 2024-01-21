import type { Config } from "jest";

const config: Config = {
  verbose: true,
  testMatch: ["**/tests/**/*.test.+(ts|tsx|js|jsx)"],
  preset: "ts-jest",
  testTimeout: 10000,
};

export default config;
