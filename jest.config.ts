import type { Config } from "@jest/types";

const config: Config.InitialOptions = {
  verbose: true,
  testMatch: ["**/tests/**/*.test.+(ts|tsx|js|jsx)"],
  preset: "ts-jest",
  testTimeout: 10000,
};
export default config;
