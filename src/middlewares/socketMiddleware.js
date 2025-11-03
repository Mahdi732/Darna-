import jwt from "jsonwebtoken";
import User from "../models/User.js";

export const socketCheckToken = async (socket, next) => {
  try {
    const token = socket.handshake.auth?.token;
    if (!token) return next(new Error("Token requis."));

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.userId);
    if (!user) return next(new Error("Utilisateur non trouvé."));

    socket.user = {
      userId: user._id.toString(),
      name: user.name,
      email: user.email,
    };

    next();
  } catch (err) {
    console.error("Socket auth error:", err.message);
    next(new Error("Token invalide ou expiré."));
  }
};
