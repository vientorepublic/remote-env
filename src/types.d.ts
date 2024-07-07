export interface IServerConfig {
  auth?: {
    key?: Buffer;
    rsa?: {
      publicKey: string;
    };
  };
}

export interface IClientConfig {
  auth?: {
    key?: Buffer;
    rsa?: {
      publicKey: string;
      privateKey: string;
    };
  };
}
