export interface Config {
  http: {
    enable: boolean;
    port: number;
  };
  https: {
    enable: boolean;
    port: number;
    key: string;
    cert: string;
  };
  ipfsNode: string;
  timeout: number;
}

const DEFAULT_CONFIG: Config = {
  http: {
    enable: true,
    port: 80,
  },
  https: {
    enable: false,
    port: 443,
    key: 'server.key',
    cert: 'server.crt',
  },
  ipfsNode: "http://127.0.0.1:5001",
  timeout: 10000,
};

function toBool(s?: string, keyName?: string): boolean | undefined {
  if (s == undefined) {
    return undefined;
  }
  if (+s === 0) {
    return false;
  }
  if (+s === 1) {
    return true;
  }
  if (s.toLowerCase() === "false" || s.toLowerCase() === "no") {
    return false;
  }
  if (s.toLowerCase() === "true" || s.toLowerCase() === "yes") {
    return true;
  }
  if (keyName) {
    console.error(`Invalid value for ${keyName}: ${s}; using default`);
  }
  return undefined;
}

export function getConfigFromEnv(): Config {
  const toBoolEnv = (key: string) => toBool(process.env[key], key);
  return {
    http: {
      enable: toBoolEnv("WB_FP_HTTP_ENABLE") ?? DEFAULT_CONFIG.http.enable,
      port: +(process.env["WB_FP_HTTP_PORT"] || DEFAULT_CONFIG.http.port),
    },
    https: {
      enable: toBoolEnv("WB_FP_HTTPS_ENABLE") ?? DEFAULT_CONFIG.https.enable,
      port: +(process.env["WB_FP_HTTPS_PORT"] || DEFAULT_CONFIG.https.port),
      key: process.env["WB_FP_HTTPS_KEY"] || DEFAULT_CONFIG.https.key,
      cert: process.env["WB_FP_HTTPS_CERT"] || DEFAULT_CONFIG.https.cert,
    },
    ipfsNode: process.env["WB_IPFS_NODE"] || DEFAULT_CONFIG.ipfsNode,
    timeout: +(process.env["WB_FP_TIMEOUT"] || DEFAULT_CONFIG.timeout),
  };
}
