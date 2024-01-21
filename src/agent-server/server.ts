import Fastify from "fastify";
import { type Logger } from "pino";
import { newRoute as newApiRoute } from "./routeApi";
import { newRoute as newHealthRoute } from "./routeHealth";
import { type RPCClient } from "./rpc";

const start = (port: number, rcp: RPCClient, logger: Logger) => {
  const fastify = Fastify({ logger });
  fastify.register(
    newApiRoute((method: string, args: unknown[]) => {
      return rcp.request({ method, args });
    }),
  );
  fastify.register(newHealthRoute());
  fastify.listen({ port });
};

export { start };
