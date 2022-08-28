import Fastify from "fastify";
import { createRemoteAPIs } from "../../src/webext-api/http";

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
