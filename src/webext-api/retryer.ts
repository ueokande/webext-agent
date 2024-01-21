import { setTimeout } from "node:timers/promises";

type RetryOptions = {
  interval: number;
  attempts: number;
};

const retryer = async <R>(
  f: () => R | Promise<R>,
  opts: RetryOptions,
): Promise<R> => {
  let attempt = 1;
  for (;;) {
    try {
      return await f();
    } catch (err) {
      if (attempt >= opts.attempts) {
        throw err;
      }
      attempt++;

      await setTimeout(opts.interval);
      continue;
    }
  }
};

export { RetryOptions, retryer };
