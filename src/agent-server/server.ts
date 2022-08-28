import Fastify from "fastify";
import { type Logger } from "pino";
import { route as routeApi } from "./serverApi";
import { route as routeHealth } from "./serverHealth";
import { type RPCClient } from "./rpc";

const start = (port: number, rcp: RPCClient, logger: Logger) => {
  const server = Fastify({ logger });
  routeApi(server, (method: string, args: unknown[]) => {
    return rcp.request({ method, args });
  });
  routeHealth(server);

  server.listen({ port });
};

export { start };
