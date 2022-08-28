import type { Readable, Writable } from "node:stream";
import { EventEmitter } from "node:events";
import { v4 as uuidv4 } from "uuid";

type RPCRequest = {
  id: string;
  message: unknown;
};

type RPCResponse = {
  id: string;
  success: boolean;
  result: unknown;
  error: { message: string };
};

type Deferred = {
  resolve: (value: any) => void;
  reject: (err: unknown) => void;
};

export interface RPCClient {
  request(message: unknown): Promise<unknown>;
}

export class RPCClientImpl extends EventEmitter implements RPCClient {
  private incoming: Buffer = Buffer.alloc(0);
  private payloadSize: number | null = null;
  private pending: Array<{ request: RPCRequest; deferred: Deferred }> = [];
  private readonly active: Map<string, Deferred> = new Map();
  private readonly readable: Readable;
  private readonly writable: Writable;

  private readonly _onReadable = () => this.onReadable();
  private readonly _onClose = () => this.onClose();
  private readonly _onError = (err: Error) => this.onError(err);

  constructor(r: Readable, w: Writable) {
    super();

    this.readable = r;
    this.writable = w;
  }

  start() {
    this.readable.on("readable", this._onReadable);
    this.readable.on("close", this._onClose);
    this.readable.on("error", this._onError);
  }

  stop() {
    this.readable.off("readable", this._onReadable);
    this.readable.off("error", this._onError);
    this.rejectAllRequests(new Error("RPC closed"));
  }

  private rejectAllRequests(error: Error) {
    for (const activeDeferred of Array.from(this.active.values())) {
      activeDeferred.reject(error);
    }
    this.active.clear();

    for (const { deferred } of this.pending) {
      deferred.reject(error);
    }
    this.pending = [];
  }

  async request(message: unknown): Promise<unknown> {
    const id = uuidv4();
    const request = { id, message };

    return new Promise((resolve, reject) => {
      const deferred = { resolve, reject };
      this.pending.push({ request, deferred });
      this.flushPendingRequests();
    });
  }

  private flushPendingRequests() {
    this.pending = this.pending.filter(({ request, deferred }) => {
      if (this.active.has(request.id)) {
        return true;
      }

      try {
        this.sendRequenceOnce(request);
        this.active.set(request.id, deferred);
      } catch (err) {
        deferred.reject(err);
      }
      return false;
    });
  }

  private handleMessage(content: Buffer) {
    let response: RPCResponse;
    try {
      const json = JSON.parse(content.toString());
      if (!Object.prototype.hasOwnProperty.call(json, "id")) {
        throw new Error("Missing 'id' field");
      }
      if (!Object.prototype.hasOwnProperty.call(json, "success")) {
        throw new Error("Missing 'success' field");
      }
      response = json;
    } catch (error) {
      this.emit("error", new Error(`Error parsing RPC response: ${error}`));
      return;
    }

    const deferred = this.active.get(response.id);
    if (!deferred) {
      return;
    }

    this.active.delete(response.id);
    if (response.success) {
      deferred.resolve(response.result);
    } else {
      deferred.reject(new Error(response.error.message));
    }
  }

  private sendRequenceOnce(request: RPCRequest) {
    const dataBytes = Buffer.from(JSON.stringify(request));
    const lenBytes = Buffer.alloc(4);
    lenBytes.writeUInt32LE(dataBytes.length, 0);

    this.writable.write(lenBytes);
    this.writable.write(dataBytes);
  }

  private onReadable() {
    let chunk = null;
    while ((chunk = this.readable.read()) !== null) {
      this.incoming = Buffer.concat([this.incoming, chunk]);
    }

    if (this.incoming.length < 4) {
      return;
    }
    if (this.payloadSize === null) {
      this.payloadSize = this.incoming.readUInt32LE(0);
    }

    if (this.incoming.length >= this.payloadSize + 4) {
      const content = this.incoming.slice(4, this.payloadSize + 4);

      this.payloadSize = null;
      this.incoming = Buffer.alloc(0);

      this.handleMessage(content);
    }
  }

  private onClose() {
    this.emit("close");
  }

  private onError(error: Error) {
    this.emit("error", error);
  }
}
