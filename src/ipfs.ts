import ipfsClient from 'ipfs-http-client';
import { globSource } from 'ipfs-http-client';

export async function getDir(ip:string, dirCID:string) {
    const ipfs = ipfsClient(`http://127.0.0.1:8080`);
    let response: any = {};
    response.imagesLink = [];
    for await (const file of ipfs.ls(dirCID)) {
        if (file.name === 'desc.txt') response.descLink = `http://${ip}:8080/ipfs/${file.path}`;
        else response.imagesLink.push(`http://${ip}:8080/ipfs/${file.path}`);
    }
    return response;
}
