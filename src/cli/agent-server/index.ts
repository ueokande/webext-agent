import * as os from "node:os";
import path from "node:path";
import { program } from "commander";
import { Application } from "../../agent-server";

const DEFAULT_DATA_DIR = path.join(os.tmpdir(), "webext-agent");

program
  .argument("<manifest>", "Path to native messaging manifest")
  .argument("<addon_id>", "Addon ID")
  .option("-p, --port <number>", `Port number to be listen on`)
  .option("-d, --data-dir <path>", `Path to data directory`, DEFAULT_DATA_DIR)
  .parse();

const opts = program.opts();

if (typeof opts.port !== "undefined" && isNaN(Number(opts.port))) {
  console.error("invalid option --port");
  process.exit(2);
}

const app = new Application({
  addonId: program.args[1],
  port: opts.port,
  dataDir: opts.dataDir,
  stdin: process.stdin,
  stdout: process.stdout,
});
app.run();
