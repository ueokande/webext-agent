import { program } from "commander";
import { createManager } from "../../browser/firefox";
import { resolveAgentServer } from "../../browser/cjs";
import {
  createAgentAddon,
  createMixedInAgentAddon,
} from "../../addon-builder/addon";

const install = async (options: any) => {
  const manager = createManager(process.platform, await resolveAgentServer());
  const addonIds = options.addonIds?.split(",") ?? [];
  await manager.install(addonIds);

  if (addonIds.length === 0) {
    console.warn(
      "The native message manifest will be installed but no addon will work.  Please specify addon IDs with --addon-ids option.",
    );
  }
  console.error(
    "Installed native message manifest at",
    manager.getManifestPath(),
  );
};

const uninstall = async () => {
  const manager = createManager(process.platform, await resolveAgentServer());
  await manager.uninstall();
  console.error(
    "Uninstalled native message manifest from",
    manager.getManifestPath(),
  );
};

const check = async () => {
  const manager = createManager(process.platform, await resolveAgentServer());
  if (await manager.test()) {
    console.log(
      "The native message manifest is installed at",
      manager.getManifestPath(),
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
      addonId: options.addonId,
    });
  } else {
    if (typeof options.addonId === "undefined") {
      program.error(
        "The --addon-id option is required when creating a new addon",
        { exitCode: 1 },
      );
    }
    createAgentAddon(destination, {
      additionalPermissions,
      addonId: options.addonId,
    });
  }
};

program
  .command("install")
  .description("Install a native messaging manifest to the local")
  .option(
    "--addon-ids <addon-id1>,<addon-id2>,...",
    "Comma-separated addon IDs",
  )
  .action(install);
program
  .command("uninstall")
  .description(
    "Uninstall the installed native messaging manifest from the local",
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
    "The directory containings base addon to be mixed-in",
  )
  .option(
    "--additional-permissions <perm1,perm2,...>",
    "Comma-separated additional permissions",
  )
  .option(
    "--addon-id <addon-id>",
    "The addon ID to be used or overwritten in the manifest",
  )
  .action(createAddon);

program.parse();
