import { createServer } from 'net';

export class remoteEnvProvider {
  public port: number;
  public addr: string;
  constructor(port: number, addr: string) {
    this.port = port;
    this.addr = addr;
  }

  public async listen() {
    createServer().listen(this.port, this.addr);
  }
}
