import { config } from 'dotenv';
import { createServer, Server } from 'net';
import consola from 'consola';

/**
 * Remote-env server instance. To open a server, call `createServer()`
 * @author Doyeon Kim - https://github.com/vientorepublic
 */
export class remoteEnvProvider {
  public path?: string;
  public port: number;
  public addr: string;
  public server: Server;
  /**
   * @param { string } addr
   * @param { number } port
   * @param { string } path
   */
  constructor(addr: string, port: number, path?: string) {
    this.path = path;
    this.port = port;
    this.addr = addr;
    config({ path: this.path ?? null });
    this.server = createServer((socket) => {
      const address = socket.remoteAddress;
      const port = socket.remotePort;
      consola.success(`New remote-env client connected!`);
      consola.info(`IP Address: ${address}, Port: ${port}`);

      socket.on('data', (data) => {
        const key = data.toString();
        const value = this.getEnv(key);
        if (value) {
          socket.write(value);
        }
      });

      socket.on('close', () => {
        consola.info('remote-env client disconnected.');
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
   * Create a server from the declared instance.
   * @author Doyeon Kim - https://github.com/vientorepublic
   */
  public async createServer() {
    this.server.listen(this.port, this.addr, () => {
      consola.ready({
        message: `remote-env server listening on ${this.addr}:${this.port}`,
        badge: true,
      });
    });
  }
}
