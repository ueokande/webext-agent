import * as path from "node:path";
import * as os from "node:os";
import * as fs from "node:fs/promises";
import { UnixManager } from "../../src/browser/firefox";

const maybe =
  process.platform === "darwin" || process.platform === "linux"
    ? describe
    : describe.skip;

maybe("UnixManager", () => {
  let tmpdir: string;

  beforeEach(async () => {
    tmpdir = await fs.mkdtemp(path.join(os.tmpdir(), "webext-agent-"));
  });

  afterEach(async () => {
    await fs.rm(tmpdir, { recursive: true });
  });

  test("install and uninstall a native message manifest", async () => {
    const binPath = path.join(tmpdir, "bin", "webext-agent");
    const manifestPath = path.join(tmpdir, "manifest.json");
    const addonIds = ["addon1@example.com", "addon2@example.com"];
    const manager = new UnixManager(manifestPath, binPath);

    await manager.install(addonIds);

    expect(await manager.test()).toBeTruthy();

    const json = JSON.parse(await fs.readFile(manifestPath, "utf-8"));
    expect(json.path).toBe(binPath);
    expect(json.allowed_extensions).toEqual(addonIds);

    await manager.uninstall();

    expect(await manager.test()).toBeFalsy();
    expect(fs.stat(manifestPath)).rejects.toThrow("ENOENT");
  });
});
