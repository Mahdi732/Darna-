import express from "express";
import http from "http";
import { chat } from "./socket/chat.socket";
import { Server } from "socket.io";

const route = express.Router();
const app = express();
const server = http.createServer(app);

const io = new Server(server);

app.set("io", io);

chat(io);


export default server;