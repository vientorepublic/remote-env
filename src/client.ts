import { connect, Socket } from 'net';
import { IClientConfig } from './types';
import { privateDecrypt, constants, createDecipheriv } from 'crypto';

/**
 * Remote-env client instance. To connect to a server, call `connect()` and provide server information in the parameter.
 * @author Doyeon Kim - https://github.com/vientorepublic
 */
export class remoteEnvClient {
  public client: Socket;
  private key?: Buffer;
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
    config: IClientConfig,
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
    if (config.auth.key && config.auth.key.length !== 32) {
      throw new Error('ChaCha20-Poly1305 must have a key length of 32 bytes');
    }
    const option = config.auth.rsa;
    if (option) {
      if (option.publicKey && option.privateKey) {
        this.publicKey = option.publicKey;
        this.privateKey = option.privateKey;
      } else {
        throw new Error('RSA Public/Private Key is missing.');
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
      // [0]: Request Type (CHA-POLY, RSA)
      // [1]?: RSA Public Key
      // [2]: Dotenv Key
      const data: string[] = [];
      if (this.key) {
        data.push('CHA-POLY');
      } else if (this.publicKey) {
        data.push('RSA', this.publicKey);
      } else {
        throw new Error('Authentication options are not set');
      }
      data.push(key);
      this.client.write(data.join(':'));
      this.client.on('error', (err) => reject(err));
      this.client.on('data', (e) => {
        const data = e.toString().split(':');
        if (data[0] === 'ERROR') resolve(null);
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
        } else if (data[0] === 'CHA-POLY') {
          const decipher = createDecipheriv(
            'chacha20-poly1305',
            this.key,
            Buffer.from(data[1].substring(0, 24), 'hex'),
            {
              authTagLength: 16,
            },
          );
          decipher.setAuthTag(Buffer.from(data[1].substring(24, 56), 'hex'));
          const decrypted = [
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-expect-error
            decipher.update(
              Buffer.from(data[1].substring(56), 'hex'),
              'binary',
              'utf-8',
            ),
            decipher.final('utf-8'),
          ].join('');
          resolve(decrypted);
        } else {
          resolve(null);
        }
      });
    });
  }
}
