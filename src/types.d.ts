export interface IServerConfig {
  auth?: {
    password?: string;
    encryption?: {
      publicKey: string;
    };
  };
}

export interface IClientConfig {
  auth?: {
    password?: string;
    encryption?: {
      publicKey: string;
      privateKey: string;
    };
  };
}
