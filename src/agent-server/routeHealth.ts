import type { FastifyInstance } from "fastify";

export const handle = () => {
  return {};
};

export const newRoute = () => {
  return async (fastify: FastifyInstance) => {
    fastify.get(
      "/health",
      {
        schema: {
          response: {
            200: {},
          },
        },
      },
      handle,
    );
  };
};
