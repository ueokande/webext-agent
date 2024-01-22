import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { LogDiscovery } from "../../src/discovery/logs";

describe("LogDiscovery", () => {
  let tmpdir: string;

  beforeEach(async () => {
    tmpdir = await fs.mkdtemp(path.join(os.tmpdir(), "webext-agent-"));
  });

  afterEach(async () => {
    await fs.rm(tmpdir, { recursive: true });
  });

  test("discover endpoints", async () => {
    const p1 = new LogDiscovery(tmpdir);
    const f1 = await p1.touchLog({
      profilePath: "/tmp/profile1",
      addonId: "addon1",
    });
    const f2 = await p1.touchLog({
      profilePath: "/tmp/profile1",
      addonId: "addon2",
    });
    const f3 = await p1.touchLog({
      profilePath: "/tmp/profile2",
      addonId: "addon1",
    });

    const p2 = new LogDiscovery(tmpdir);
    await expect(
      p2.resolvePath({ profilePath: "/tmp/profile1", addonId: "addon1" }),
    ).resolves.toEqual(f1);
    await expect(
      p2.resolvePath({ profilePath: "/tmp/profile1", addonId: "addon2" }),
    ).resolves.toEqual(f2);
    await expect(
      p2.resolvePath({ profilePath: "/tmp/profile2", addonId: "addon1" }),
    ).resolves.toEqual(f3);
    await expect(
      p2.resolvePath({ profilePath: "/tmp/profile2", addonId: "addon2" }),
    ).resolves.toBeNull();

    await expect(fs.readFile(f1, { encoding: "utf-8" })).resolves.toBe("");
    await expect(fs.readFile(f2, { encoding: "utf-8" })).resolves.toBe("");
    await expect(fs.readFile(f3, { encoding: "utf-8" })).resolves.toBe("");
  });

  test("do not overwrite existing logs", async () => {
    const p1 = new LogDiscovery(tmpdir);
    const f1 = await p1.touchLog({
      profilePath: "/tmp/profile1",
      addonId: "addon1",
    });
    await fs.writeFile(f1, `{ "msg": "hello" }`);

    const p2 = new LogDiscovery(tmpdir);
    const f2 = await p2.touchLog({
      profilePath: "/tmp/profile1",
      addonId: "addon1",
    });

    expect(f1).toEqual(f2);
    await expect(fs.readFile(f1, { encoding: "utf-8" })).resolves.toBe(
      `{ "msg": "hello" }`,
    );
  });
});
