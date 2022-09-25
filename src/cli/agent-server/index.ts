import { program } from "commander";
import { Application } from "../../agent-server";
import pino from "pino";
import path from "node:path";

const defaultPort = 12345;
const logPath = path.resolve("/tmp/webext-agent.log");

program.option(
  "-p, --port <number>",
  `Port number to be listen on (defualt: ${defaultPort})`
);
program.parse();

const opts = program.opts();
const port = Number(opts.port ?? defaultPort);

if (isNaN(port)) {
  console.error("invalid option --port");
  process.exit(2);
}

process.stderr.write(
  `This application is a agent server for webext-agent and does not expect run manually
You can see server logs at the following path:

  ${logPath}

`
);

const app = new Application({
  port,
  logger: pino(
    {
      timestamp: pino.stdTimeFunctions.isoTime,
    },
    pino.destination(logPath)
  ),
  stdin: process.stdin,
  stdout: process.stdout,
});
app.run();
