import Fastify from "fastify";
import { newRoute } from "../../src/agent-server/routeApi";

const fastify = Fastify();

fastify.register(
  newRoute((method: string, args: unknown[]) => {
    if (method === "tabs.get") {
      return { id: args[0], title: "Hello!" };
    } else if (method === "tabs.query") {
      throw new Error("tabs.query does not work");
    }
    throw new Error("unsupported operation: " + method);
  })
);

test("should returns a response with status 200", async () => {
  const resp = await fastify.inject({
    path: "/api/tabs.get",
    method: "POST",
    payload: { args: [100] },
  });

  expect(resp.statusCode).toBe(200);
  expect(JSON.parse(resp.body)).toEqual({ id: 100, title: "Hello!" });
});

test("should returns 500 on invalid body", async () => {
  const resp = await fastify.inject({
    path: "/api/tabs.query",
    method: "POST",
    payload: { args: [{}] },
  });

  expect(resp.statusCode).toBe(500);
  expect(JSON.parse(resp.body).message).toEqual(
    expect.stringMatching("tabs.query does not work")
  );
});
