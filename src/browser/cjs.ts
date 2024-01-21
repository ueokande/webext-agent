import path from "node:path";
import fs from "node:fs";

// resolveAgentServer resolves a path to agent-server.
const resolveAgentServer = async () => {
  if (require?.main?.path === undefined) {
    throw new Error("require.main.path is undefined");
  }

  // require.main.path is node_modules/webext-agent/bin
  const projectRoot = path.join(require.main.path, "..");
  const platform = process.platform;
  const basename = platform === "win32" ? "agent-server.cmd" : "agent-server";

  // Look-up the bin path from the global installation.
  if (platform === "win32") {
    // The backage and the bin are installed in the following paths on Windows.
    // - $(prefix)/node_modules/$(module name)
    // - $(prefix)/$(bin name).cmd
    const bin = path.join(projectRoot, "../..", basename);
    if (await fileExists(bin)) {
      return bin;
    }
  } else {
    // The backage and the bin are installed in the following paths on UNIX.
    // - $(prefix)/lib/node_modules/$(module name)
    // - $(prefix)/bin/$(bin name)
    const bin = path.join(projectRoot, "../../../bin", basename);
    if (await fileExists(bin)) {
      return bin;
    }
  }

  // Look-up the bin path from the local installation.
  const paths = module.paths;
  for (const p of paths) {
    const bin = path.join(p, ".bin", basename);
    if (await fileExists(bin)) {
      return bin;
    }
  }
  throw new Error("Cannot resolve agent-server");
};

const fileExists = async (path: string) => {
  try {
    await fs.promises.stat(path);
    return true;
  } catch (e: any) {
    if (e.code === "ENOENT") {
      return false;
    }
    throw e;
  }
};

export { resolveAgentServer };
