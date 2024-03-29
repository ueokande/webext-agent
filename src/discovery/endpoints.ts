import path from "node:path";
import fs from "node:fs/promises";
import { z } from "zod";

const ENDPOINTS_JSON_FILE = "endpoints.json";

const EndpointStorageSchemaV1 = z.object({
  version: z.literal(1),
  endpoints: z.array(
    z.object({
      addonId: z.string(),
      address: z.string(),
      port: z.number(),
    }),
  ),
});

type EndpointStorageSchemaV1 = z.infer<typeof EndpointStorageSchemaV1>;

type Endpoint = {
  address: string;
  port: number;
};

export class EndpointDiscovery {
  private readonly storagePath;

  constructor(dataDir: string) {
    this.storagePath = path.join(dataDir, ENDPOINTS_JSON_FILE);
  }

  async installAddon(
    addonId: string,
    { address, port }: Endpoint,
  ): Promise<void> {
    const state = await this.loadOrCreate();
    state.endpoints = state.endpoints.filter(
      (entry) => entry.addonId !== addonId,
    );
    state.endpoints.push({ addonId, address, port });
    await this.save(state);
  }

  async uninstallAddon(addonId: string): Promise<void> {
    const state = await this.loadOrCreate();
    state.endpoints = state.endpoints.filter(
      (entry) => entry.addonId !== addonId,
    );
    await this.save(state);
  }

  async resolveEndpoint(addonId: string): Promise<Endpoint | null> {
    const state = await this.loadOrCreate();
    const entry = state.endpoints.find((entry) => entry.addonId === addonId);
    if (entry) {
      return { address: entry.address, port: entry.port };
    }
    return null;
  }

  private async save(state: EndpointStorageSchemaV1) {
    const tmpfile = `${this.storagePath}.${process.pid}`;
    await fs.mkdir(path.dirname(this.storagePath), { recursive: true });
    await fs.writeFile(tmpfile, JSON.stringify(state));
    await fs.rename(tmpfile, this.storagePath);
  }

  private async loadOrCreate(): Promise<EndpointStorageSchemaV1> {
    const content = await (async () => {
      try {
        return await fs.readFile(this.storagePath, "utf-8");
      } catch (e: any) {
        if (e.code === "ENOENT") {
          return null;
        }
        throw e;
      }
    })();
    if (content === null) {
      return { version: 1, endpoints: [] };
    }

    return EndpointStorageSchemaV1.parse(JSON.parse(content));
  }
}
