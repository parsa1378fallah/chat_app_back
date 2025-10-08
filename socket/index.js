module.exports = (io) => {
  io.on("connection", (socket) => {
    console.log("✅ A user connected:", socket.id);

    // ----------------------
    // 🟦 Private Chat
    // ----------------------
    socket.on("joinPrivateChat", ({ chatId }) => {
      if (chatId) {
        socket.join(`chat_private_${chatId}`);
        console.log(`📥 Socket ${socket.id} joined chat_private_${chatId}`);
      }
    });

    socket.on("sendPrivateMessage", (data) => {
      if (data.chat_id) {
        io.to(`chat_private_${data.chat_id}`).emit(
          "receivePrivateMessage",
          data
        );
        console.log(`💬 Private message sent to chat_private_${data.chat_id}`);
      }
    });

    // ----------------------
    // 🟩 Group Chat
    // ----------------------
    socket.on("joinGroupChat", ({ userId, groupId }) => {
      if (groupId) {
        socket.join(`chat_group_${groupId}`);
        console.log(`👥 User ${userId} joined group_${groupId}`);
      }
    });

    socket.on("sendGroupMessage", (data) => {
      if (data.chat_id) {
        io.to(`chat_group_${data.chat_id}`).emit("receiveGroupMessage", data);
        console.log(`📢 Group message sent to chat_group_${data.chat_id}`);
      }
    });

    // ----------------------
    // 🟦 Channel Chat
    // ----------------------
    socket.on("joinChannelChat", ({ userId, channelId }) => {
      if (channelId) {
        socket.join(`chat_channel_${channelId}`);
        console.log(`📥 User ${userId} joined chat_channel_${channelId}`);
      }
    });

    socket.on("sendChannelMessage", (data) => {
      if (data.chat_id) {
        io.to(`chat_channel_${data.chat_id}`).emit(
          "receiveChannelMessage",
          data
        );
        console.log(`💬 Channel message sent to chat_channel_${data.chat_id}`);
      }
    });

    // ----------------------
    // 🔵 Video Call (WebRTC)
    // ----------------------
    socket.on("joinCall", ({ callId, userId }) => {
      if (callId) {
        socket.join(`call_${callId}`);
        console.log(`📞 User ${userId} joined call_${callId}`);
      }
    });

    socket.on("webrtcOffer", ({ callId, offer, senderId }) => {
      socket.to(`call_${callId}`).emit("webrtcOffer", { offer, senderId });
    });

    socket.on("webrtcAnswer", ({ callId, answer, senderId }) => {
      socket.to(`call_${callId}`).emit("webrtcAnswer", { answer, senderId });
    });

    socket.on("webrtcIceCandidate", ({ callId, candidate, senderId }) => {
      socket
        .to(`call_${callId}`)
        .emit("webrtcIceCandidate", { candidate, senderId });
    });

    // ----------------------
    // 🔴 Disconnect
    // ----------------------
    socket.on("disconnect", () => {
      console.log("❌ User disconnected:", socket.id);
    });
  });
};
