import { program } from "commander";
import path from "node:path";

import { ManifestManager } from "../../browser/firefox";

const platform = process.platform;
const binPath = path.join(
  __dirname,
  "..",
  "..",
  "..",
  "bin",
  "agent-server.js"
);

if (platform !== "linux" && platform !== "darwin") {
  throw new Error("unsupported platform: " + platform);
}
const manager = new ManifestManager(platform, binPath);
const manifestPath = manager.getManifestPath();

const install = async () => {
  await manager.install();
  console.error("Installed native message manifest at", manifestPath);
};

const uninstall = async () => {
  await manager.uninstall();
  console.error("Uninstalled native message manifest from", manifestPath);
};

const check = async () => {
  if (await manager.test()) {
    console.log("The native message manifest is installed at", manifestPath);
  } else {
    console.log("The native message manifest is not installed");
  }
};

program
  .command("install")
  .description("Install a native messaging manifest to the local")
  .action(install);
program
  .command("uninstall")
  .description(
    "Uninstall the installed native messaging manifest from the local"
  )
  .action(uninstall);
program
  .command("check")
  .description("Check if the native message manifest is installed")
  .action(check);

program.parse();
