import { FastifyInstance } from "fastify";

export const handle = () => {
  return {};
};

export const route = (server: FastifyInstance) => {
  server.route({
    method: "GET",
    url: "/health",
    handler: handle,
  });
};
