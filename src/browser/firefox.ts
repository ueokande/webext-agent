import * as fs from "node:fs";
import * as os from "node:os";
import * as path from "node:path";

const TEMPLATE_ROOT = path.join(__dirname, "../../addon-template");

const APP_NAME = "demo.ueokande.webext_agent";

type NativeMessageManifest = {
  name: string;
  description: string;
  type: "stdio";
  path: string;
  allowed_extensions: Array<string>;
};

const getNativeMessageManifest = async (
  binPath: string
): Promise<NativeMessageManifest> => {
  const manifest = await fs.promises.readFile(
    path.join(TEMPLATE_ROOT, "manifest.json")
  );
  const manifestGeckoID = JSON.parse(manifest.toString()).applications.gecko.id;
  if (typeof manifestGeckoID === "undefined") {
    throw new Error("manifest.json does not define applications.gecko.id");
  }
  return {
    name: APP_NAME,
    description: "webext-agent",
    path: binPath,
    type: "stdio",
    allowed_extensions: [manifestGeckoID],
  };
};

const getNativeMessageManifestJson = async (
  binPath: string
): Promise<string> => {
  return JSON.stringify(await getNativeMessageManifest(binPath), null, 2);
};

const nativeMessageManifestPath = {
  linux: path.join(
    os.homedir(),
    ".mozilla",
    "native-messaging-hosts",
    `${APP_NAME}.json`
  ),
  darwin: path.join(
    os.homedir(),
    "Library",
    "Application Support",
    "Mozilla",
    "NativeMessagingHosts",
    `${APP_NAME}.json`
  ),
};

// ManifestManager sets-up a native messaging manifest to local filesystem
// ref: https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/Native_manifests#Manifest_location
export class ManifestManager {
  private readonly manifestPath: string;
  private readonly binPath: string;

  constructor(os: "linux" | "darwin", binPath: string) {
    this.manifestPath = nativeMessageManifestPath[os];
    this.binPath = binPath;
  }

  async install(): Promise<void> {
    const dir = path.dirname(this.manifestPath);
    await fs.promises.mkdir(dir, { recursive: true });
    const fullpath = path.join(dir, `${APP_NAME}.json`);
    await fs.promises.writeFile(
      fullpath,
      await getNativeMessageManifestJson(this.binPath)
    );
  }

  async uninstall(): Promise<void> {
    if (!(await this.test())) {
      return;
    }
    await fs.promises.unlink(this.manifestPath);
  }

  async test(): Promise<boolean> {
    try {
      await fs.promises.access(this.manifestPath);
      return true;
    } catch (e) {
      return false;
    }
  }

  getManifestPath(): string {
    return this.manifestPath;
  }
}
