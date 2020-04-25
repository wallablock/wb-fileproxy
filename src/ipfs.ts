import ipfsClient from 'ipfs-http-client';

export interface OfferDirInfo {
    descLink: string | null;
    imagesLink: string[]
}

export class IpfsInterface {
    private ipfs: any;
    private readonly imgRegex = /^img[0-9]{2}\./;

    public constructor(ipfsHost: string, ipfsPort: number) {
        this.ipfs = ipfsClient(`http://${ipfsHost}:${ipfsPort}`);
    }

    //FALTA GESTIONAR CID NOT FOUND EN TOTES LES FUNCIONS

    public async fetchWithCid(cid: string): Promise<Buffer> {
        console.log(cid);
        const chunks = []
        for await (const chunk of this.ipfs.cat(cid)) {
          chunks.push(chunk);
        }
        return Buffer.concat(chunks);
    }

    public async getCover(dirCid:string): Promise<string> {
        for await (const file of this.ipfs.ls(dirCid)) {
            if (file.name.startsWith("img00.")) return file.path;
        }
        throw "Directory has no cover";
    }

    public async getDesc(dirCid: string): Promise<string> {
        for await (const file of this.ipfs.ls(dirCid)) {
            if (file.name === "desc.txt") return file.path;
        }
        throw "Directory has no description";
    }

    public async getDir(dirCid: string): Promise<OfferDirInfo> {
        let descLink = null;
        let images: [string, string][] = [];

        for await (const file of this.ipfs.ls(dirCid)) {
            if (file.name === "desc.txt") {
                descLink = file.path;
            } else if (this.imgRegex.test(file.name)) {
                images.push([file.name, file.path]);
            }
        }

        return {
            descLink,
            imagesLink: images.sort().map(v => v[1])
        }
    }
}
