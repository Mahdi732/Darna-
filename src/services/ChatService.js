import Message from "../models/Message.js";
import MinioService from "./MinioService.js";

class ChatService {
  async saveMessage({ roomId, userId, message, image }) {
    const msg = new Message({
      roomId,
      userId,
      message: message || null,
      image: image || null,
      read: false,
    });
    return msg.save();
  }

  async saveImage(imageBuffer, fileName) {
    return await MinioService.upload(imageBuffer, fileName);
  }

  async markAsRead(messageId) {
    await Message.findByIdAndUpdate(messageId, { read: true });
  }

  async getRoomMessages(roomId) {
    return await Message.find({ roomId })
      .populate("userId", "name email")
      .sort({ createdAt: 1 });
  }
}

export default new ChatService();
