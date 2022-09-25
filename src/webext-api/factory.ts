type JSONValue =
  | string
  | number
  | boolean
  | { [x: string]: JSONValue }
  | Array<JSONValue>;

type ApiCallback = (method: string, args: JSONValue[]) => Promise<JSONValue>;
type Browser = typeof browser;

const mockFunction = () => {};

const proxyGetHandler = (path: string, f: ApiCallback): any => {
  return new Proxy(mockFunction, {
    get: (_target: unknown, prop: symbol | string) => {
      if (prop.toString() === "then") {
        return undefined;
      }
      const newPath =
        path === "" ? prop.toString() : path + "." + prop.toString();
      return proxyGetHandler(newPath, f);
    },
    apply: (_target, that, args: JSONValue[]) => {
      return f.call(that, path, args);
    },
  });
};

// TODO some APIs in runtime namespace have synchronouse methods
const createAPIs = (f: ApiCallback): Browser => {
  const browser = proxyGetHandler("", f) as any;
  return browser as Browser;
};

export { createAPIs };
