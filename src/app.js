import { Socket } from "dgram";
import express from "express";
import http from "http";
import { Server } from "socket.io";

const route = express.Router();
const app = express();
const server = http.createServer(app);

const io = new Server(server);

io.on('connection', (socket) => {
    console.log("Hello");
});

app.get('/chat_room', (req, res) => {
});





export default server;