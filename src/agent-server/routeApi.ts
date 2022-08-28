import { type FastifyInstance, FastifyRequest, FastifyReply } from "fastify";
import { RequestSchema, type RequestType, ErrorSchema } from "./schema";

type Callback = (method: string, args: unknown[]) => void;

export const handler = (callback: Callback) => {
  return async (
    req: FastifyRequest<{
      Body: RequestType;
      Params: {
        methodFullName: string;
      };
    }>,
    reply: FastifyReply
  ) => {
    const { methodFullName } = req.params;
    const { args } = req.body;
    try {
      const resp = await callback(methodFullName, args);
      reply.send(resp);
    } catch (e) {
      reply.code(500).send({ message: String(e) });
    }
  };
};

export const newRoute = (callback: Callback) => {
  return async (fastify: FastifyInstance) => {
    fastify.post<{
      Body: RequestType;
      Params: {
        methodFullName: string;
      };
    }>(
      "/api/:methodFullName",
      {
        schema: {
          body: RequestSchema,
          response: {
            500: ErrorSchema,
          },
        },
      },
      handler(callback)
    );
  };
};
