"use strict";

const APP_NAME = "demo.ueokande.webext_agent";
const port = browser.runtime.connectNative(APP_NAME);
const newResponse = (id, result) => {
  return {
    id,
    result,
    success: true,
  };
};
const newErrorResponse = (id, err) => {
  return {
    id,
    error: {
      message: err.message,
    },
    success: false,
  };
};

const onMessage = ({ method, args }) => {
  method = "browser." + method;
  let keys = method.split(".");
  if (keys[0] !== "browser") {
    throw new Error("unknown method: " + method);
  }
  keys = keys.slice(1);
  let f = browser;
  for (const key of keys) {
    f = f[key];
    if (typeof f !== "object" && typeof f !== "function") {
      throw new Error("unknown method: " + method);
    }
  }
  if (typeof f !== "function") {
    throw new Error("unknown method: " + method);
  }
  console.log(
    `invoke: ${method}(${args.map((x) => JSON.stringify(x)).join(",")})`
  );
  return f(...args);
};

port.onMessage.addListener(async (request) => {
  console.log(JSON.stringify(request));
  const id = request.id;
  try {
    const result = await onMessage(request.message);
    port.postMessage(newResponse(id, result));
  } catch (e) {
    console.error(e);
    port.postMessage(newErrorResponse(id, e));
  }
});

port.onDisconnect.addListener((p) => {
  if (p.error) {
    console.error("Disconnected due to an error:", p.error);
  }
});
