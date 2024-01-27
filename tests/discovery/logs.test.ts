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
    const f1 = await p1.touchLog("addon1");
    const f2 = await p1.touchLog("addon2");

    const p2 = new LogDiscovery(tmpdir);
    await expect(p2.resolvePath("addon1")).resolves.toEqual(f1);
    await expect(p2.resolvePath("addon2")).resolves.toEqual(f2);

    await expect(fs.readFile(f1, { encoding: "utf-8" })).resolves.toBe("");
    await expect(fs.readFile(f2, { encoding: "utf-8" })).resolves.toBe("");
  });

  test("do not overwrite existing logs", async () => {
    const p1 = new LogDiscovery(tmpdir);
    const f1 = await p1.touchLog("addon1");
    await fs.writeFile(f1, `{ "msg": "hello" }`);

    const p2 = new LogDiscovery(tmpdir);
    const f2 = await p2.touchLog("addon1");

    expect(f1).toEqual(f2);
    await expect(fs.readFile(f1, { encoding: "utf-8" })).resolves.toBe(
      `{ "msg": "hello" }`,
    );
  });
});
