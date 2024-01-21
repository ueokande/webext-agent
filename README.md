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

Then install the native messaging manifest to the local:

```console
$ ./node_modules/.bin/webext-agent install
```

## Quick start

Create a new agent add-on:

```console
$ webext-agent create-addon --additional-permissions tabs /tmp/my-agent-addon
```

and load it via `about:config` on your Firefox browser.
The agent server starts and you can access APIs by the following JavaScript/TypeScript:

```javascript
const { connect } = require("webext-agent");

(async () => {
  const browser = await connect("127.0.0.1:12345");
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
$ webext-agent install
Installed native message manifest at /home/alice/.mozilla/native-messaging-hosts/demo.ueokande.webext_agent.json
```

### uninstall

Uninstall the installed native messaging manifest from the local.

```console
$ webext-agent uninstall
Uninstalled native message manifest from /home/alice/.mozilla/native-messaging-hosts/demo.ueokande.webext_agent.json
```

### check

Check if the native message manifest is installed.

```console
$ webext-agent install
Installed native message manifest at /home/alice/.mozilla/native-messaging-hosts/demo.ueokande.webext_agent.json
```

### create-addon

Create a new agent add-on.

```console
$ webext-agent create-addon --additional-permissions tabs /tmp/my-agent-addon
```

You can mix-in an agent add-on with your add-ons by `--base-addon` option.
This is useful to debug or access the internal storage on your add-on.

```console
$ webext-agent create-addon --base-addon ~/workspace/my-addon /tmp/my-agent-addon
```

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
