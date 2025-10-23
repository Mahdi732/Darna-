import server from "./src/app.js";
import { ConnectionManager } from "./src/config/connectionManager.js";
import dotenv from "dotenv";

dotenv.config();

//db connection
const dbConnection = new ConnectionManager(process.env.MONGO_URI);
dbConnection.connectWithRetry();

const port = process.env.PORT || 3000;
server.listen(port, () => {
    console.log(`server is running on ${'http://localhost:' + port}`);
})