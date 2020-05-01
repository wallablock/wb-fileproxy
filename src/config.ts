export interface Config {
    http: {
        enable: boolean,
        port: number
    },
    https: {
        enable: boolean,
        port: number
    },
    ipfsNode: string,
    ipfsTimeout: number
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
    ipfsNode: "http://127.0.0.1:5001",
    ipfsTimeout: 1000
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
        ipfsNode: process.env["WB_IPFS_NODE"] || DEFAULT_CONFIG.ipfsNode,
        ipfsTimeout: +(process.env["WB_FP_TIMEOUT"] || DEFAULT_CONFIG.ipfsTimeout)
    }
}
