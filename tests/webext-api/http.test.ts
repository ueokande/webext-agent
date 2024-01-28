import path from "node:path";
import os from "node:os";
import fs from "node:fs/promises";
import Fastify, { type FastifyInstance } from "fastify";
import { EndpointDiscovery } from "../../src/discovery/endpoints";
import { connect, createRemoteAPIs } from "../../src/webext-api/http";

describe("createRemoteAPIs", () => {
  const fastify = Fastify();
  let capture: { url: string; body: unknown } | undefined = undefined;

  beforeEach(async () => {
    fastify.post("/api/*", (req) => {
      capture = { url: req.url, body: req.body };
      return {};
    });
    await fastify.listen({ host: "127.0.0.1", port: 0 });
    await fastify.ready();
  });

  afterEach(async () => {
    await fastify.close();
  });

  test("should invoke WebExtensions APIs remotely", async () => {
    const addr = fastify.server.address();
    if (addr === null) {
      throw new Error("addr is null");
    }
    const browser = createRemoteAPIs(addr);
    await browser.bookmarks.create({
      title: "my item",
      url: "https://example.com/",
    });

    expect(capture?.url).toEqual("/api/bookmarks.create");
    expect(capture?.body).toEqual({
      args: [
        {
          title: "my item",
          url: "https://example.com/",
        },
      ],
    });
  });
});

describe("connect", () => {
  const ADDON_ID = "{9ca5a5f6-045f-4a35-a537-17cd899a189d}";
  let fastify: FastifyInstance;
  let tmpdir: string;
  let discovery: EndpointDiscovery;
  let capture: { url: string; body: unknown } | undefined = undefined;
  let failCount = 0;
  let healthFail = false;

  beforeEach(async () => {
    tmpdir = await fs.mkdtemp(path.join(os.tmpdir(), "webext-agent-"));
    discovery = new EndpointDiscovery(tmpdir);

    failCount = 0;
    healthFail = false;

    fastify = Fastify();
    fastify.get("/health", () => {
      if (healthFail && failCount < 3) {
        failCount += 1;
        throw new Error("unhealthy");
      }
      return {};
    });
    fastify.post("/api/*", (req) => {
      capture = { url: req.url, body: req.body };
      return {};
    });

    await fastify.listen({ host: "127.0.0.1", port: 0 });
    await fastify.ready();

    const addr = fastify.server.address();
    if (addr === null || typeof addr === "string") {
      throw new Error("addr is not an AddressInfo");
    }

    await discovery.installAddon(ADDON_ID, {
      address: addr.address,
      port: addr.port,
    });
  });

  afterEach(async () => {
    await fastify.close();
    await fs.rm(tmpdir, { recursive: true });
  });

  test("should connect with an address", async () => {
    const addr = fastify.server.address();
    if (addr === null) {
      throw new Error("addr is null");
    }

    const api = await connect(addr);

    await api.bookmarks.create({
      title: "my item 1",
      url: "https://example.com/",
    });

    expect(capture?.url).toEqual("/api/bookmarks.create");
    expect(capture?.body).toEqual({
      args: [
        {
          title: "my item 1",
          url: "https://example.com/",
        },
      ],
    });
  });

  test("should connect with an addon id", async () => {
    const api = await connect(ADDON_ID, { dataDir: tmpdir });

    await api.bookmarks.create({
      title: "my item 2",
      url: "https://example.com/",
    });

    expect(capture?.url).toEqual("/api/bookmarks.create");
    expect(capture?.body).toEqual({
      args: [
        {
          title: "my item 2",
          url: "https://example.com/",
        },
      ],
    });
  });

  test("should retry when connecting to an endpoint", async () => {
    healthFail = true;

    const addr = fastify.server.address();
    if (addr === null) {
      throw new Error("addr is null");
    }
    await expect(connect(addr, { attempts: 5 })).resolves.toBeDefined();
  });

  test("should retry when resloving an endpoint", async () => {
    const newAddonId = "{b7906686-527a-4816-b540-fa30c0949d8f}";
    setTimeout(async () => {
      const endpoint = await discovery.resolveEndpoint(ADDON_ID);
      if (endpoint === null) {
        throw new Error("endpoint is null");
      }
      discovery.installAddon(newAddonId, endpoint);
    }, 1000);

    await connect(newAddonId, { dataDir: tmpdir, attempts: 10 });
  });
});
