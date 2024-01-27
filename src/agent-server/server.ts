import Fastify from "fastify";
import { type Logger } from "pino";
import { newRoute as newApiRoute } from "./routeApi";
import { newRoute as newHealthRoute } from "./routeHealth";
import { type RPCClient } from "./rpc";

const start = async (
  port: number | undefined,
  rcp: RPCClient,
  logger: Logger,
) => {
  const fastify = Fastify({ logger });
  fastify.register(
    newApiRoute(async (method: string, args: unknown[]) => {
      logger.warn({ method, args }, "request");
      try {
        const resp = await rcp.request({ method, args });
        logger.warn({ resp: resp }, "response");
        return resp;
      } catch (e) {
        logger.error({ error: e, errstring: String(e) }, "error");
        throw e;
      }
    }),
  );
  fastify.register(newHealthRoute());
  fastify.listen({ port });

  return fastify;
};

export { start };
