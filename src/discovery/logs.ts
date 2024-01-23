import path from "node:path";
import fs from "node:fs/promises";
import { v4 as uuidv4 } from "uuid";
import { z } from "zod";

const LOG_DIRNAME = "logs";
const STATE_FILENAME = "log-state.json";

const LogStateSchemaV1 = z.object({
  version: z.literal(1),
  entries: z.array(
    z.object({
      addonId: z.string(),
      logPath: z.string(),
    }),
  ),
});

type LogStateSchemaV1 = z.infer<typeof LogStateSchemaV1>;

export class LogDiscovery {
  private readonly logDir: string;
  private readonly stateFile: string;

  constructor(dataDir: string) {
    this.logDir = path.join(dataDir, LOG_DIRNAME);
    this.stateFile = path.join(dataDir, STATE_FILENAME);
  }

  async resolvePath(addonId: string): Promise<string | null> {
    const state = await this.loadOrCreateState();
    const entry = state.entries.find((entry) => entry.addonId === addonId);
    if (entry) {
      return entry.logPath;
    }
    return null;
  }

  async touchLog(addonId: string): Promise<string> {
    const state = await this.loadOrCreateState();
    const entry = state.entries.find((entry) => entry.addonId === addonId);
    if (entry) {
      return entry.logPath;
    }

    const logPath = path.join(this.logDir, `${uuidv4()}.log`);
    state.entries.push({ addonId, logPath });
    await this.saveState(state);
    await fs.mkdir(path.dirname(logPath), { recursive: true });
    await fs.appendFile(logPath, Buffer.from([]));
    return logPath;
  }

  private async loadOrCreateState(): Promise<LogStateSchemaV1> {
    const content = await (async () => {
      try {
        return await fs.readFile(this.stateFile, "utf-8");
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
    const tmpfile = `${this.stateFile}.${process.pid}`;
    await fs.mkdir(path.dirname(this.stateFile), { recursive: true });
    await fs.writeFile(tmpfile, JSON.stringify(state));
    await fs.rename(tmpfile, this.stateFile);
  }
}
