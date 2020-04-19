import express from "express";

import { endpoint } from "./helpers";

import * as ipfs from "./ipfs"

let app = express();
const port = +(process.env["PORT"] || 3000);

app.get("/wb/:dirCid/cover", endpoint(async (req, res) => {
    throw "Not implemented";
}))

app.get("/wb/:dirCid/dest", endpoint(async (req, res) => {
    throw "Not implemented";
}));

app.route("/wb/:dirCid")
    .get(endpoint(async (req, res) => {
        let response = await ipfs.getDir(req.hostname,req.params.dirCid);
        if (!response) res.sendStatus(404);
        else if (!response.descLink || response.imagesLink.length == 0) res.sendStatus(400);
        else res.status(200).send(response);
    }))
    .post(endpoint(async (req, res) => {
        throw "Not implemented";
    }));

app.get("/:cid", endpoint(async (req, res) => {
    throw "Not implemented";
}));

app.listen(port, () => console.log(`Server running on port ${port}`));
