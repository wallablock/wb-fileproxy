import ipfsClient from 'ipfs-http-client';

export interface OfferDirInfo {
    descLink: string | null;
    imagesLink: string[]
}

export class IpfsInterface {
    private ipfs: any;
    private readonly imgRegex = /^img[0-9]{2}\./;

    public constructor(ipfsUrl: string) {
        this.ipfs = ipfsClient(ipfsUrl);
    }

    //FALTA GESTIONAR CID NOT FOUND EN TOTES LES FUNCIONS

    public fetchWithCid(cid: string): AsyncIterable<Buffer> {
        console.log(cid);
        // We return the IPFS's cat iterator directly, so we can
        // avoid storing the entire file in memory.
        return this.ipfs.cat(cid);
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
