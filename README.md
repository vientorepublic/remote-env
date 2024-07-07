[![License](https://img.shields.io/badge/License-MIT-blue)](#license)
[![GitHub tag](https://img.shields.io/github/tag/vientorepublic/remote-env?include_prereleases=&sort=semver&color=blue)](https://github.com/vientorepublic/remote-env/releases/)
[![stars - remote-env](https://img.shields.io/github/stars/vientorepublic/remote-env?style=social)](https://github.com/vientorepublic/remote-env)
[![forks - remote-env](https://img.shields.io/github/forks/vientorepublic/remote-env?style=social)](https://github.com/vientorepublic/remote-env)
[![Build](https://github.com/vientorepublic/remote-env/actions/workflows/nodejs.yml/badge.svg)](https://github.com/vientorepublic/remote-env/actions/workflows/nodejs.yml)

# Remote Env

**Remote [Dotenv](https://www.npmjs.com/package/dotenv) server/client for Node.js**

This project aims for minimal dependencies & light weight.

Helps you easily share environment variables in various distributed service structures.

# CI Build Versions

- ES2020 Node.js 20.x

# How to use

## Install

```
npm install @vientorepublic/remote-env
```

> [!NOTE]  
> For security purposes, you must specify an encryption method. The plain text method is no longer supported.

## Example: Protect with rsa public key encryption

```javascript
import { readFileSync } from 'node:fs';

const publicKey = readFileSync('public_key.pem', 'utf8');
const privateKey = readFileSync('private_key.pem', 'utf8');

const server = new remoteEnvProvider();
server.createServer('127.0.0.1', 8080, {
  auth: {
    encryption: {
      publicKey,
    },
  },
});

const client = new remoteEnvClient();
client.connect('127.0.0.1', 8080, {
  auth: {
    encryption: {
      publicKey,
      privateKey,
    },
  },
});
```

- Generate RSA 2048Bit Private Key: `openssl genrsa -out private_key.pem 2048`
- Extract public key from private key: `openssl rsa -in private_key.pem -out public_key.pem -pubout`

## Example: Protect with chacha20-poly1305 encryption

```javascript
import { readFileSync } from 'node:fs';

const key = Buffer.from(readFileSync('secretkey'));

const server = new remoteEnvProvider();
server.createServer('127.0.0.1', 8080, {
  auth: {
    key,
  },
});

const client = new remoteEnvClient();
client.connect('127.0.0.1', 8080, {
  auth: {
    key,
  },
});
```

- Generate ChaCha20-Poly1305 32Byte Key: `openssl rand 32 > secretkey`

# License

This project is released under the MIT License.
