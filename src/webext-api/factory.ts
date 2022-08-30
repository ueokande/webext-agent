import {
  type NamespaceName,
  type MethodName,
  getNamespaces,
  getMethods,
} from "./metadata";

type JSONValue =
  | string
  | number
  | boolean
  | { [x: string]: JSONValue }
  | Array<JSONValue>;

type ApiFunction = (...args: JSONValue[]) => Promise<JSONValue>;
type ApiCallback = (method: string, args: JSONValue[]) => Promise<JSONValue>;

type WebExtApi = {
  [ns in NamespaceName]: {
    [method in MethodName<ns>]: ApiFunction;
  };
};

const createAPIs = (f: ApiCallback) => {
  return Object.fromEntries(
    getNamespaces().map((ns) => [
      ns,
      Object.fromEntries(
        getMethods(ns).map((method) => [
          method,
          (args: JSONValue[]) => f(ns + "." + method, args),
        ])
      ),
    ])
  ) as WebExtApi;
};

export { createAPIs };
