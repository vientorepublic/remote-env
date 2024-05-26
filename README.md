# Remote Env

**Remote environment variable server/client for Node.js**

This project aims for minimal dependencies & light weight.

Helps you easily share environment variables in various distributed service structures.

# Warning

This project is currently in development.

# How to use

## Install

```
npm install @vientorepublic/remote-env
```

## Example usage (Typescript & ESM)

```typescript
import { remoteEnvProvider, remoteEnvClient } from '@vientorepublic/remote-env';

// For CommonJS:
// const { remoteEnvProvider, remoteEnvClient } = require('@vientorepublic/remote-env');

new remoteEnvProvider('127.0.0.1', 8080).createServer();

const client = new remoteEnvClient();
client.connect('127.0.0.1', 8080);

const value = await client.getEnv('KEY');
console.log(value);

client.close();
server.close();
```
