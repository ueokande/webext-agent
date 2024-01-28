import axios from "axios";
import type { AddressInfo } from "node:net";
import path from "node:path";
import os from "node:os";
import { retryer } from "./retryer";
import { createAPIs } from "./factory";
import { EndpointDiscovery } from "../discovery/endpoints";

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

type ConnectOptions = {
  attempts?: number;
  dataDir?: string;
};

const DefaultConnectOptions = {
  attempts: 3,
  dataDir: path.join(os.tmpdir(), "webext-agent"),
};

const connect = async (
  location: string | AddressInfo,
  {
    attempts = DefaultConnectOptions.attempts,
    dataDir = DefaultConnectOptions.dataDir,
  }: ConnectOptions = DefaultConnectOptions,
): Promise<Browser> => {
  const discoverAddress = async () => {
    if (typeof location !== "string") {
      return `${location.address}:${location.port}`;
    }

    const [, port] = location.split(":");
    if (!Number.isNaN(Number(port))) {
      return location;
    }
    const endpointDiscovery = new EndpointDiscovery(dataDir);
    const addr = await endpointDiscovery.resolveEndpoint(location);
    if (addr === null) {
      throw new Error(`Cannot resolve endpoint for ${location}`);
    }
    return `${addr.address}:${addr.port}`;
  };

  let address: string;
  await retryer(
    async () => {
      address = await discoverAddress();
      await axios.get(`http://${address}/health`);
    },
    { interval: 500, attempts },
  );

  return createAPIs(async (method, args) => {
    try {
      const url = `http://${address}/api/${method}`;
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
