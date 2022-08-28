import Fastify from "fastify";
import { newRoute } from "../../src/agent-server/routeHealth";

const fastify = Fastify();
fastify.register(newRoute());

test("should returns status 200", async () => {
  const resp = await fastify.inject({
    path: "/health",
    method: "GET",
  });
  expect(resp.statusCode).toBe(200);
});
