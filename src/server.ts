import { publicEncrypt, constants } from 'node:crypto';
import { createServer, Server } from 'net';
import { IServerConfig } from './types';
import { config } from 'dotenv';

/**
 * Remote-env server instance. To open a server, call `createServer()`
 *
 * Usage: https://github.com/vientorepublic/remote-env?tab=readme-ov-file#example-usage-typescript--esm
 * @author Doyeon Kim - https://github.com/vientorepublic
 */
export class remoteEnvProvider {
  public server: Server;
  public path?: string;
  private password?: string;
  constructor(path?: string) {
    this.path = path;
    config({ path: this.path ?? null });
    this.server = createServer((socket) => {
      const address = socket.remoteAddress;
      const port = socket.remotePort;

      console.log('New remote-env client connected!');
      console.log(`IP Address: ${address}, Port: ${port}`);

      socket.on('data', (e) => {
        // [0]: Password Type (PWD, RSA, PLAIN)
        // [1]?: Password
        // [2]: Dotenv Key
        const data = e.toString().split(':');
        const value: string[] = [];

        if (data.length <= 1 || data.length > 3) return;

        if (data[0] === 'PLAIN') {
          value.push('PLAIN', this.getEnv(data[1]));
          socket.write(value.join(':'));
        }
        if (data[0] === 'PWD' && this.password === data[1]) {
          value.push('PLAIN', this.getEnv(data[2]));
          socket.write(value.join(':'));
        }
        if (data[0] === 'RSA' && data.length === 3) {
          const valueBuf = Buffer.from(this.getEnv(data[2]), 'utf-8');
          const encrypted = publicEncrypt(
            {
              key: data[1],
              padding: constants.RSA_PKCS1_PADDING,
            },
            valueBuf,
          ).toString('base64');
          value.push('RSA', encrypted);
          socket.write(value.join(':'));
        }
      });

      socket.on('close', () => {
        console.log('remote-env client disconnected.');
      });
    });
  }

  /**
   * Get env variable from [Dotenv](https://www.npmjs.com/package/dotenv).
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
    config?: IServerConfig,
    callback?: () => any,
  ): void {
    if (!address || !port) {
      throw new Error('address, port is required.');
    }
    if (config && config.auth) {
      this.password = config.auth.password;
    } else {
      console.warn(
        '[WARN]',
        'Authentication method is not defined. Use it caution.',
      );
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
