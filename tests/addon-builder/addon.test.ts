import * as fs from "node:fs/promises";
import * as os from "node:os";
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
  const addonRoot = path.join(os.tmpdir(), "my-addon");
  const addon = new TemporaryAddon(addonRoot);

  describe("root", () => {
    test("should return a root directory", () => {
      expect(addon.getRoot()).toBe(addonRoot);
    });
  });

  describe("getPath", () => {
    test("should return a path of the file", () => {
      expect(addon.getPath("manifest.json")).toBe(
        path.join(addonRoot, "manifest.json"),
      );
    });
  });
});

describe("createAgentAddon", () => {
  let addon: Addon;

  beforeEach(async () => {
    const root = await fs.mkdtemp(
      path.join(os.tmpdir(), "webext-agent-addon-"),
    );
    addon = await createAgentAddon(root, {
      additionalPermissions: ["bookmarks"],
      addonId: "my-addon@example.com",
    });
  });

  afterEach(async () => {
    await fs.rm(addon.getRoot(), { recursive: true });
  });

  test("should create a new agent addon", async () => {
    const manifest = JSON.parse(
      await fs.readFile(addon.getPath("manifest.json"), "utf-8"),
    );
    expect(manifest.permissions).toEqual(["nativeMessaging", "bookmarks"]);
    expect(manifest.background.scripts).toHaveLength(1);
    expect(manifest.browser_specific_settings.gecko.id).toBe(
      "my-addon@example.com",
    );

    const backgroundScript = manifest.background.scripts[0];
    expect(backgroundScript).toMatch(/.js/);
    expect(await fs.readFile(addon.getPath(backgroundScript), "utf-8")).toMatch(
      /"use strict"/,
    );
  });
});

describe("createMixedInAgentAddon", () => {
  let addon: Addon;

  beforeEach(async () => {
    const root = await fs.mkdtemp(
      path.join(os.tmpdir(), "webext-agent-addon-"),
    );
    addon = await createMixedInAgentAddon(
      path.join(__dirname, "testdata/base-addon"),
      root,
      { additionalPermissions: ["bookmarks"] },
    );
  });

  afterEach(async () => {
    await fs.rm(addon.getRoot(), { recursive: true });
  });

  test("should create a mixed-in agent addon", async () => {
    const manifest = JSON.parse(
      (await fs.readFile(addon.getPath("manifest.json"))).toString(),
    );
    expect(manifest.permissions).toEqual([
      "tabs",
      "nativeMessaging",
      "bookmarks",
    ]);
    expect(manifest.background.scripts).toHaveLength(2);
    expect(manifest.background.scripts[0]).toMatch("background.js");
    expect(
      await fs.readFile(addon.getPath(manifest.background.scripts[0]), "utf-8"),
    ).toMatch(/0xDEADBEEF/);

    expect(manifest.background.scripts[1]).toMatch(UUIDJSPattern);
    expect(
      await fs.readFile(addon.getPath(manifest.background.scripts[1]), "utf-8"),
    ).toMatch(/"use strict"/);
  });
});
