import { program } from "commander";
import { createManager } from "../../browser/firefox";
import { resolveAgentServer } from "../../browser/cjs";
import {
  createAgentAddon,
  createMixedInAgentAddon,
} from "../../addon-builder/addon";

const install = async () => {
  const manager = createManager(process.platform, await resolveAgentServer());
  await manager.install();
  console.error(
    "Installed native message manifest at",
    manager.getManifestPath()
  );
};

const uninstall = async () => {
  const manager = createManager(process.platform, await resolveAgentServer());
  await manager.uninstall();
  console.error(
    "Uninstalled native message manifest from",
    manager.getManifestPath()
  );
};

const check = async () => {
  const manager = createManager(process.platform, await resolveAgentServer());
  if (await manager.test()) {
    console.log(
      "The native message manifest is installed at",
      manager.getManifestPath()
    );
  } else {
    console.log("The native message manifest is not installed");
  }
};

const createAddon = async (destination: string, options: any) => {
  let additionalPermissions: Array<string> | undefined;
  if (typeof options.additionalPermissions === "string") {
    additionalPermissions = options.additionalPermissions.split(",");
  }
  if (typeof options.baseAddon === "string") {
    createMixedInAgentAddon(options.baseAddon, destination, {
      additionalPermissions,
    });
  } else {
    createAgentAddon(destination, { additionalPermissions });
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
program
  .command("create-addon")
  .description("Create a new agent add-on")
  .argument("<destination>")
  .option(
    "--base-addon <base-addon>",
    "The directory containings base addon to be mixed-in"
  )
  .option(
    "--additional-permissions <perm1,perm2,...>",
    "Comma-separated additional permissions"
  )
  .action(createAddon);

program.parse();
