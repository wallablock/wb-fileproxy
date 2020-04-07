import express from "express";

let app = express();
const port = 3000;

app.get('/', (req, res) => res.send("Hello world"));
app.listen(port, () => console.log(`Server running on port ${port}`));
