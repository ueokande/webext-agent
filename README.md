# webext-agent

The webext-agent is a browser extension that enables remote access to
WebExtensions APIs.   It helps you for automating browser integration and
testing.

## Installation

Install by npm:

```console
$ npm install --save webext-agent  # npm
$ yarn add webext-agent            # yarn
$ pnpx webext-agent install        # pnpm
```

## Preparation

The webext-agent access the browser via [native messaging][].  It requires a
native messaging manifest to be installed to the local.  The webext-agent does
not install the manifest automatically due to the security reason.  You can
install it manually by the following command:

```console
$ webext-agent install --addon-ids my-addon1@example.com,my-addon2@example.com,...
```

[native messaging]: https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/Native_messaging

## Quick start

Create a new agent add-on:

```console
$ webext-agent create-addon \
    --additional-permissions tabs
    --addon-id my-addon@example.com
    /tmp/my-agent-addon
```

and load it via `about:config` on your Firefox browser.
The agent server starts and you can access APIs by the following JavaScript/TypeScript:

```javascript
const { connect } = require("webext-agent");

(async () => {
  const browser = await connect("my-addon@example.com");
  const tabs = await browser.tabs.query({});

  tabs.forEach((tab) => {
    console.log("[%d] %s - %s", tab.id, tab.title, tab.url)
  })
})();
```

## CLI

### install

Install a native messaging manifest to the local

```console
$ webext-agent install --addon-ids my-addon1@example.com,my-addon2@example.com,...
```

### uninstall

Uninstall the installed native messaging manifest from the local.

```console
$ webext-agent uninstall
```

### check

Check if the native message manifest is installed.

```console
$ webext-agent install
```

### create-addon

Create a new agent add-on.

```console
$ webext-agent create-addon
    --additional-permissions <permission1>,<permission2>,...
    --addon-id <addon-id>
    [--base-addon <base-addon>]
    <destination>
```

You can mix-in an agent add-on with your add-ons by `--base-addon` option.
This is useful to debug or access the internal storage on your add-on.

## JavaScript/TypeScript API

webext-agent also provides programmatic APIs.

### createAgentAddon(destination[, options])

- `destination` Destination directory to create an agent add-on.
- `options`
    - `additionalPermissions` Additional permissions to be added to the add-on.

```typescript
import { createAgentAddon } from "webext-agent";

const addon = await createAgentAddon("/tmp/my-agent-addon");

console.log(addon.getRoot());
```

### createMixedInAgentAddon(baseAddon, destination[, options])

- `baseAddon` The directory location containing a base add-on.
- `destination` Destination directory to create an agent add-on.
- `options`
    - `additionalPermissions` Additional permissions to be added to the add-on.
    - `addonId` An id of the Addon

```typescript
import { createMixedInAgentAddon } from "webext-agent";

const addon = await createMixedInAgentAddon("path/to/your/addon", "/tmp/my-new-addon");

console.log(addon.getRoot());
```

### connect()

- `address` The address and port the client connect to, `address:port` in a string, or in a object containing `address` in a string and `port` in a number.

```typescript
import { connect } from "webext-agent";

const browser = await connect("127.0.0.1:12345");
const tabs = await browser.tabs.query({});

console.log(tabs);
```

## LICENSE

MIT
