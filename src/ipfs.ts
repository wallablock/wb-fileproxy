import ipfsClient from 'ipfs-http-client';

export interface OfferDirInfo {
    descLink: string | null;
    imagesLink: string[]
}

let ipfs = ipfsClient("http://127.0.0.1:8080");
const imgRegex = /^img[0-9]{2}\./;

export async function* fetchWithCid(cid: string): AsyncIterable<Buffer> {
    // TODO: Gestionar cas de CID not found;
    // TODO: Gestionar cas de CID is a directory
    return ipfs.cat(cid);
}

export async function getDir(dirCID: string): Promise<OfferDirInfo> {
    let descLink = null;
    // IPFS.ls may not return the files ordered, and the order is important,
    // so we store them in an array with (name, cid) tuples and sort them
    // before returning. Ideally, this would be implemented with a tree-based
    // dictionary, but Javascript currently does not have "OrderedMap"-like
    // data structures, and for the amount of data being treated, this should
    // perform good enough.
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
