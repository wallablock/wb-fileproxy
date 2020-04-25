import express from "express";
import { endpoint } from "./helpers";
import { IpfsInterface } from "./ipfs";
import { getConfigFromEnv } from "./config";

export interface NotFoundReason {
    code: "NOT_FOUND" | "NOT_AN_OFFER_DIR" | "HAS_NO_SUCH_ITEM";
    message?: string
}

const config = getConfigFromEnv();
const ipfs = new IpfsInterface(config.ipfsNode.host, config.ipfsNode.apiPort);

let app = express();

app.get("/wb/:dirCid/cover", endpoint(async (req, res) => {
    let response;
    try {
        response = await ipfs.getCover(req.params.dirCid);
    }
    catch (err) {
        let error: NotFoundReason = {
            code: "HAS_NO_SUCH_ITEM"
        };
        /*
         * If IPFS throws, the "message" field will be set on error,
         * so we return "Unknown error"; if getCover throws no
         * "message" field will be defined, so we return
         * its error message.
         */
        if (err.message == undefined) error.message = err;
        res.status(404).send(error);
        return;
    }
    let link = `http://${req.hostname}:8080/ipfs/${response}`;
    res.redirect(link);
}));

app.get("/wb/:dirCid/desc", endpoint(async (req, res) => {
    let response;
    try {
        response = await ipfs.getDesc(req.params.dirCid);
    }
    catch (err) {
        let error: NotFoundReason = {
            code: "HAS_NO_SUCH_ITEM"
        };
        /*
         * If IPFS throws, the "message" field will be set on error,
         * so we return "Unknown error"; if getDesc throws no
         * "message" field will be defined, so we return
         * its error message.
         */
        if (err.message == undefined) error.message = err;
        res.status(404).send(error);
        return;
    }
    let link = `http://${req.hostname}:8080/ipfs/${response}`;
    res.redirect(link);
}));

app.route("/wb/:dirCid")
    .get(endpoint(async (req, res) => {
        let response;
        try {
            response = await ipfs.getDir(req.params.dirCid);
        } catch (err) {
            console.log(err);
            res.sendStatus(404);
            return;
        }
        res.status(200).send(response);
    }))
    .post(endpoint(async (req, res) => {
        throw "Not implemented";
    }));

app.get("/:cid/:fileName", endpoint(async (req, res) => {
    let cid = `${req.params.cid}/${req.params.fileName}`;
    let response;
    try {
        response = await ipfs.fetchWithCid(cid);
    } catch (err) {
        res.sendStatus(404);
        return;
    }
    res.send(response);
}));

app.get("/:cid", endpoint(async (req, res) => {
    let cid = `${req.params.cid}`;
    let response;
    try {
        response = await ipfs.fetchWithCid(cid);
    } catch (err) {
        res.sendStatus(404);
        return;
    }
    res.send(response);
}));

if (config.http.enable) {
    app.listen(config.http.port, () => console.log(`Server running on port ${config.http.port}`));
}
if (config.https.enable) {
    console.warn("HTTPS support not ready yet");
}
