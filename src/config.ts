export interface Config {
    http: {
        enable: boolean,
        port: number
    },
    https: {
        enable: boolean,
        port: number
    },
    ipfsNode: {
        host: string,
        gatewayPort: number,
        apiPort: number
    }
};

const DEFAULT_CONFIG: Config = {
    http: {
        enable: true,
        port: 80
    },
    https: {
        enable: false,
        port: 443
    },
    ipfsNode: {
        host: "127.0.0.1",
        gatewayPort: 8080,
        apiPort: 5001
    }
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
            port: +(process.env["WB_FP_HTTP_PORT"] || DEFAULT_CONFIG.http.port)
        },
        https: {
            enable: toBoolEnv("WB_FP_HTTPS_ENABLE") ?? DEFAULT_CONFIG.https.enable,
            port: +(process.env["WB_FP_HTTPS_PORT"] || DEFAULT_CONFIG.https.port)
        },
        ipfsNode: {
            host: process.env["WB_IPFS_NODE"] || DEFAULT_CONFIG.ipfsNode.host,
            gatewayPort: +(process.env["WB_IPFS_GATEWAY_PORT"] || DEFAULT_CONFIG.ipfsNode.gatewayPort),
            apiPort: +(process.env["WB_IPFS_API_PORT"] || DEFAULT_CONFIG.ipfsNode.apiPort)
        }
    }
}
