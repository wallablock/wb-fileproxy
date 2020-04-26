import express from "express";
import { endpoint } from "./helpers";
import { IpfsInterface } from "./ipfs";
import { getConfigFromEnv } from "./config";

export interface NotFoundReason {
    code: "NOT_FOUND" | "NOT_AN_OFFER_DIR" | "HAS_NO_SUCH_ITEM";
    message?: string
}

const config = getConfigFromEnv();
const ipfs = new IpfsInterface(config.ipfsNode, config.ipfsTimeout);

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
    res.redirect(`/${response}`);
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
    res.redirect(`/${response}`);
}));

app.route("/wb/:dirCid")
    .get(endpoint(async (req, res) => {
        let response;
        try {
            response = await ipfs.getDir(req.params.dirCid);
        } catch (err) {
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

    //Check extension to set Content-Type
    let extensionIndex = req.params.fileName.lastIndexOf('.');
    if (extensionIndex == -1) {
        res.sendStatus(404);
        return;
    }
    let extension = req.params.fileName.slice(extensionIndex,req.params.fileName.length);
    res.type(extension);
    if (!res.get('Content-Type').startsWith("text/") && !res.get('Content-Type').startsWith("image/")) {
        res.sendStatus(404);
        return;
    }
    try {
        for await (const chunk of ipfs.fetchWithCid(cid)) {
            // We send chunks as they are returned to avoid
            // storing the entire file in memory.
            // We use write because send() tries to set the status code each time is called
            res.write(chunk);
        }
        //Send 200 status if everything went ok
        res.status(200).send();
    } catch (err) {
        res.sendStatus(404);
        return;
    }
}));

if (config.http.enable) {
    //app.listen(config.http.port, () => console.log(`Server running on port ${config.http.port}`));
    app.listen(3000, () => console.log(`Server running on port 3000`));
}
if (config.https.enable) {
    console.warn("HTTPS support not ready yet");
}
