import path from "node:path";
import * as util from "node:util";
import { exec } from "node:child_process";

const resolveGlobalPrefix = async () => {
  const { stdout } = await util.promisify(exec)("npm prefix --global");
  return stdout.trim();
};

// resolveBinPath resolves a directory path containing agent-server command
// from __dirname of this script.  The installed bin script and package are
// located by the following rules.  Each parameters of the function are only
// used in tests.
//
// * global location (installed by npm install --global)
//   * win32
//      - bin: <prefix>/<bin name>
//      - package: <prefix>/node_modules/<package name>
//   * unix
//      - bin: <prefix>/bin/<bin name>
//      - package: <prefix>/lib/node_modules/<package name>
//
// * local location (installed by package dependencies)
//   * win32
//      - bin: <prefix>/node_modules/.bin/<bin name>
//      - package: <prefix>/node_modules/<package name>
//   * unix
//      - bin: <prefix>/node_modules/.bin/<bin name>
//      - package: <prefix>/node_modules/<package name>
const resolveBinPath = async (
  platform: string = process.platform,
  globalPrefix: string | Promise<string> = resolveGlobalPrefix(),
  dirname: string = __dirname
) => {
  if (dirname.startsWith(await globalPrefix)) {
    // installed local package
    if (platform === "win32") {
      return path.win32.join(dirname, "../../../../agent-server.cmd");
    } else {
      return path.posix.join(dirname, "../../../../../bin/agent-server");
    }
  } else {
    // installed webext-agent on local package
    if (platform === "win32") {
      return path.win32.join(dirname, "../../../.bin/agent-server.cmd");
    } else {
      return path.posix.join(dirname, "../../../.bin/agent-server");
    }
  }
};

export { resolveBinPath };
