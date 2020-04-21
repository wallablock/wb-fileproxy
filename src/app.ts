import express from "express";

import { endpoint } from "./helpers";

import { getDir, fetchWithCid, getDesc, getCover } from "./ipfs"

export interface NotFoundReason {
    code: string; //NOT_FOUND, NOT_AN_OFFER_DIR, HAS_NOT_SUCH_ITEM
    message: string
}

let app = express();
const port = +(process.env["PORT"] || 3000);

app.get("/wb/:dirCid/cover", endpoint(async (req, res) => {
    let response;
    try {
        response = await getCover(req.params.dirCid);
    }
    catch (err) {
        let error: NotFoundReason = {
            code: "HAS_NOT_SUCH_ITEM",
            message: "Unknown error"
        };
        if (!err.message) error.message = err;
        res.status(404).send(error);
        return;
    }
    let link = `http://${req.hostname}:8080/ipfs/${response}`;
    res.redirect(link);
}));

app.get("/wb/:dirCid/desc", endpoint(async (req, res) => {
    let response;
    try {
        response = await getDesc(req.params.dirCid);
    }
    catch (err) {
        let error: NotFoundReason = {
            code: "HAS_NOT_SUCH_ITEM",
            message: "Unknown error"
        };
        if (!err.message) error.message = err;
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
            response = await getDir(req.params.dirCid);
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
        response = await fetchWithCid(cid);
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
        response = await fetchWithCid(cid);
    } catch (err) {
        res.sendStatus(404);
        return;
    }
    res.send(response);
}));

app.listen(port, () => console.log(`Server running on port ${port}`));
