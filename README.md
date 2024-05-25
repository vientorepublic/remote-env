# remote-env

Remote environment variable server/client for Node.js

# Warning

This project is currently in development.

# How to use

## Install

```
npm install @vientorepublic/remote-env
```

## Example usage

```typescript
import { remoteEnvProvider, remoteEnvClient } from '@vientorepublic/remote-env';

new remoteEnvProvider('127.0.0.1', 8080).createServer();

const client = new remoteEnvClient();
client.connect('127.0.0.1', 8080);

const value = await client.getEnv('KEY');
console.log(value);
```
