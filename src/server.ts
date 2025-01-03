import {
  publicEncrypt,
  constants,
  createCipheriv,
  randomBytes,
} from 'node:crypto';
import type { IServerConfig } from './types';
import { createServer, Server } from 'net';
import { config } from 'dotenv';

// [ Encryption Type ]
// 0: RSA
// 1: ChaCha20-Poly1305

/**
 * Remote-env server instance. To open a server, call `createServer()`
 * @author Doyeon Kim - https://github.com/vientorepublic
 */
export class remoteEnvProvider {
  public server: Server;
  public path?: string;
  private key?: Buffer;
  constructor(path?: string) {
    this.path = path;
    config({ path: this.path ?? null });
    this.server = createServer((socket) => {
      const address = socket.remoteAddress;
      const port = socket.remotePort;

      console.log('New remote-env client connected!');
      console.log(`IP Address: ${address}, Port: ${port}`);

      socket.on('data', (e) => {
        const data = e.toString().split(':');
        const value: string[] = [];

        if (data.length <= 1 || data.length > 3) return;

        // 1: ChaCha20-Poly1305
        if (data[0] === '1') {
          const env = this.getEnv(data[1]);
          if (!env) {
            socket.write('ERROR');
            return;
          }
          const iv = randomBytes(12);
          const cipher = createCipheriv('chacha20-poly1305', this.key, iv, {
            authTagLength: 16,
          });
          const encrypted = Buffer.concat([
            cipher.update(env, 'utf8'),
            cipher.final(),
          ]);
          const tag = cipher.getAuthTag();
          const final = Buffer.concat([iv, tag, encrypted]).toString('hex');
          value.push('1', final);
          socket.write(value.join(':'));
        }

        // 0: RSA
        if (data[0] === '0' && data.length === 3) {
          const env = this.getEnv(data[2]);
          if (!env) {
            socket.write('ERROR');
            return;
          }
          const valueBuf = Buffer.from(env, 'utf-8');
          const encrypted = publicEncrypt(
            {
              key: data[1],
              padding: constants.RSA_PKCS1_PADDING,
            },
            valueBuf,
          ).toString('base64');
          value.push('0', encrypted);
          socket.write(value.join(':'));
        }
      });

      socket.on('close', () => {
        console.log('remote-env client disconnected.');
      });
    });
  }

  /**
   * Get local env variable
   * @param { string } key
   * @returns { string | undefined }
   * @author Doyeon Kim - https://github.com/vientorepublic
   */
  private getEnv(key: string): string | undefined {
    return process.env[key];
  }

  /**
   * Create a new remote-env server.
   * @param { string } address
   * @param { number } port
   * @author Doyeon Kim - https://github.com/vientorepublic
   */
  public createServer(
    address: string,
    port: number,
    config: IServerConfig,
    callback?: () => any,
  ): void {
    if (!address || !port) {
      throw new Error('address, port is required.');
    }
    if (!config.auth) {
      throw new Error('Authentication options are not set');
    }
    if (config.auth.key && config.auth.rsa) {
      throw new Error('key and rsa options cannot be used together.');
    }
    if (config.auth.key) {
      if (config.auth.key.length !== 32) {
        throw new Error('ChaCha20-Poly1305 must have a key length of 32 bytes');
      }
      this.key = config.auth.key;
    }
    this.server.listen(port, address, () => {
      if (callback) {
        callback();
      } else {
        console.log(`remote-env server listening on ${address}:${port}`);
      }
    });
  }

  /**
   * Close remote-env server.
   * @author Doyeon Kim - https://github.com/vientorepublic
   */
  public close(callback?: () => any): void {
    this.server.close(() => {
      if (callback) {
        callback();
      } else {
        console.log('remote-env server closed.');
      }
    });
  }
}
