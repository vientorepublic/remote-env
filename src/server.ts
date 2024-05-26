import { config } from 'dotenv';
import { createServer, Server } from 'net';

/**
 * Remote-env server instance. To open a server, call `createServer()`
 * @author Doyeon Kim - https://github.com/vientorepublic
 */
export class remoteEnvProvider {
  public path?: string;
  public server: Server;
  constructor(path?: string) {
    this.path = path;
    config({ path: this.path ?? null });
    this.server = createServer((socket) => {
      const address = socket.remoteAddress;
      const port = socket.remotePort;
      console.log('New remote-env client connected!');
      console.log(`IP Address: ${address}, Port: ${port}`);

      socket.on('data', (data) => {
        const key = data.toString();
        const value = this.getEnv(key);
        if (value) {
          socket.write(value);
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
    callback?: () => any,
  ): void {
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
