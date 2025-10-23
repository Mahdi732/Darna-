import app from "./src/app.js";
import http from "http";
import dotenv from "dotenv";

dotenv.config();

const server = http.createServer(app);

const port = process.env.PORT || 3000;
server.listen(port, () => {
    console.log(`server is running on ${'http://localhost:' + port}`);
})