import * as os from "node:os";
import * as fs from "node:fs";
import * as path from "node:path";
import { firefox, Browser } from "playwright";
import { withExtension } from "playwright-webextext";
import { createAgentAddon, createMixedInAgentAddon, connect } from "../../src";

describe("bare agent addon", () => {
  let root: string;
  let browserContext: Browser;

  beforeEach(async () => {
    root = await fs.promises.mkdtemp(
      path.join(os.tmpdir(), "webext-agent-addon-"),
    );

    const addon = await createAgentAddon(root, {
      additionalPermissions: ["tabs"],
      addonId: "bareaddon@example.com",
    });

    const browserTypeWithExtension = withExtension(firefox, addon.getRoot());
    browserContext = await browserTypeWithExtension.launch();
  });

  afterEach(async () => {
    await browserContext.close();
    await fs.promises.rm(root, { recursive: true });
  });

  test("firefox starts with a bare agent addon", async () => {
    const page = await browserContext.newPage();
    await page.goto("https://example.com/");

    const browser = await connect("bareaddon@example.com");
    const tabs = await browser.tabs.query({});

    expect(tabs).toHaveLength(1);
    expect(tabs[0].url).toBe("https://example.com/");
  });
});

describe("mixed-in agent addon", () => {
  let root: string;
  let browserContext: Browser;

  beforeEach(async () => {
    root = await fs.promises.mkdtemp(
      path.join(os.tmpdir(), "webext-agent-addon-"),
    );
    const addon = await createMixedInAgentAddon(
      path.join(__dirname, "testdata/deadbeef-addon"),
      root,
    );

    const browserTypeWithExtension = withExtension(firefox, addon.getRoot());
    browserContext = await browserTypeWithExtension.launch();
  });

  afterEach(async () => {
    await browserContext.close();
    await fs.promises.rm(root, { recursive: true });
  });

  test("firefox starts with a mixed-in addon", async () => {
    const page = await browserContext.newPage();
    await page.goto("https://example.com/");

    const browser = await connect("deadbeef@example.com");
    expect(await browser.storage.local.get("string")).toEqual({
      string: "dead beef",
    });
    expect(await browser.storage.local.get("number")).toEqual({
      number: 0xdeadbeef,
    });
  });
});
