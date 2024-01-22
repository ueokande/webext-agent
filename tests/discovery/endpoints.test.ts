import path from "node:path";
import os from "node:os";
import fs from "node:fs/promises";
import { EndpointDiscovery } from "../../src/discovery/endpoints";

describe("EndpointDiscovery", () => {
  let tmpdir: string;

  beforeEach(async () => {
    tmpdir = await fs.mkdtemp(path.join(os.tmpdir(), "webext-agent-"));
  });

  afterEach(async () => {
    await fs.rm(tmpdir, { recursive: true });
  });

  test("discover endpoints", async () => {
    const p1 = new EndpointDiscovery(path.join(tmpdir, "endpoints.json"));

    await p1.installAddon(
      { profilePath: "/tmp/profile1", addonId: "addon1" },
      { address: "127.0.0.1", port: 10000 },
    );
    await p1.installAddon(
      { profilePath: "/tmp/profile1", addonId: "addon2" },
      { address: "127.0.0.1", port: 10001 },
    );
    await p1.installAddon(
      { profilePath: "/tmp/profile2", addonId: "addon1" },
      { address: "127.0.0.1", port: 10002 },
    );

    const p2 = new EndpointDiscovery(path.join(tmpdir, "endpoints.json"));
    await expect(
      p2.resolveEndpoint({ profilePath: "/tmp/profile1", addonId: "addon1" }),
    ).resolves.toEqual({ address: "127.0.0.1", port: 10000 });
    await expect(
      p2.resolveEndpoint({ profilePath: "/tmp/profile1", addonId: "addon2" }),
    ).resolves.toEqual({ address: "127.0.0.1", port: 10001 });
    await expect(
      p2.resolveEndpoint({ profilePath: "/tmp/profile2", addonId: "addon1" }),
    ).resolves.toEqual({ address: "127.0.0.1", port: 10002 });
    await expect(
      p2.resolveEndpoint({ profilePath: "/tmp/profile2", addonId: "addon2" }),
    ).resolves.toBeNull();
  });
});
