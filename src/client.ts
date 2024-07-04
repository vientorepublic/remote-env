import { connect, Socket } from 'net';
import { IClientConfig } from './types';
import { privateDecrypt, constants } from 'crypto';

/**
 * Remote-env client instance. To connect to a server, call `connect()` and provide server information in the parameter.
 *
 * Usage: https://github.com/vientorepublic/remote-env?tab=readme-ov-file#example-usage-typescript--esm
 * @author Doyeon Kim - https://github.com/vientorepublic
 */
export class remoteEnvClient {
  public client: Socket;
  private password?: string;
  private publicKey?: string;
  private privateKey?: string;

  /**
   * Connect to remote-env server.
   * @example const { remoteEnvClient } = require('@vientorepublic/remote-env');
   * const client = new remoteEnvClient();
   * client.connect('127.0.0.1', 8080);
   * @param { string } address
   * @param { port } port
   * @author Doyeon Kim - https://github.com/vientorepublic
   */
  public connect(
    address: string,
    port: number,
    config?: IClientConfig,
    callback?: () => any,
  ): void {
    if (!address || !port) {
      throw new Error('address, port is required.');
    }
    if (config.auth) {
      if (config.auth.password && config.auth.encryption) {
        throw new Error(
          'Password and encryption options cannot be used together.',
        );
      }
      // Plain text based password protection
      if (config.auth.password) {
        console.warn(
          '[WARN]',
          'Password protection will be deprecated. Specify the RSA Public/Private Key in the `encryption` option.',
        );
        this.password = config.auth.password;
      }
      // RSA public key encryption
      const option = config.auth.encryption;
      if (option) {
        if (option.publicKey && option.privateKey) {
          this.publicKey = option.publicKey;
          this.privateKey = option.privateKey;
        } else {
          throw new Error('RSA Public/Private Key is missing.');
        }
      }
    }

    this.client = connect({ host: address, port: port }, () => {
      if (callback) {
        callback();
      } else {
        console.log('New remote-env client created!');
      }
    });
  }

  /**
   * Close the connection with server.
   * @author Doyeon Kim - https://github.com/vientorepublic
   */
  public close(callback?: () => any): void {
    this.client.end(() => {
      if (callback) {
        callback();
      } else {
        console.log('remote-env client connection closed.');
      }
    });
  }

  /**
   * Requests the environment variable value corresponding to the provided key.
   * @param { string } key
   * @returns { Promise<string> }
   * @author Doyeon Kim - https://github.com/vientorepublic
   */
  public getEnv(key: string): Promise<string | null> {
    return new Promise((resolve, reject) => {
      // [0]: Password Type (PWD, RSA, PLAIN)
      // [1]?: Password
      // [2]: Dotenv Key
      const data: string[] = [];
      if (this.password) {
        data.push('PWD', this.password);
      } else if (this.publicKey) {
        data.push('RSA', this.publicKey);
      } else {
        data.push('PLAIN');
      }
      data.push(key);
      this.client.write(data.join(':'));
      this.client.on('error', (err) => reject(err));
      this.client.on('data', (e) => {
        const data = e.toString().split(':');
        if (data[0] === 'ERROR') resolve(null);
        else if (data[0] === 'PLAIN') resolve(data[1]);
        else if (data[0] === 'RSA') {
          const payload = Buffer.from(data[1], 'base64');
          const decrypted = privateDecrypt(
            {
              key: this.privateKey,
              padding: constants.RSA_PKCS1_PADDING,
            },
            payload,
          ).toString();
          resolve(decrypted);
        } else {
          resolve(null);
        }
      });
    });
  }
}
