import * as path from "node:path";
import * as os from "node:os";
import * as fs from "node:fs/promises";
import regedit from "regedit";
import { WindowsManager } from "../../src/browser/firefox";

const maybe = process.platform === "win32" ? describe : describe.skip;

maybe("WindowsManager", () => {
  test("install and uninstall a native message manifest", async () => {
    const binPath = path.join(os.homedir(), "bin", "webext-agent");
    const addonIds = ["addon1@example.com", "addon2@example.com"];
    const manager = new WindowsManager(binPath);
    const keyName =
      "HKCU\\SOFTWARE\\Mozilla\\NativeMessagingHosts\\demo.ueokande.webext_agent";

    await manager.install(addonIds);
    expect(await manager.test()).toBeTruthy();

    const key1 = await regedit.promisified.list([keyName]);
    expect(key1[keyName]).toBeTruthy();
    expect(key1[keyName].exists).toBeTruthy();

    const item = key1[keyName].values[""];
    expect(item).toBeTruthy();
    expect(item.type).toBe("REG_SZ");
    expect(item.value).toMatch(/^C:\\.*.json$/);

    const json = JSON.parse(await fs.readFile(item.value as string, "utf-8"));
    expect(json.path).toBe(binPath);
    expect(json.allowed_extensions).toEqual(addonIds);

    await manager.uninstall();
    expect(await manager.test()).toBeFalsy();

    const key2 = await regedit.promisified.list([keyName]);
    expect(key2[keyName]).toBeTruthy();
    expect(key2[keyName].exists).toBeFalsy();
  });
});
