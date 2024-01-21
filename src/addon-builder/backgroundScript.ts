import * as path from "node:path";

const BACKGROUND_SCRIPT_TEMPLATE = path.join(
  __dirname,
  "..",
  "..",
  "resources",
  "background_script_template.js",
);

const getTemplatePath = () => BACKGROUND_SCRIPT_TEMPLATE;

export { getTemplatePath };
