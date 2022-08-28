import { RPCClientImpl } from "../../src/agent-server/rpc";
import { PassThrough } from "node:stream";

describe("RPCClientImpl", () => {
  test("should process a RPC message", async () => {
    const stdin = new PassThrough();
    const stdout = new PassThrough();
    stdout.on("data", (data: Buffer) => {
      if (data.length === 4) {
        // skip header
        return;
      }
      const json = JSON.parse(data.toString());
      expect(typeof json.id).toBe("string");
      expect(json.message).toEqual({ type: "twice", value: 10 });

      const resp = {
        id: json.id,
        success: true,
        result: json.message.value * 2,
      };
      const dataBytes = Buffer.from(JSON.stringify(resp));
      const lenBytes = Buffer.alloc(4);
      lenBytes.writeUInt32LE(dataBytes.length, 0);

      stdin.write(lenBytes);
      stdin.write(dataBytes);
    });

    const rpc = new RPCClientImpl(stdin, stdout);
    rpc.on("error", (err) => {
      throw err;
    });
    rpc.start();

    const resp = await rpc.request({ type: "twice", value: 10 });
    expect(resp).toEqual(20);
  });

  test("should throw an error with failure response", async () => {
    jest.retryTimes(0);

    const stdin = new PassThrough();
    const stdout = new PassThrough();
    stdout.on("data", (data: Buffer) => {
      if (data.length === 4) {
        // skip header
        return;
      }
      const json = JSON.parse(data.toString());
      expect(typeof json.id).toBe("string");
      expect(json.message).toEqual({ type: "twice", value: 10 });

      const resp = {
        id: json.id,
        success: false,
        error: { message: "operation failure" },
      };
      const dataBytes = Buffer.from(JSON.stringify(resp));
      const lenBytes = Buffer.alloc(4);
      lenBytes.writeUInt32LE(dataBytes.length, 0);

      stdin.write(lenBytes);
      stdin.write(dataBytes);
    });

    const rpc = new RPCClientImpl(stdin, stdout);
    rpc.on("error", (err) => {
      throw err;
    });
    rpc.start();

    await expect(() =>
      rpc.request({ type: "twice", value: 10 })
    ).rejects.toThrowError("operation failure");
  });

  test("emits an error on invalid json", async () => {
    const stdin = new PassThrough();
    const stdout = new PassThrough();
    stdout.on("data", (data: Buffer) => {
      if (data.length === 4) {
        // skip header
        return;
      }
      const dataBytes = Buffer.from("<invalid json>");
      const lenBytes = Buffer.alloc(4);
      lenBytes.writeUInt32LE(dataBytes.length, 0);

      stdin.write(lenBytes);
      stdin.write(dataBytes);
    });

    const rpc = new RPCClientImpl(stdin, stdout);
    rpc.on("error", (err) => {
      expect(err).toBeInstanceOf(Error);
      expect(err.message).toEqual(expect.stringMatching("Unexpected token"));
    });
    rpc.start();

    rpc.request({});
  });

  test("emits an error on invalid message", async () => {
    const stdin = new PassThrough();
    const stdout = new PassThrough();
    stdout.on("data", (data: Buffer) => {
      if (data.length === 4) {
        // skip header
        return;
      }
      const dataBytes = Buffer.from("{}");
      const lenBytes = Buffer.alloc(4);
      lenBytes.writeUInt32LE(dataBytes.length, 0);

      stdin.write(lenBytes);
      stdin.write(dataBytes);
    });

    const rpc = new RPCClientImpl(stdin, stdout);
    rpc.on("error", (err) => {
      expect(err).toBeInstanceOf(Error);
      expect(err.message).toEqual(expect.stringMatching("Missing 'id' field"));
    });
    rpc.start();

    rpc.request({});
  });
});
