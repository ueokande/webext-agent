import { v4 as uuidv4 } from "uuid";
import {
  buildManifest,
  buildMixedInManifest,
} from "../../src/addon-builder/manifest";

describe("buildManifest", () => {
  const agentBackgroundScriptName = `${uuidv4()}.js`;

  test("should generate an addon manifest", () => {
    const manifest = buildManifest({ agentBackgroundScriptName });
    expect(manifest.manifest_version).toBe(3);
    expect(manifest.name).toBe("webext-agent");
    expect(manifest.background).toEqual({
      scripts: [agentBackgroundScriptName],
    });
    expect(manifest.permissions).toEqual(["nativeMessaging"]);
  });

  test("should override permissions", () => {
    const manifest = buildManifest({
      agentBackgroundScriptName,
      additionalPermissions: ["bookmarks"],
    });
    expect(manifest.manifest_version).toBe(3);
    expect(manifest.name).toBe("webext-agent");
    expect(manifest.background).toEqual({
      scripts: [agentBackgroundScriptName],
    });
    expect(manifest.permissions).toEqual(["nativeMessaging", "bookmarks"]);
  });
});

describe("buildMixedInManifest", () => {
  const agentBackgroundScriptName = `${uuidv4()}.js`;

  test("should override manifest properties", () => {
    const baseManifest = {
      manifest_version: 3,
      name: "my-addon",
      version: "1.0.0",
      applications: {
        gecko: {
          id: "myaddon@exapmle.com",
        },
      },
      background: {
        scripts: ["my-script.js"],
      },
      permissions: ["bookmarks"],
    };

    const manifest = buildMixedInManifest(baseManifest, {
      agentBackgroundScriptName,
    });
    expect(manifest.manifest_version).toBe(3);
    expect(manifest.background).toEqual({
      scripts: ["my-script.js", agentBackgroundScriptName],
    });
    expect(manifest.permissions).toEqual(["bookmarks", "nativeMessaging"]);
  });
});
