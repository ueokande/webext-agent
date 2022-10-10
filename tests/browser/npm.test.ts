import { resolveBinPath } from "../../src/browser/npm";

describe("on linux/macOS", () => {
  const unixLocations: Array<[string, string, string, string]> = [
    [
      "local installation",
      "/usr/local",
      "/home/alice/workspace/node_modules/webext-agent/dist/browser",
      "/home/alice/workspace/node_modules/.bin/agent-server",
    ],
    [
      "global installation",
      "/usr/local",
      "/usr/local/lib/node_modules/webext-agent/dist/browser",
      "/usr/local/bin/agent-server",
    ],
    [
      "global installation with custom prefix",
      "/home/alice/.local",
      "/home/alice/.local/lib/node_modules/webext-agent/dist/browser",
      "/home/alice/.local/bin/agent-server",
    ],
  ];

  test.each(unixLocations)(
    "resolves bin path for %s",
    async (_name, globalPrefix, dirname, expected) => {
      await expect(await resolveBinPath("linux", globalPrefix, dirname)).toBe(
        expected
      );
    }
  );
});

describe("on windows", () => {
  const win32Locations: Array<[string, string, string, string]> = [
    [
      "local installation",
      "C:\\Users\\alice\\AppData\\Roaming\\npm",
      "C:\\Users\\alice\\workspace\\node_modules\\webext-agent\\dist\\browser",
      "C:\\Users\\alice\\workspace\\node_modules\\.bin\\agent-server.cmd",
    ],
    [
      "global installation",
      "C:\\Users\\alice\\AppData\\Roaming\\npm",
      "C:\\Users\\alice\\AppData\\Roaming\\npm\\node_modules\\webext-agent\\dist\\browser",
      "C:\\Users\\alice\\AppData\\Roaming\\npm\\agent-server.cmd",
    ],
  ];

  test.each(win32Locations)(
    "resolves bin path for %s",
    async (_name, globalPrefix, dirname, expected) => {
      await expect(await resolveBinPath("win32", globalPrefix, dirname)).toBe(
        expected
      );
    }
  );
});
