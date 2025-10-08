const Controller = require("../../controller");
const { eq, or, asc } = require("drizzle-orm");

module.exports = new (class extends Controller {
  // ارسال پیام خصوصی
  async sendPrivateMessage(req, res) {
    try {
      // const io = req.app.get("io");
      const { id } = req.user; // فرستنده پیام
      const userId = Number(id);

      const { chatId, friendId, content, message_type } = req.body;

      // اعتبارسنجی پایه
      if (!content) {
        return this.response({
          res,
          message: "content is required",
          code: 400,
        });
      }

      let finalChatId = chatId;

      // اگر chatId موجود نبود یا نامعتبر بود، بررسی کنیم آیا قبلاً چتی بین دو نفر ایجاد شده؟
      if (!finalChatId) {
        if (!friendId) {
          return this.response({
            res,
            message: "chatId or friendId must be provided",
            code: 400,
          });
        }

        // پیدا کردن یا ایجاد چت خصوصی بین دو نفر
        let chat = await this.db
          .select()
          .from(this.PrivateChat)
          .where(
            or(
              (c) =>
                eq(c.user1Id, Number(userId)) &&
                eq(c.user2Id, Number(friendId)),
              (c) =>
                eq(c.user1Id, Number(friendId)) && eq(c.user2Id, Number(userId))
            )
          );

        if (chat.length) {
          finalChatId = chat[0].id;
        } else {
          const result = await this.db
            .insert(this.PrivateChat)
            .values({ user1Id: Number(userId), user2Id: Number(friendId) });

          finalChatId = result.insertId;
        }
      }

      // ذخیره پیام
      const result = await this.db.insert(this.Message).values({
        senderId: Number(userId),
        chatType: "private",
        chatId: Number(finalChatId),
        content,
        messageType: message_type || "text",
      });

      const insertedId = result.insertId;

      // گرفتن رکورد واقعی پیام بعد از insert
      const [inserted] = await this.db
        .select()
        .from(this.Message)
        .where(eq(this.Message.id, insertedId));

      // Emit پیام به روم خصوصی
      // io.to(`chat_private_${finalChatId}`).emit("newMessage", inserted);

      return this.response({
        res,
        message: "Private message sent successfully",
        code: 201,
        data: inserted,
      });
    } catch (err) {
      console.error("🔥 sendPrivateMessage error:", err);
      return this.response({
        res,
        message: "Internal server error",
        code: 500,
      });
    }
  }

  // دریافت پیام‌های خصوصی
  async getPrivateMessages(req, res) {
    try {
      const { chatId } = req.params;

      if (!chatId) {
        return this.response({
          res,
          message: "chatId is required",
          code: 400,
        });
      }

      // گرفتن پیام‌ها همراه با اطلاعات فرستنده
      const chatMessages = await this.db
        .select({
          id: this.Message.id,
          senderId: this.Message.senderId,
          chatType: this.Message.chatType,
          chatId: this.Message.chatId,
          content: this.Message.content,
          messageType: this.Message.messageType,
          createdAt: this.Message.createdAt,
          updatedAt: this.Message.updatedAt,
          senderUsername: this.User.username,
          senderProfileImage: this.User.profileImage,
        })
        .from(this.Message)
        .innerJoin(this.User, eq(this.Message.senderId, this.User.id))
        .where(eq(this.Message.chatId, Number(chatId)))
        .orderBy(asc(this.Message.createdAt));

      return this.response({
        res,
        message: "Messages fetched successfully",
        code: 200,
        data: { chatMessages },
      });
    } catch (err) {
      console.error("🔥 getPrivateMessages error:", err);
      return this.response({
        res,
        message: "Internal server error",
        code: 500,
      });
    }
  }
  async initPrivateChat(req, res) {
    try {
      const senderId = Number(req.user?.id);
      const { receiverId } = req.body;

      if (!receiverId) {
        return this.response({
          res,
          code: 400,
          message: "receiverId is required",
        });
      }
      if (receiverId === senderId) {
        return this.response({
          res,
          code: 400,
          message: "You cannot chat with yourself",
        });
      }

      // بررسی اینکه چت از قبل وجود دارد
      let chat = await this.db
        .select()
        .from(this.PrivateChats)
        .where(
          or(
            (c) => eq(c.user1Id, senderId) && eq(c.user2Id, receiverId),
            (c) => eq(c.user1Id, receiverId) && eq(c.user2Id, senderId)
          )
        );

      if (chat.length) {
        return this.response({
          res,
          code: 200,
          message: "Chat already exists",
          data: chat[0],
        });
      }

      // ایجاد چت جدید
      const result = await this.db.insert(this.PrivateChats).values({
        user1Id: senderId,
        user2Id: receiverId,
        createdAt: new Date(),
      });

      const insertedId =
        result.insertId || (Array.isArray(result) ? result[0]?.insertId : null);

      const [newChat] = await this.db
        .select()
        .from(this.PrivateChats)
        .where(eq(this.PrivateChats.id, insertedId));

      return this.response({
        res,
        code: 201,
        message: "Private chat created successfully",
        data: newChat,
      });
    } catch (err) {
      console.error("Error in initPrivateChat:", err);
      return this.response({
        res,
        code: 500,
        message: "Internal server error",
      });
    }
  }
  async getFriendInfo(req, res) {
    try {
      const userId = req.user?.id;
      const chatId = Number(req.params.chatId);

      if (!userId) {
        return this.response({
          res,
          message: "User not authenticated",
          code: 401,
        });
      }

      if (!chatId) {
        return this.response({
          res,
          message: "chatId is required",
          code: 400,
        });
      }
      console.log(chatId, userId);
      // گرفتن چت خصوصی
      const chat = await this.db
        .select()
        .from(this.PrivateChats)
        .where(eq(this.PrivateChats.id, chatId));
      console.log(chat[0].id);

      if (!chat) {
        return this.response({
          res,
          message: "Chat not found",
          code: 404,
        });
      }

      // تعیین دوست
      const friendId =
        chat[0].user1Id === userId ? chat[0].user2Id : chat[0].user1Id;
      console.log(friendId);
      // گرفتن اطلاعات دوست
      const friend = await this.db
        .select({
          id: this.User.id,
          username: this.User.username,
          profileImage: this.User.profileImage,
          displayName: this.User.displayName,
        })
        .from(this.User)
        .where(eq(this.User.id, friendId))
        .limit(1);
      // console.log(friend);
      if (!friend) {
        return this.response({
          res,
          message: "Friend not found",
          code: 404,
        });
      }

      return this.response({
        res,
        message: "Friend info fetched successfully",
        code: 200,
        data: friend[0],
      });
    } catch (err) {
      console.error("🔥 getFriendInfo error:", err);
      return this.response({
        res,
        message: "Internal server error",
        code: 500,
      });
    }
  }
})();
