import * as fs from "node:fs";
import * as os from "node:os";
import * as path from "node:path";
import regedit, { type RegistryItem } from "regedit";
import { addonGeckoId } from "../addon-builder/manifest";

const APP_NAME = "demo.ueokande.webext_agent";

type NativeMessagingManifest = {
  name: string;
  description: string;
  type: "stdio";
  path: string;
  allowed_extensions: Array<string>;
};

const getNativeMessagingManifest = (
  binPath: string,
): NativeMessagingManifest => {
  return {
    name: APP_NAME,
    description: "webext-agent",
    path: binPath,
    type: "stdio",
    allowed_extensions: [addonGeckoId()],
  };
};

const getNativeMessagingManifestJson = (binPath: string): string => {
  return JSON.stringify(getNativeMessagingManifest(binPath), null, 2);
};

// NativeMessagingManifestManager sets-up a native messaging manifest to local filesystem
// ref: https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/Native_manifests#Manifest_location
interface NativeMessagingManifestManager {
  install(): Promise<void>;
  uninstall(): Promise<void>;
  test(): Promise<boolean>;
}

class UnixManager implements NativeMessagingManifestManager {
  private readonly manifestPath: string;
  private readonly binPath: string;

  constructor(manifestPath: string, binPath: string) {
    this.manifestPath = manifestPath;
    this.binPath = binPath;
  }

  async install(): Promise<void> {
    const dir = path.dirname(this.manifestPath);
    const basename = path.basename(this.manifestPath);
    await fs.promises.mkdir(dir, { recursive: true });
    const fullpath = path.join(dir, basename);
    await fs.promises.writeFile(
      fullpath,
      getNativeMessagingManifestJson(this.binPath),
    );
  }

  async uninstall(): Promise<void> {
    if (!fs.existsSync(this.manifestPath)) {
      return;
    }
    await fs.promises.unlink(this.manifestPath);
  }

  async test(): Promise<boolean> {
    return fs.existsSync(this.manifestPath);
  }

  getManifestPath(): string {
    return this.manifestPath;
  }
}

class WindowsManager implements NativeMessagingManifestManager {
  private readonly registryKeyName: string;
  private readonly manifestPath: string;
  private readonly binPath: string;

  constructor(binPath: string) {
    this.registryKeyName = `HKCU\\SOFTWARE\\Mozilla\\NativeMessagingHosts\\${APP_NAME}`;
    this.manifestPath = path.join(
      os.homedir(),
      "AppData",
      "Local",
      APP_NAME,
      `${APP_NAME}.json`,
    );
    this.binPath = binPath;
  }

  async install(): Promise<void> {
    await this.createManifest();
    await this.createRegistryEntry();
  }

  async uninstall(): Promise<void> {
    await this.removeManifest();
    await this.removeRegistryEntry();
  }

  async test(): Promise<boolean> {
    const item = await this.getRegistoryKeyItem();
    if (!item.exists) {
      return false;
    }
    return true;
  }

  getManifestPath(): string {
    return this.manifestPath;
  }

  private async createRegistryEntry(): Promise<void> {
    const item = await this.getRegistoryKeyItem();
    if (!item.exists) {
      await regedit.promisified.createKey([this.registryKeyName]);
    }
    await regedit.promisified.putValue({
      [this.registryKeyName]: {
        "(Default)": {
          value: this.manifestPath,
          type: "REG_DEFAULT",
        },
      },
    });
  }

  private async removeRegistryEntry(): Promise<void> {
    const item = await this.getRegistoryKeyItem();
    if (!item.exists) {
      return;
    }
    await regedit.promisified.deleteKey([this.registryKeyName]);
  }

  private async createManifest(): Promise<void> {
    const dir = path.dirname(this.manifestPath);
    await fs.promises.mkdir(dir, { recursive: true });
    const fullpath = path.join(dir, `${APP_NAME}.json`);
    await fs.promises.writeFile(
      fullpath,
      getNativeMessagingManifestJson(this.binPath),
    );
  }

  private async getRegistoryKeyItem(): Promise<RegistryItem> {
    const result = await regedit.promisified.list([this.registryKeyName]);
    return result[this.registryKeyName];
  }

  private async removeManifest(): Promise<void> {
    if (!fs.existsSync(this.manifestPath)) {
      return;
    }
    await fs.promises.unlink(this.manifestPath);
  }
}

const createManager = (platform: string, binPath: string) => {
  switch (platform) {
    case "win32":
      return new WindowsManager(binPath);
    case "linux":
      return new UnixManager(
        path.join(
          os.homedir(),
          ".mozilla",
          "native-messaging-hosts",
          `${APP_NAME}.json`,
        ),
        binPath,
      );
    case "darwin":
      return new UnixManager(
        path.join(
          os.homedir(),
          "Library",
          "Application Support",
          "Mozilla",
          "NativeMessagingHosts",
          `${APP_NAME}.json`,
        ),
        binPath,
      );
  }
  throw new Error("unsupported platform: " + platform);
};

export {
  NativeMessagingManifestManager,
  UnixManager,
  WindowsManager,
  createManager,
};
