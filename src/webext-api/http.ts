import { setTimeout } from "node:timers/promises";
import axios from "axios";
import type { AddressInfo } from "node:net";
import { createAPIs } from "./factory";

type Browser = typeof browser;

const hasMessage = (data: unknown): data is { message: unknown } => {
  return (
    typeof data === "object" &&
    data !== null &&
    Object.prototype.hasOwnProperty.call(data, "message")
  );
};

const createRemoteAPIs = (address: string | AddressInfo): Browser => {
  let addr = address;
  if (typeof address !== "string") {
    addr = `${address.address}:${address.port}`;
  }
  return createAPIs(async (method, args) => {
    try {
      const url = `http://${addr}/api/${method}`;
      const json = { args };
      const resp = await axios.post(url, json);
      return resp.data;
    } catch (err) {
      if (axios.isAxiosError(err) && err.response) {
        const { status, data } = err.response;
        if (hasMessage(data)) {
          throw new Error(
            `Server returns ${status} with message: ${data.message}`,
          );
        }
        throw new Error(
          `Server returns ${status} with body: ${JSON.stringify(data)}`,
        );
      }
      throw err;
    }
  });
};

const connect = async (address: string | AddressInfo): Promise<Browser> => {
  let addr = address;
  if (typeof address !== "string") {
    addr = `${address.address}:${address.port}`;
  }

  let attempt = 1;
  for (;;) {
    try {
      await axios.get(`http://${addr}/health`);
    } catch (err) {
      if (attempt >= 3) {
        throw err;
      }
      attempt++;

      await setTimeout(500);
      continue;
    }
    break;
  }

  return createAPIs(async (method, args) => {
    try {
      const url = `http://${addr}/api/${method}`;
      const json = { args };
      const resp = await axios.post(url, json);
      return resp.data;
    } catch (err) {
      if (axios.isAxiosError(err) && err.response) {
        const { status, data } = err.response;
        if (hasMessage(data)) {
          throw new Error(
            `Server returns ${status} with message: ${data.message}`,
          );
        }
        throw new Error(
          `Server returns ${status} with body: ${JSON.stringify(data)}`,
        );
      }
      throw err;
    }
  });
};

export { createRemoteAPIs, connect };
