import path from "node:path";
import os from "node:os";
import fs from "node:fs/promises";
import Fastify from "fastify";
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

describe("connect with an addon", () => {
  const fastify = Fastify();
  let healthCount = 0;
  beforeEach(async () => {
    fastify.get("/health", () => {
      healthCount++;
      if (healthCount < 5) {
        throw new Error("not ready");
      }
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

    await connect(addr, { attempts: 5 });
    expect(healthCount).toEqual(5);
  });
});

describe("connect with an addon id", () => {
  const fastify = Fastify();
  let tmpdir: string;
  let capture: { url: string; body: unknown } | undefined = undefined;

  beforeEach(async () => {
    tmpdir = await fs.mkdtemp(path.join(os.tmpdir(), "webext-agent-"));

    fastify.get("/health", () => ({}));
    fastify.post("/api/*", (req) => {
      capture = { url: req.url, body: req.body };
      return {};
    });
    await fastify.listen({ host: "127.0.0.1", port: 0 });
    await fastify.ready();
  });

  afterEach(async () => {
    await fastify.close();
    await fs.rm(tmpdir, { recursive: true });
  });

  test("shuold discover an endpoint from the addon id", async () => {
    const addr = fastify.server.address();
    if (addr === null || typeof addr === "string") {
      throw new Error("addr is not an AddressInfo");
    }

    const discovery = new EndpointDiscovery(tmpdir);
    await discovery.installAddon("{9ca5a5f6-045f-4a35-a537-17cd899a189d}", {
      address: addr.address,
      port: addr.port,
    });

    const browser = await connect("{9ca5a5f6-045f-4a35-a537-17cd899a189d}", {
      dataDir: tmpdir,
    });
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
