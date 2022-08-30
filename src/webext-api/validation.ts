import ApiMetadata from "./api-metadata.json";
import { getAllMethods } from "./metadata";

export class ValidationError extends Error {}

type MethodArgs = {
  minArgs: number;
  maxArgs: number;
};

type Metadata = typeof ApiMetadata;
type NamespaceName = keyof Metadata;

const allMethods = new Set(getAllMethods());

export const methodExists = (fullMethodName: string): boolean => {
  return allMethods.has(fullMethodName);
};

const methodArgs = (fullMethodName: string): MethodArgs => {
  const words = fullMethodName.split(".");
  if (words.length != 2) {
    throw new Error(`invalid method name: ${fullMethodName}`);
  }
  const [namespaceName, methodName] = words;
  const ns = ApiMetadata[namespaceName as NamespaceName] as any;
  if (typeof ns === "undefined") {
    throw new Error(`namespace ${namespaceName} not found`);
  }
  const args = ns[methodName];
  if (typeof args === "undefined") {
    throw new Error(`${fullMethodName} not found`);
  }
  return args;
};

export const validateArgs = (fullMethodName: string, numArgs: number): void => {
  const { minArgs, maxArgs } = methodArgs(fullMethodName);
  if (numArgs < minArgs) {
    throw new ValidationError(
      `${fullMethodName}() expected the minimum number of arguments ${minArgs} but actual is ${numArgs}`
    );
  }
  if (maxArgs < numArgs) {
    throw new ValidationError(
      `${fullMethodName}() expected the maxium number of arguments is ${maxArgs} but actual is ${numArgs}`
    );
  }
};
