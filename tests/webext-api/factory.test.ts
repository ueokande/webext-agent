import { createAPIs } from "../../src/webext-api/factory";

describe("createAPIs", () => {
  test("it creates APIs", async () => {
    const browser = createAPIs((method, args) => {
      return Promise.resolve({ method, args });
    });

    expect(await browser.tabs.query({ currentWindow: true })).toEqual({
      method: "tabs.query",
      args: [{ currentWindow: true }],
    });
    expect(await browser.storage.local.get("storage-key")).toEqual({
      method: "storage.local.get",
      args: ["storage-key"],
    });
  });

  test("it resolved by promise", async () => {
    const browser = createAPIs((method, args) => {
      return Promise.resolve({ method, args });
    });

    const browser2 = await Promise.resolve(browser);
    expect(browser2).toBeTruthy();
  });
});
