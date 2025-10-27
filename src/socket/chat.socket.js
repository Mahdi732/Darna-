export const chat = () => {
    io.on('connection', (socket) => {
    console.log("connected");

    socket.on("chat_room", (data) => {
        socket.join(data.roomId);
        socket.user = data.user;
        socket.roomId = data.roomId;
        console.log(`hello ${data.user} in ${data.roomChat} room.`);
    })

    socket.on('user_type', (data) => {
        if (data.isTrue) {
            io.to(data.roomId).broadcast().emit('user_typing', `${data.user} is typing`)
        }
    })

    socket.on("sendToChat", (data) => {
        io.to(data.roomId).emit('message',{
            user: data.user,
            message: data.message,
            timestamp: new Date()
        });
    })

    socket.on("disconnect", (data) => {
        io.to(data.roomId).emit('user_disconnected', `${socket.user} are desconnected`);
        socket.leave(socket.roomId);
        console.log("disconnected");
    })
});
}