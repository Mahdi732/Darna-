import ChatService from "../services/ChatService.js";
import { socketCheckToken } from "../middlewares/socketMiddleware.js";

export class Chat {
  #io;

  constructor(io) {
    this.#io = io;
  }

  init() {
    this.#io.use(socketCheckToken);

    this.#io.on("connection", (socket) => {
      console.log(`${socket.user.name} connected`);

      socket.on("chat_room", async (data) => {
        const { roomId } = data;
        socket.join(roomId);
        socket.roomId = roomId;
        console.log(`${socket.user.name} joined room ${roomId}`);

        const oldMessages = await ChatService.getRoomMessages(roomId);
        socket.emit("previous_messages", oldMessages);
      });

      socket.on("user_typing", () => {
        socket
          .to(socket.roomId)
          .emit("user_typing", `${socket.user.name} is typing...`);
      });

      socket.on("send_message", async (data) => {
        const newMsg = await ChatService.saveMessage({
          roomId: socket.roomId,
          userId: socket.user.userId,
          message: data.message,
        });

        const populatedMsg = await newMsg.populate("userId", "name email");

        this.#io.to(socket.roomId).emit("new_message", {
          id: populatedMsg._id,
          user: populatedMsg.userId.name,
          message: populatedMsg.message,
          timestamp: populatedMsg.createdAt,
        });
      });

      socket.on("send_image", async (data) => {
        const fileName = `chat_${Date.now()}.jpg`;
        const imageUrl = await ChatService.saveImage(data.image, fileName);

        const newMsg = await ChatService.saveMessage({
          roomId: socket.roomId,
          userId: socket.user.userId,
          image: imageUrl,
        });

        const populatedMsg = await newMsg.populate("userId", "name email");

        this.#io.to(socket.roomId).emit("new_image", {
          id: populatedMsg._id,
          user: populatedMsg.userId.name,
          image: imageUrl,
          timestamp: populatedMsg.createdAt,
        });
      });

      socket.on("message_read", async (data) => {
        await ChatService.markAsRead(data.messageId);
        this.#io.to(socket.roomId).emit("message_read", {
          messageId: data.messageId,
        });
      });

      socket.on("disconnect", () => {
        console.log(`${socket.user.name} disconnected`);
        socket
          .to(socket.roomId)
          .emit("user_disconnected", `${socket.user.name} left the room`);
        socket.leave(socket.roomId);
      });
    });
  }
}
