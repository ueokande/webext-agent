type WebExtensionManifest = ReturnType<typeof browser.runtime.getManifest>;
type Permissions = WebExtensionManifest["permissions"];

const DEFAULT_MANIFEST = {
  manifest_version: 2,
  name: "webext-agent",
  description: "An agent to invoke WebExtensions APIs via remote",
  version: "0.0.1",
  applications: {
    gecko: {
      id: "{daf44bf7-a45e-4450-979c-91cf07434c3d}",
    },
  },
  permissions: ["nativeMessaging"],
};

type manifestOptions = {
  additionalPermissions?: Permissions;
  agentBackgroundScriptName: string;
};

const buildManifest = ({
  additionalPermissions = [],
  agentBackgroundScriptName,
}: manifestOptions): WebExtensionManifest => {
  const manifest: WebExtensionManifest = {
    ...DEFAULT_MANIFEST,
    permissions: DEFAULT_MANIFEST.permissions.concat(additionalPermissions),
    background: {
      scripts: [agentBackgroundScriptName],
    },
  };
  return manifest;
};

const buildMixedInManifest = (
  baseManifest: WebExtensionManifest,
  { additionalPermissions = [], agentBackgroundScriptName }: manifestOptions
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
  const applications = {
    ...baseManifest.applications,
    gecko: {
      id: DEFAULT_MANIFEST.applications.gecko.id,
    },
  };
  const manifest: WebExtensionManifest = {
    ...baseManifest,
    applications,
    background,
    permissions,
  };
  return manifest;
};

const addonGeckoId = () => DEFAULT_MANIFEST.applications.gecko.id;

export { buildManifest, buildMixedInManifest, addonGeckoId };
