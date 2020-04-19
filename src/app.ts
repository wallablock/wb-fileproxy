import express from "express";

import { endpoint } from "./helpers";

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
        throw "Not implemented";
    }))
    .post(endpoint(async (req, res) => {
        throw "Not implemented";
    }));

app.get("/:cid", endpoint(async (req, res) => {
    throw "Not implemented";
}));

app.listen(port, () => console.log(`Server running on port ${port}`));
