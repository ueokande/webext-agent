import { retryer } from "../../src/webext-api/retryer";

test("should retry until callback succeeds", async () => {
  let attempts = 0;
  await retryer(
    () => {
      attempts++;
      if (attempts == 5) {
        return;
      }
      throw new Error("should retry");
    },
    { interval: 0, attempts: 10 },
  );

  expect(attempts).toBe(5);
});

test("should retry until async callback succeeds", async () => {
  let attempts = 0;
  await retryer(
    async () => {
      attempts++;
      if (attempts == 5) {
        return;
      }
      throw new Error("should retry");
    },
    { interval: 0, attempts: 10 },
  );

  expect(attempts).toBe(5);
});

test("should retires when callback fails", async () => {
  let attempts = 0;
  await expect(
    retryer(
      () => {
        attempts++;
        throw new Error("should retry");
      },
      { interval: 0, attempts: 10 },
    ),
  ).rejects.toThrow("should retry");

  expect(attempts).toBe(10);
});

test("should retires when async callback fails", async () => {
  let attempts = 0;
  await expect(async () => {
    await retryer(
      async () => {
        attempts++;
        throw new Error("should retry");
      },
      { interval: 0, attempts: 10 },
    );
  }).rejects.toThrow("should retry");

  expect(attempts).toBe(10);
});
