import { connect, Socket } from 'net';
import consola from 'consola';

export class remoteEnvClient {
  public client: Socket;

  public connect(address: string, port: number): void {
    this.client = connect({ host: address, port: port }, () => {
      consola.success('New remote-env client created!');
    });
  }

  public close(): void {
    this.client.end(() => {
      consola.info('remote-env client connection closed.');
    });
  }

  public getEnv(key: string): Promise<string | undefined> {
    return new Promise((resolve, reject) => {
      this.client.write(key);
      this.client.on('error', (err) => reject(err));
      this.client.on('data', (data) => resolve(data.toString()));
    });
  }
}
