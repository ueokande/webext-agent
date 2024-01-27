type WebExtensionManifest = ReturnType<typeof browser.runtime.getManifest>;
type Permissions = WebExtensionManifest["permissions"];

const DEFAULT_MANIFEST = {
  manifest_version: 3,
  name: "webext-agent",
  description: "An agent to invoke WebExtensions APIs via remote",
  version: "0.0.1",
  permissions: ["nativeMessaging"],
};

type BuildManifestOption = {
  additionalPermissions?: Permissions;
  agentBackgroundScriptName: string;
  addonId: string;
};

const buildManifest = ({
  additionalPermissions = [],
  agentBackgroundScriptName,
  addonId,
}: BuildManifestOption): WebExtensionManifest => {
  const manifest: WebExtensionManifest = {
    ...DEFAULT_MANIFEST,
    permissions: DEFAULT_MANIFEST.permissions.concat(additionalPermissions),
    background: {
      scripts: [agentBackgroundScriptName],
    },
    browser_specific_settings: {
      gecko: {
        id: addonId,
      },
    },
  };
  return manifest;
};

type BuildMixedInManifestOption = {
  additionalPermissions?: Permissions;
  agentBackgroundScriptName: string;
  addonIdOverride?: string;
};

const buildMixedInManifest = (
  baseManifest: WebExtensionManifest,
  {
    additionalPermissions = [],
    agentBackgroundScriptName,
    addonIdOverride,
  }: BuildMixedInManifestOption,
): WebExtensionManifest => {
  const permissions = (baseManifest.permissions ?? [])
    .concat(DEFAULT_MANIFEST.permissions)
    .concat(additionalPermissions);
  const background = {
    ...baseManifest.background,
    scripts: (baseManifest?.background && "scripts" in baseManifest.background
      ? baseManifest.background.scripts
      : []
    ).concat(agentBackgroundScriptName),
  };
  const browser_specific_settings = {
    ...baseManifest.browser_specific_settings,
  };
  if (addonIdOverride) {
    if (!browser_specific_settings.gecko) {
      browser_specific_settings.gecko = {};
    }
    browser_specific_settings.gecko.id = addonIdOverride;
  }
  const manifest: WebExtensionManifest = {
    ...baseManifest,
    browser_specific_settings,
    background,
    permissions,
  };
  return manifest;
};

export { buildManifest, buildMixedInManifest };
