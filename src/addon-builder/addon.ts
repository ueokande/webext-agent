import * as os from "node:os";
import * as fs from "node:fs";
import * as path from "node:path";
import { v4 as uuidv4 } from "uuid";
import { buildManifest, buildMixedInManifest } from "./manifest";
import { getTemplatePath } from "./backgroundScript";

export interface Addon {
  getRoot(): string;

  getPath(file: string): string;

  clean(): Promise<void>;
}

class TemporaryAddon implements Addon {
  constructor(private readonly rootDir: string) {}

  getRoot(): string {
    return this.rootDir;
  }

  getPath(file: string): string {
    return path.join(this.rootDir, file);
  }

  async clean(): Promise<void> {
    await fs.promises.rm(this.rootDir, { recursive: true });
  }
}

type AddonOptions = {
  additionalPermissions?: string[];
};

const createAgentAddon = async ({
  additionalPermissions = [],
}: AddonOptions = {}): Promise<Addon> => {
  const agentBackgroundScriptName = `${uuidv4()}.js`;
  const root = await fs.promises.mkdtemp(
    path.join(os.tmpdir(), "webext-agent-addon-")
  );
  const manifest = buildManifest({
    agentBackgroundScriptName,
    additionalPermissions,
  });
  await fs.promises.copyFile(
    getTemplatePath(),
    path.join(root, agentBackgroundScriptName)
  );
  await fs.promises.writeFile(
    path.join(root, "manifest.json"),
    JSON.stringify(manifest, null, 2)
  );
  return new TemporaryAddon(root);
};

const createMixedInAgentAddon = async (
  baseAddonDir: string,
  { additionalPermissions }: AddonOptions = {}
): Promise<Addon> => {
  // read a base manifest at first due to check if manifest.json exists
  const baseManifest = JSON.parse(
    await fs.promises.readFile(
      path.join(baseAddonDir, "manifest.json"),
      "utf-8"
    )
  );

  const agentBackgroundScriptName = `${uuidv4()}.js`;
  const root = await fs.promises.mkdtemp(
    path.join(os.tmpdir(), "webext-agent-addon-")
  );

  const manifest = buildMixedInManifest(baseManifest, {
    agentBackgroundScriptName,
    additionalPermissions,
  });
  await fs.promises.cp(baseAddonDir, root, { recursive: true });
  await fs.promises.copyFile(
    getTemplatePath(),
    path.join(root, agentBackgroundScriptName)
  );
  await fs.promises.writeFile(
    path.join(root, "manifest.json"),
    JSON.stringify(manifest, null, 2)
  );
  return new TemporaryAddon(root);
};

export { createAgentAddon, createMixedInAgentAddon, TemporaryAddon };
