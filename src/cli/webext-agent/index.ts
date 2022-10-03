import { program } from "commander";
import { createManager } from "../../browser/firefox";
import { resolveBinPath } from "../../browser/npm";

const install = async () => {
  const manager = createManager(process.platform, await resolveBinPath());
  await manager.install();
  console.error(
    "Installed native message manifest at",
    manager.getManifestPath()
  );
};

const uninstall = async () => {
  const manager = createManager(process.platform, await resolveBinPath());
  await manager.uninstall();
  console.error(
    "Uninstalled native message manifest from",
    manager.getManifestPath()
  );
};

const check = async () => {
  const manager = createManager(process.platform, await resolveBinPath());
  if (await manager.test()) {
    console.log(
      "The native message manifest is installed at",
      manager.getManifestPath()
    );
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
