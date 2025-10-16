module.exports = (io) => {
  io.on("connection", (socket) => {
    console.log("✅ A user connected:", socket.id);

    // ------------------
    // 🟦 Private Chat
    // ------------------
    socket.on("joinPrivateChat", ({ chatId }) => {
      if (chatId) {
        socket.join(`chat_private_${chatId}`);
        console.log(`📥 Socket ${socket.id} joined chat_private_${chatId}`);
      }
    });

    // هر کاربر یک room شخصی برای تماس‌ها
    socket.on("joinUserRoom", ({ userId }) => {
      if (userId) {
        socket.join(`user_${userId}`);
        console.log(`👤 User ${userId} joined personal room`);
      }
    });

    socket.on("sendPrivateMessage", (data) => {
      if (data.chatId) {
        io.to(`chat_private_${data.chatId}`).emit(
          "receivePrivateMessage",
          data
        );
        console.log(`💬 Private message sent to chat_private_${data.chatId}`);
      }
    });

    // ------------------
    // 🟩 Group Chat
    // ------------------
    socket.on("joinGroupChat", ({ groupId }) => {
      if (groupId) {
        socket.join(`chat_group_${groupId}`);
      }
    });

    socket.on("sendGroupMessage", (data) => {
      if (data.chatId) {
        io.to(`chat_group_${data.chatId}`).emit("receiveGroupMessage", data);
      }
    });
    // ------------------
    // 🟦 Channel Chat
    // ------------------

    socket.on("joinChannelChat", ({ userId, channelId }) => {
      if (channelId) {
        socket.join(`chat_channel_${channelId}`);
        console.log(`📥 User ${userId} joined chat_channel_${channelId}`);
      }
    });

    socket.on("sendChannelMessage", (data) => {
      if (data.chatId) {
        io.to(`chat_channel_${data.chatId}`).emit(
          "receiveChannelMessage",
          data
        );
        console.log(`💬 Channel message sent to chat_channel_${data.chatId}`);
      }
    });
    // ------------------
    // 🔵 Video Call
    // ------------------
    socket.on("callUser", ({ chatId, callerId, calleeId }) => {
      io.to(`user_${calleeId}`).emit("incomingCall", {
        chatId,
        callerId,
        calleeId,
      });
    });

    socket.on("acceptCall", ({ chatId, calleeId }) => {
      io.to(`user_${calleeId}`).emit("callAccepted");
    });

    socket.on("rejectCall", ({ chatId, calleeId, reason }) => {
      io.to(`user_${calleeId}`).emit("callRejected", { reason });
    });

    // WebRTC
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

    socket.on("disconnect", () => {
      console.log("❌ User disconnected:", socket.id);
    });
  });
};
