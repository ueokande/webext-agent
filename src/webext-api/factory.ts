type JSONValue =
  | string
  | number
  | boolean
  | { [x: string]: JSONValue }
  | Array<JSONValue>;

type ApiCallback = (method: string, args: JSONValue[]) => Promise<JSONValue>;
type Browser = typeof browser;

// TODO some APIs in runtime namespace have synchronouse methods
const createAPIs = (f: ApiCallback): Browser => {
  const namespaces = new Proxy(
    {},
    {
      get(_target, prop) {
        return new Proxy(
          { namespace: prop },
          {
            get(target, prop) {
              return (...args: JSONValue[]) => {
                return f(`${String(target.namespace)}.${String(prop)}`, args);
              };
            },
          }
        );
      },
    }
  );
  return namespaces as Browser;
};

export { createAPIs };
