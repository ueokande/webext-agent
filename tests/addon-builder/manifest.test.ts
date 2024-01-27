import { v4 as uuidv4 } from "uuid";
import {
  buildManifest,
  buildMixedInManifest,
} from "../../src/addon-builder/manifest";

describe("buildManifest", () => {
  const agentBackgroundScriptName = `${uuidv4()}.js`;

  test("should generate an addon manifest", () => {
    const manifest = buildManifest({
      agentBackgroundScriptName,
      addonId: "myaddon@example.com",
    });
    expect(manifest.manifest_version).toBe(3);
    expect(manifest.name).toBe("webext-agent");
    expect(manifest.background).toEqual({
      scripts: [agentBackgroundScriptName],
    });
    expect(manifest.permissions).toEqual(["nativeMessaging"]);
    expect(manifest.browser_specific_settings?.gecko?.id).toBe(
      "myaddon@example.com",
    );
  });

  test("should override permissions", () => {
    const manifest = buildManifest({
      agentBackgroundScriptName,
      additionalPermissions: ["bookmarks"],
      addonId: "myaddon@example.com",
    });
    expect(manifest.manifest_version).toBe(3);
    expect(manifest.name).toBe("webext-agent");
    expect(manifest.background).toEqual({
      scripts: [agentBackgroundScriptName],
    });
    expect(manifest.permissions).toEqual(["nativeMessaging", "bookmarks"]);
    expect(manifest.browser_specific_settings?.gecko?.id).toBe(
      "myaddon@example.com",
    );
  });
});

describe("buildMixedInManifest", () => {
  const agentBackgroundScriptName = `${uuidv4()}.js`;
  const baseManifest = {
    manifest_version: 3,
    name: "my-addon",
    version: "1.0.0",
    browser_specific_settings: {
      gecko: {
        id: "myaddon@example.com",
      },
    },
    background: {
      scripts: ["my-script.js"],
    },
    permissions: ["bookmarks"],
  };

  test("should generate an addon manifest", () => {
    const manifest = buildMixedInManifest(baseManifest, {
      agentBackgroundScriptName,
    });
    expect(manifest.manifest_version).toBe(3);
    expect(manifest.background).toEqual({
      scripts: ["my-script.js", agentBackgroundScriptName],
    });
    expect(manifest.permissions).toEqual(["bookmarks", "nativeMessaging"]);
    expect(manifest.browser_specific_settings?.gecko?.id).toBe(
      "myaddon@example.com",
    );
  });

  test("should override manifest properties", () => {
    const manifest = buildMixedInManifest(baseManifest, {
      agentBackgroundScriptName,
      addonIdOverride: "newname@example.com",
    });
    expect(manifest.manifest_version).toBe(3);
    expect(manifest.background).toEqual({
      scripts: ["my-script.js", agentBackgroundScriptName],
    });
    expect(manifest.permissions).toEqual(["bookmarks", "nativeMessaging"]);
    expect(manifest.browser_specific_settings?.gecko?.id).toBe(
      "newname@example.com",
    );
  });
});
