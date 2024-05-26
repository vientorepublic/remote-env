import { connect, Socket } from 'net';

/**
 * Remote-env client instance. To connect to a server, call `connect()` and provide server information in the parameter.
 * @author Doyeon Kim - https://github.com/vientorepublic
 */
export class remoteEnvClient {
  public client: Socket;

  /**
   * Connect to remote-env server.
   * @example const { remoteEnvClient } = require('@vientorepublic/remote-env');
   * const client = new remoteEnvClient();
   * client.connect('127.0.0.1', 8080);
   * @param { string } address
   * @param { port } port
   * @author Doyeon Kim - https://github.com/vientorepublic
   */
  public connect(address: string, port: number, callback?: () => any): void {
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
  public getEnv(key: string): Promise<string> {
    return new Promise((resolve, reject) => {
      this.client.write(key);
      this.client.on('error', (err) => reject(err));
      this.client.on('data', (data) => resolve(data.toString()));
    });
  }
}
