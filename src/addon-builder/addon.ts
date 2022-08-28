import * as os from "node:os";
import * as fs from "node:fs";
import * as path from "node:path";

const TEMPLATE_ROOT = path.join(__dirname, "../../addon-template");

export interface Addon {
  path(): string;

  clean(): Promise<void>;
}

const createAgentAddon = async (): Promise<Addon> => {
  const root = await fs.promises.mkdtemp(
    path.join(os.tmpdir(), "webext-agent-addon-")
  );
  const files = await fs.promises.readdir(TEMPLATE_ROOT);
  await Promise.all(
    files.map((f) =>
      fs.promises.copyFile(path.join(TEMPLATE_ROOT, f), path.join(root, f))
    )
  );

  return new TemporaryAddon(root);
};

export class TemporaryAddon implements Addon {
  constructor(private readonly rootDir: string) {}

  path(): string {
    return this.rootDir;
  }

  async clean(): Promise<void> {
    await fs.promises.rm(this.rootDir, { recursive: true });
  }
}

export { createAgentAddon };
