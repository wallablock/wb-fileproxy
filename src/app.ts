import express from "express";

import { endpoint } from "./helpers";

import { getDir, fetchWithCid } from "./ipfs"

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
        let response;
        try {
            response = await getDir(req.params.dirCid);
        } catch (err) {
            // Assumption: if error => promise rejected => file does not exist.
            res.sendStatus(404);
            return;
        }
        res.status(200).send(response);
    }))
    .post(endpoint(async (req, res) => {
        throw "Not implemented";
    }));

app.get("/:cid", endpoint(async (req, res) => {
    let cid = req.params.cid;
    for await (const buf of fetchWithCid(cid)) {
        // TODO: Error handling
        res.send(buf);
    }
}));

app.listen(port, () => console.log(`Server running on port ${port}`));
