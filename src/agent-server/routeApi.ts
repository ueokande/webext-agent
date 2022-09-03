import { type FastifyInstance, FastifyRequest } from "fastify";
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
  ) => {
    const { methodFullName } = req.params;
    const { args } = req.body;
    return callback(methodFullName, args);
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
            // 200: ResponseSchema,
            400: ErrorSchema,
            404: ErrorSchema,
          },
        },
      },
      handler(callback)
    );
  };
};
