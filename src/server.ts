import { config } from 'dotenv';
import { createServer } from 'net';
import consola from 'consola';

export class remoteEnvProvider {
  public path?: string;
  public port: number;
  public addr: string;
  constructor(addr: string, port: number, path?: string) {
    this.path = path;
    this.port = port;
    this.addr = addr;
    config({ path: this.path ?? null });
  }

  public getEnv(key: string): string | undefined {
    return process.env[key];
  }

  public async createServer() {
    createServer((socket) => {
      const address = socket.remoteAddress;
      const port = socket.remotePort;
      consola.success(`New remote-env client connected!`);
      consola.info(`IP Address: ${address}, Port: ${port}`);

      socket.on('data', (data) => {
        const key = data.toString();
        const value = this.getEnv(key);
        if (value) {
          socket.write(value);
        } else {
          socket.write('Failed to get env value');
        }
      });

      socket.on('close', () => {
        consola.info('remote-env client disconnected.');
      });
    }).listen(this.port, this.addr, () => {
      consola.ready({
        message: `remote-env server listening on ${this.addr}:${this.port}`,
        badge: true,
      });
    });
  }
}
