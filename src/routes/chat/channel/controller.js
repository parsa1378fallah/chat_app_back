const Controller = require("../../controller");
const { eq, or, asc } = require("drizzle-orm");

module.exports = new (class extends Controller {
  // ارسال پیام به کانال
  async sendChannelMessage(req, res) {
    try {
      const { id } = req.user; // فرستنده پیام
      const userId = Number(id);
      const { channelId, content, message_type } = req.body;

      // بررسی مقادیر ورودی
      if (!channelId || !content) {
        return this.response({
          res,
          message: "Channel ID and content are required",
          code: 400,
        });
      }

      // پیدا کردن کانال
      const [channel] = await this.db
        .select()
        .from(this.Channel)
        .where(eq(this.Channel.id, channelId));

      if (!channel) {
        return this.response({
          res,
          message: "Channel not found",
          code: 404,
        });
      }

      // بررسی مالکیت کانال
      if (channel.createdBy !== userId) {
        return this.response({
          res,
          message: "Only the channel creator can send messages",
          code: 403,
        });
      }

      // ثبت پیام در جدول messages
      const result = await this.db.insert(this.Message).values({
        senderId: userId,
        chatType: "channel",
        chatId: channelId,
        content,
        messageType: message_type || "text",
        createdAt: new Date(),
      });

      const insertedId = result.insertId;

      // واکشی پیام درج‌شده
      const [inserted] = await this.db
        .select()
        .from(this.Message)
        .where(eq(this.Message.id, insertedId));

      // در صورت نیاز: انتشار پیام به روم کانال
      // io.to(`channel_${channelId}`).emit("newMessage", inserted);

      return this.response({
        res,
        code: 201,
        message: "Channel message sent successfully",
        data: inserted,
      });
    } catch (err) {
      console.error("🔥 sendChannelMessage error:", err);
      return this.response({
        res,
        message: "Internal server error",
        code: 500,
      });
    }
  }

  // دریافت پیام‌های کانال
  async getChannelMessages(req, res) {
    try {
      const chatId = Number(req.params.chatId);

      if (!chatId) {
        return this.response({
          res,
          message: "channelId is required",
          code: 400,
        });
      }

      // گرفتن پیام‌ها به همراه اطلاعات فرستنده (username و profile_image)
      const channelMessages = await this.db
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
        .where(eq(this.Message.chatId, chatId))
        .orderBy(asc(this.Message.createdAt));

      return this.response({
        res,
        message: "Messages fetched successfully",
        code: 200,
        data: { channelMessages },
      });
    } catch (err) {
      console.error("🔥 getChannelMessages error:", err);
      return this.response({
        res,
        message: "Internal server error",
        code: 500,
      });
    }
  }

  // ایجاد چت کانال جدید
  async initChannelChat(req, res) {
    try {
      const userId = req.user.id;
      const { channelName } = req.body;

      if (!channelName) {
        return this.response({
          res,
          message: "Channel name is required",
          code: 400,
        });
      }

      // بررسی اینکه آیا کانال از قبل وجود دارد
      let existingChannel = await this.db
        .select()
        .from(this.Channel)
        .where(eq(this.Channel.name, channelName));

      if (existingChannel.length) {
        return this.response({
          res,
          code: 200,
          message: "Channel already exists",
          data: existingChannel[0],
        });
      }

      // ایجاد کانال جدید
      const [result] = await this.db.insert(this.Channel).values({
        name: channelName,
        createdBy: userId,
        createdAt: new Date(),
      });

      const insertedId = result.insertId;

      // 🧩 اضافه‌کردن سازنده به عنوان اولین عضو کانال
      await this.db.insert(this.ChannelMember).values({
        channelId: insertedId,
        userId: userId,
        role: "admin", // یا "owner" بسته به ساختار نقش‌ها
        joinedAt: new Date(),
      });

      // دریافت کانال ایجادشده
      const [newChannel] = await this.db
        .select()
        .from(this.Channel)
        .where(eq(this.Channel.id, insertedId));

      return this.response({
        res,
        code: 201,
        message: "Channel created successfully",
        data: newChannel,
      });
    } catch (err) {
      console.error("Error in initChannelChat:", err);
      return this.response({
        res,
        code: 500,
        message: "Internal server error",
      });
    }
  }
  // ثبت چت کانال جدید (برای عضویت کاربران)
  async joinChannelChat(req, res) {
    try {
      const userId = req.user?.id;
      const { channelId } = req.body;

      if (!channelId) {
        return this.response({
          res,
          message: "channelId is required",
          code: 400,
        });
      }

      // بررسی که کاربر قبلاً عضو کانال هست یا نه
      const existingMember = await this.db
        .select()
        .from(this.ChannelMember)
        .where(
          eq(this.ChannelMember.channelId, channelId) &&
            eq(this.ChannelMember.userId, userId)
        );

      if (existingMember.length) {
        return this.response({
          res,
          message: "You are already a member of this channel",
          code: 400,
        });
      }

      // ثبت نام کاربر در کانال
      const result = await this.db.insert(this.ChannelMember).values({
        userId,
        channelId,
        joinedAt: new Date(),
      });

      return this.response({
        res,
        message: "User added to channel successfully",
        code: 201,
      });
    } catch (err) {
      console.error("Error in registerChannelChat:", err);
      return this.response({
        res,
        code: 500,
        message: "Internal server error",
      });
    }
  }
  async isUserOwner(req, res) {
    try {
      const userId = req.user?.id;
      const { channelId } = req.body;
      const channelIdNum = Number(channelId);

      console.log("userId:", userId, "channelId:", channelIdNum);

      if (!userId) {
        return res.status(401).json({ message: "User not authenticated" });
      }

      if (!channelIdNum) {
        return res.status(400).json({ message: "channelId is required" });
      }

      const channel = await this.db
        .select()
        .from(this.Channel)
        .where(eq(this.Channel.id, channelIdNum));

      if (!channel.length) {
        return res.status(404).json({ message: "Channel not found" });
      }
      console.log(channel, userId);
      const isOwner = channel[0].createdBy === userId;
      console.log(isOwner);
      return this.response({
        res,
        message: "situation cleared",
        code: 200,
        data: { isOwner },
      });
    } catch (err) {
      console.error("Error in isUserOwner:", err);
      return res.status(500).json({ message: "Internal server error" });
    }
  }
})();
