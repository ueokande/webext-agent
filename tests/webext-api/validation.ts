import { methodExists, validateArgs, ValidationError } from "../../src/webext-api/validation";

describe("methodExists", () => {
  test("it should returns true if a method exists", () => {
    expect(methodExists("tabs.query")).toBeTruthy()
    expect(methodExists("bookmarks.create")).toBeTruthy()
    expect(methodExists("bookmarks.harakiri")).toBeFalsy();
  });
});

describe("validateArgs", () => {
  test("it should not throw any errors with valid args", () => {
    validateArgs("tabs.query", 1);
    validateArgs("bookmarks.create", 1);
  });

  test("it should throw an error with invalid args", () => {
    expect(() => validateArgs("tabs.query", 0)).toThrowError(ValidationError)
    expect(() => validateArgs("bookmarks.create", 3)).toThrowError(ValidationError);
  });
});
