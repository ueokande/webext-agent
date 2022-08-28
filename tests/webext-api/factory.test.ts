import { createAPIs } from "../../src/webext-api/factory";

describe("createAPIs", () => {
  test("it creates APIs", async () => {
    const apis = createAPIs((method, args) => {
      return Promise.resolve({ method, args });
    });

    expect(await apis.tabs.query({ currentWindow: true })).toEqual({
      method: "tabs.query",
      args: [{ currentWindow: true }],
    });
    expect(await apis.bookmarks.create({ title: "my item" })).toEqual({
      method: "bookmarks.create",
      args: [{ title: "my item" }],
    });
  });
});
