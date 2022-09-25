import * as path from "node:path";
import { firefox, Browser } from "playwright";
import { withExtension } from "playwright-webextext";
import {
  createAgentAddon,
  createMixedInAgentAddon,
  connect,
  type Addon,
} from "../../src";

describe("bare agent addon", () => {
  let addon: Addon;
  let browserContext: Browser;

  beforeEach(async () => {
    addon = await createAgentAddon({ additionalPermissions: ["tabs"] });

    const browserTypeWithExtension = withExtension(firefox, addon.getRoot());
    browserContext = await browserTypeWithExtension.launch();
  });

  afterEach(async () => {
    await addon.clean();
    await browserContext.close();
  });

  test("firefox starts with a bare agent addon", async () => {
    const page = await browserContext.newPage();
    await page.goto("https://example.com/");

    const browser = await connect("127.0.0.1:12345");
    const tabs = await browser.tabs.query({});

    expect(tabs).toHaveLength(1);
    expect(tabs[0].url).toBe("https://example.com/");
  });
});

describe("mixed-in agent addon", () => {
  let addon: Addon;
  let browserContext: Browser;

  beforeEach(async () => {
    addon = await createMixedInAgentAddon(
      path.join(__dirname, "testdata/deadbeef-addon")
    );

    const browserTypeWithExtension = withExtension(firefox, addon.getRoot());
    browserContext = await browserTypeWithExtension.launch();
  });

  afterEach(async () => {
    await addon.clean();
    await browserContext.close();
  });

  test("firefox starts with a mixed-in addon", async () => {
    const page = await browserContext.newPage();
    await page.goto("https://example.com/");

    const browser = await connect("127.0.0.1:12345");
    expect(await browser.storage.local.get("string")).toEqual({
      string: "dead beef",
    });
    expect(await browser.storage.local.get("number")).toEqual({
      number: 0xdeadbeef,
    });
  });
});
