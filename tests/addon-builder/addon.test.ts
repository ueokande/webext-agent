import * as fs from "node:fs";
import * as path from "node:path";
import {
  createAgentAddon,
  createMixedInAgentAddon,
  Addon,
  TemporaryAddon,
} from "../../src/addon-builder/addon";

const UUIDJSPattern =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}.js$/;

describe("Addon", () => {
  const addon = new TemporaryAddon("/tmp/foo");

  describe("root", () => {
    test("should return a root directory", () => {
      expect(addon.getRoot()).toBe("/tmp/foo");
    });
  });

  describe("getPath", () => {
    test("should return a path of the file", () => {
      expect(addon.getPath("manifest.json")).toBe("/tmp/foo/manifest.json");
    });
  });
});

describe("createAgentAddon", () => {
  let addon: Addon;

  beforeEach(async () => {
    addon = await createAgentAddon({ additionalPermissions: ["bookmarks"] });
  });

  afterEach(() => {
    addon.clean();
  });

  test("should create a new agent addon", async () => {
    await expect(async () =>
      fs.promises.access(addon.getPath("manifest.json"))
    ).not.toThrowError();

    const manifest = JSON.parse(
      (await fs.promises.readFile(addon.getPath("manifest.json"))).toString()
    );
    expect(manifest.permissions).toEqual(["nativeMessaging", "bookmarks"]);
    expect(manifest.background.scripts).toHaveLength(1);

    const backgroundScript = manifest.background.scripts[0];
    expect(backgroundScript).toMatch(/.js/);
    await expect(async () =>
      fs.promises.access(addon.getPath(backgroundScript))
    ).not.toThrowError();

    expect(
      await fs.promises.readFile(addon.getPath(backgroundScript), "utf-8")
    ).toMatch(/"use strict"/);
  });
});

describe("createMixedInAgentAddon", () => {
  let addon: Addon;

  beforeEach(async () => {
    addon = await createMixedInAgentAddon(
      path.join(__dirname, "testdata/base-addon"),
      { additionalPermissions: ["bookmarks"] }
    );
  });

  afterEach(() => {
    addon.clean();
  });

  test("should create a mixed-in agent addon", async () => {
    await expect(async () =>
      fs.promises.access(addon.getPath("manifest.json"))
    ).not.toThrowError();
    const manifest = JSON.parse(
      (await fs.promises.readFile(addon.getPath("manifest.json"))).toString()
    );
    expect(manifest.permissions).toEqual([
      "tabs",
      "nativeMessaging",
      "bookmarks",
    ]);
    expect(manifest.background.scripts).toHaveLength(2);
    expect(manifest.background.scripts[0]).toMatch("background.js");
    expect(
      await fs.promises.readFile(
        addon.getPath(manifest.background.scripts[0]),
        "utf-8"
      )
    ).toMatch(/0xDEADBEEF/);

    expect(manifest.background.scripts[1]).toMatch(UUIDJSPattern);
    expect(
      await fs.promises.readFile(
        addon.getPath(manifest.background.scripts[1]),
        "utf-8"
      )
    ).toMatch(/"use strict"/);
  });
});
