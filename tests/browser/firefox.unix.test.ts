import * as path from "node:path";
import * as os from "node:os";
import * as fs from "node:fs";
import { UnixManager } from "../../src/browser/firefox";

const maybe =
  process.platform === "darwin" || process.platform === "linux"
    ? describe
    : describe.skip;

maybe("UnixManager", () => {
  let tmpdir: string;

  beforeEach(async () => {
    tmpdir = await fs.promises.mkdtemp(path.join(os.tmpdir(), "webext-agent-"));
  });

  afterEach(async () => {
    await fs.promises.rm(tmpdir, { recursive: true });
  });

  test("install and uninstall a native message manifest", async () => {
    const binPath = path.join(tmpdir, "bin", "webext-agent");
    const manifestPath = path.join(tmpdir, "manifest.json");
    const manager = new UnixManager(manifestPath, binPath);

    await manager.install();

    expect(await manager.test()).toBeTruthy();
    expect(await fs.promises.readFile(manifestPath, "utf-8")).toContain(
      binPath.replace("\\", "\\\\"),
    );

    await manager.uninstall();

    expect(await manager.test()).toBeFalsy();
    expect(fs.promises.stat(manifestPath)).rejects.toThrowError("ENOENT");
  });
});
