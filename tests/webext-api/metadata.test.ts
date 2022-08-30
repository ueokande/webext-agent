import {
  getNamespaces,
  getMethods,
  getAllMethods,
} from "../../src/webext-api/metadata";

describe("getNamespaces", () => {
  test("should contains some namespace", () => {
    const namespaces = getNamespaces();
    expect(namespaces).toContain("tabs");
    expect(namespaces).toContain("bookmarks");
    expect(namespaces).not.toContain("xxx");
  });
});

describe("getMethods", () => {
  test("should contains some methods", () => {
    expect(getMethods("tabs")).toContain("query");
    expect(getMethods("bookmarks")).toContain("create");
  });
});

describe("getAllMethods", () => {
  test("should contains some methods", () => {
    const allMethods = getAllMethods();
    expect(allMethods).toContain("tabs.query");
    expect(allMethods).toContain("bookmarks.create");
  });
});
