import { FastifyInstance, FastifyRequest, FastifyReply } from "fastify";
import {
  RequestSchema,
  type RequestType,
  ErrorSchema,
} from "./schema";
import { methodExists, validateArgs, ValidationError } from "../webext-api";

type Callback = (method: string, args: unknown[]) => void;

export const handler = (callback: Function) => {
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
    if (!methodExists(methodFullName)) {
      reply.status(404).send({ message: `${methodFullName} not supported` });
      return;
    }

    const { args } = req.body;
    try {
      validateArgs(methodFullName, args.length);
    } catch (e) {
      if (e instanceof ValidationError) {
        reply.status(400).send({ message: e.message });
      }
      throw e;
    }

    return callback(methodFullName, args);
  };
};

export const route = (server: FastifyInstance, callback: Callback) => {
  server.post<{
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
