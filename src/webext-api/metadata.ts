import ApiMetadata from "./api-metadata.json";

type Metadata = typeof ApiMetadata;
export type NamespaceName = keyof Metadata;
export type MethodName<N extends NamespaceName> = keyof Metadata[N];

const fullMethodNames = Object.entries(ApiMetadata)
  .map(([namespaces, methods]) =>
    Object.keys(methods).map((method) => namespaces + "." + method)
  )
  .flat();

export const getAllMethods = (): string[] => {
  return fullMethodNames;
};

export const getNamespaces = (): NamespaceName[] => {
  return Object.keys(ApiMetadata) as NamespaceName[];
};

export const getMethods = <N extends NamespaceName>(ns: N): MethodName<N>[] => {
  return Object.keys(ApiMetadata[ns]) as MethodName<N>[];
};

export const isNamespaceName = (name: string): name is NamespaceName => {
  return Object.keys(ApiMetadata).includes(name);
};
