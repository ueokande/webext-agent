import * as fs from "node:fs";
import * as path from "node:path";
import { v4 as uuidv4 } from "uuid";
import { buildManifest, buildMixedInManifest } from "./manifest";
import { getTemplatePath } from "./backgroundScript";

export interface Addon {
  getRoot(): string;

  getPath(file: string): string;
}

class TemporaryAddon implements Addon {
  constructor(private readonly rootDir: string) {}

  getRoot(): string {
    return this.rootDir;
  }

  getPath(file: string): string {
    return path.join(this.rootDir, file);
  }
}

type AddonOptions = {
  additionalPermissions?: string[];
};

const createAgentAddon = async (
  destDir: string,
  { additionalPermissions = [] }: AddonOptions = {},
): Promise<Addon> => {
  if (fs.existsSync(destDir)) {
    await fs.promises.rm(destDir, { recursive: true });
  }
  await fs.promises.mkdir(destDir, { recursive: true });

  const agentBackgroundScriptName = `${uuidv4()}.js`;
  const manifest = buildManifest({
    agentBackgroundScriptName,
    additionalPermissions,
  });
  await fs.promises.copyFile(
    getTemplatePath(),
    path.join(destDir, agentBackgroundScriptName),
  );
  await fs.promises.writeFile(
    path.join(destDir, "manifest.json"),
    JSON.stringify(manifest, null, 2),
  );
  return new TemporaryAddon(destDir);
};

const createMixedInAgentAddon = async (
  baseAddonDir: string,
  destDir: string,
  { additionalPermissions }: AddonOptions = {},
): Promise<Addon> => {
  if (fs.existsSync(destDir)) {
    await fs.promises.rm(destDir, { recursive: true });
  }

  // read a base manifest at first due to check if manifest.json exists
  const baseManifest = JSON.parse(
    await fs.promises.readFile(
      path.join(baseAddonDir, "manifest.json"),
      "utf-8",
    ),
  );

  const agentBackgroundScriptName = `${uuidv4()}.js`;
  const manifest = buildMixedInManifest(baseManifest, {
    agentBackgroundScriptName,
    additionalPermissions,
  });
  await fs.promises.cp(baseAddonDir, destDir, { recursive: true });
  await fs.promises.copyFile(
    getTemplatePath(),
    path.join(destDir, agentBackgroundScriptName),
  );
  await fs.promises.writeFile(
    path.join(destDir, "manifest.json"),
    JSON.stringify(manifest, null, 2),
  );
  return new TemporaryAddon(destDir);
};

export { createAgentAddon, createMixedInAgentAddon, TemporaryAddon };
