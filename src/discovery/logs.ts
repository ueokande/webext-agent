import path from "node:path";
import os from "node:os";
import fs from "node:fs/promises";
import { v4 as uuidv4 } from "uuid";
import { z } from "zod";
import { AddonLocation } from "./types";

const DEFAULT_LOG_DIR = path.join(os.tmpdir(), "webext-agent", "logs");
const STATE_FILENAME = "state.json";

const LogStateSchemaV1 = z.object({
  version: z.literal(1),
  entries: z.array(
    z.object({
      profilePath: z.string(),
      addonId: z.string(),
      logPath: z.string(),
    }),
  ),
});

type LogStateSchemaV1 = z.infer<typeof LogStateSchemaV1>;

export class LogDiscovery {
  constructor(private readonly logDir: string = DEFAULT_LOG_DIR) {}

  async resolvePath({
    profilePath,
    addonId,
  }: AddonLocation): Promise<string | null> {
    const state = await this.loadOrCreateState();
    const entry = state.entries.find(
      (entry) => entry.profilePath === profilePath && entry.addonId === addonId,
    );
    if (entry) {
      return entry.logPath;
    }
    return null;
  }

  async touchLog({ profilePath, addonId }: AddonLocation): Promise<string> {
    const state = await this.loadOrCreateState();
    const entry = state.entries.find(
      (entry) => entry.profilePath === profilePath && entry.addonId === addonId,
    );
    if (entry) {
      return entry.logPath;
    }

    const logPath = path.join(this.logDir, `${uuidv4()}.log`);
    state.entries.push({ profilePath, addonId, logPath });
    await this.saveState(state);
    await fs.appendFile(logPath, Buffer.from([]));
    return logPath;
  }

  private async loadOrCreateState(): Promise<LogStateSchemaV1> {
    const content = await (async () => {
      try {
        return await fs.readFile(
          path.join(this.logDir, STATE_FILENAME),
          "utf-8",
        );
      } catch (e: any) {
        if (e.code === "ENOENT") {
          return null;
        }
        throw e;
      }
    })();
    if (content === null) {
      return { version: 1, entries: [] };
    }
    return LogStateSchemaV1.parse(JSON.parse(content));
  }

  private async saveState(state: LogStateSchemaV1): Promise<void> {
    const tmpfile = path.join(this.logDir, `${STATE_FILENAME}.tmp`);
    await fs.mkdir(this.logDir, { recursive: true });
    await fs.writeFile(tmpfile, JSON.stringify(state));
    await fs.rename(tmpfile, path.join(this.logDir, STATE_FILENAME));
  }
}
