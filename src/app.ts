import express from "express";
import { endpoint } from "./helpers";
import { IpfsInterface } from "./ipfs";
import { getConfigFromEnv } from "./config";
import multer from "multer";
import fs from "fs";
import Path from "path";

export interface NotFoundReason {
    code: "NOT_FOUND" | "NOT_AN_OFFER_DIR" | "HAS_NO_SUCH_ITEM";
    message?: string
}

const config = getConfigFromEnv();
const ipfs = new IpfsInterface(config.ipfsNode, config.ipfsTimeout);

let app = express();
var storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, '/tmp/my-uploads');
    }
})

var upload = multer({ storage: storage })

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
    .post(upload.any(),endpoint(async (req, res) => {
        //Empty upload
        if (!req.files) {
            res.sendStatus(201);
            return;
        }
        const filesArr: any | Express.Multer.File[] = req.files;
        if(Array.isArray(filesArr)){
            let dest:string = `/tmp/my-uploads/${Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15)}`;
            let created = false;
            //Create directory with a random name. If it already exists, use another random name.
            while (!created) {
                if (!fs.existsSync(dest)) {
                    created = true;
                    try {
                        fs.mkdirSync(dest);
                    }
                    catch (err) {
                        removeAllFiles(filesArr,'');
                        res.sendStatus(500);
                        return;
                    }
                }
                else dest = `/tmp/my-uploads/${Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15)}`;
            }
            try {
                filesArr.forEach(function(file:any){
                    //I'll check that the filename is valid before writing the file to disk using a multer function
                    fs.rename(file.path,`${dest}/${file.originalname}`, (err) => {
                        if (err) throw err;
                    });
                });
            }
            catch (err) {
                removeAllFiles(filesArr,dest);
                res.sendStatus(500);
                return;
            }
        }
        throw "Not implemented";
    }));

function removeAllFiles(filesArr:any, dir:string) {
    filesArr.forEach(function(file:any){
        fs.unlink(file.path, (err) => {
            if (err) console.log(err);
        });
    });
    if (dir != '') {
        const deleteFolderRecursive = function(path:any) {
          if (fs.existsSync(path)) {
            fs.readdirSync(path).forEach((file, index) => {
              const curPath = Path.join(path, file);
              if (fs.lstatSync(curPath).isDirectory()) {
                deleteFolderRecursive(curPath);
              }
              else {
                fs.unlinkSync(curPath);
              }
            });
            fs.rmdirSync(path);
          }
        };
    }
}

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
