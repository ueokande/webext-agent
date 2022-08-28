import Ajv from "ajv";
import {
  RequestSchema,
  ResponseSchema,
  ErrorSchema,
} from "../../src/agent-server/schema";

const ajv = new Ajv(); // options can be passed, e.g. {allErrors: true}

describe("RequestSchema", () => {
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

  test("returns errors on invalid payload", () => {
    const valid = ajv.validate(RequestSchema, {});
    expect(valid).toBeFalsy();
  });
});

describe("ResponseSchema", () => {
  test("pass valid result payload", () => {
    const valid = ajv.validate(ResponseSchema, [
      {
        id: 10,
        active: true,
      },
      {
        id: 20,
        active: false,
      },
    ]);
    expect(valid).toBeTruthy();
  });
});

describe("ErrorSchema", () => {
  test("pass valid error payload", () => {
    const valid = ajv.validate(ErrorSchema, {
      message: "an error",
    });
    expect(valid).toBeTruthy();
  });

  test("returns errors on invalid payload", () => {
    const valid = ajv.validate(ErrorSchema, {});
    expect(valid).toBeFalsy();
  });
});
