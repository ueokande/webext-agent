import type { Readable, Writable } from "node:stream";
import { start as startServer } from "./server";
import { RPCClientImpl } from "./rpc";
import pino, { type Logger } from "pino";
import { LogDiscovery } from "../discovery/logs";
import { EndpointDiscovery } from "../discovery/endpoints";

type Options = {
  addonId: string;
  port?: number;
  dataDir: string;
  stdin: Readable;
  stdout: Writable;
};

const scheduleGracefulShutdown = (
  server: { close: () => Promise<void> },
  logger: Logger,
) => {
  ["SIGINT", "SIGTERM"].forEach((signal) => {
    process.on(signal, async () => {
      setTimeout(() => {
        logger.error("Could not close server gracefully");
        process.exit(1);
      }, 3000);
      await server.close();
      process.exit();
    });
  });
};

export class Application {
  private readonly opts: Options;
  private readonly rpc: RPCClientImpl;
  private readonly logDiscovery: LogDiscovery;
  private readonly endpointDiscovery: EndpointDiscovery;

  constructor(opts: Options) {
    this.logDiscovery = new LogDiscovery(opts.dataDir);
    this.endpointDiscovery = new EndpointDiscovery(opts.dataDir);
    this.opts = opts;
    this.rpc = new RPCClientImpl(opts.stdin, opts.stdout);
  }

  async run() {
    const logFile = await this.logDiscovery.touchLog(this.opts.addonId);
    const logger = pino(
      { timestamp: pino.stdTimeFunctions.isoTime },
      pino.destination(logFile),
    );
    this.rpc.start();
    this.rpc.on("error", (err: Error) => {
      logger.error(err);
    });
    const server = await startServer(this.opts.port, this.rpc, logger);
    server.addHook("onListen", async () => {
      const addresses = server
        .addresses()
        .filter((addr) => addr.family === "IPv4");
      if (addresses.length === 0) {
        throw new Error("Server did not listen with IPv4");
      }
      await this.endpointDiscovery.installAddon(
        this.opts.addonId,
        addresses[0],
      );
    });
    server.addHook("onClose", async () => {
      await this.endpointDiscovery.uninstallAddon(this.opts.addonId);
    });

    scheduleGracefulShutdown(server, logger);

    process.stderr.write(
      `This application is a agent server for webext-agent and does not expect run manually
You can see server logs at the following path:

  ${logFile}

`,
    );
  }
}
