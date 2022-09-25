import type { Readable, Writable } from "node:stream";
import { start as startServer } from "./server";
import { RPCClientImpl } from "./rpc";
import { type Logger } from "pino";

type Options = {
  port: number;
  stdin: Readable;
  stdout: Writable;
  logger: Logger;
};

export class Application {
  private readonly opts: Options;
  private readonly rpc: RPCClientImpl;

  constructor(opts: Options) {
    this.opts = opts;
    this.rpc = new RPCClientImpl(opts.stdin, opts.stdout);
  }

  run() {
    this.rpc.start();
    this.rpc.on("error", (err: Error) => {
      this.opts.logger.error(err);
    });
    startServer(this.opts.port, this.rpc, this.opts.logger);
  }
}
