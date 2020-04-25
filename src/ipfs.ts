import ipfsClient from 'ipfs-http-client';

export interface OfferDirInfo {
    descLink: string | null;
    imagesLink: string[]
}

let ipfs = ipfsClient("http://127.0.0.1:8080");
const imgRegex = /^img[0-9]{2}\./;


export async function fetchWithCid(cid: string): Promise<Buffer> {
    console.log(cid);
    const chunks = []
    for await (const chunk of ipfs.cat(cid)) {
      chunks.push(chunk);
    }
    return Buffer.concat(chunks);
}

//FALTA GESTIONAR CID NOT FOUND EN TOTES LES FUNCIONS

export async function getCover(dirCID: string): Promise<String> {
    for await (const file of ipfs.ls(dirCID)) {
        //if (coverRegex.test(file.name)) return file.path;
        if (file.name.startsWith("img00.")) return file.path;
    }
    throw 'Cover not found';
}

export async function getDesc(dirCID: string): Promise<String> {
    for await (const file of ipfs.ls(dirCID)) {
        if (file.name === 'desc.txt') return file.path;
    }
    throw 'Description not found';
}

export async function getDir(dirCID: string): Promise<OfferDirInfo> {
    let descLink = null;
    let images: [string, string][] = [];

    for await (const file of ipfs.ls(dirCID)) {
        if (file.name === 'desc.txt') {
            descLink = file.path;
        } else if (imgRegex.test(file.name)) {
            images.push([file.name, file.path]);
        }
    }
    return {
        descLink,
        imagesLink: images.sort().map(v => v[1])
    };
}
