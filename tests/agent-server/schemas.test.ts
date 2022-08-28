import Ajv from "ajv";
import { RequestSchema, ResponseSchema } from "../../src/agent-server/schema";

const ajv = new Ajv(); // options can be passed, e.g. {allErrors: true}

describe("requestSchema", () => {
  test("pass valid payload", () => {
    const valid = ajv.validate(RequestSchema, {
      args: [
        {
          currentWindow: true,
        },
      ],
    });
    expect(valid).toBeTruthy();
  });

  test("returns errors invalid payload", () => {
    const valid = ajv.validate(RequestSchema, {});
    expect(valid).toBeFalsy();
  });
});

describe("responseSchema", () => {
  test("pass valid result payload", () => {
    const valid = ajv.validate(ResponseSchema, {
      result: [
        {
          id: 10,
          active: true,
        },
        {
          id: 20,
          active: false,
        },
      ],
    });
    expect(valid).toBeTruthy();
  });

  test("pass valid error payload", () => {
    const valid = ajv.validate(ResponseSchema, {
      error: {
        message: "foo",
      },
    });
    expect(valid).toBeTruthy();
  });

  test("returns errors invalid payload", () => {
    const valid = ajv.validate(ResponseSchema, {});
    expect(valid).toBeFalsy();
  });
});
