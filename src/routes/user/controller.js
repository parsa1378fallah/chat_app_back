const controller = require("../controller");
const sanitize = require("../../../utiles/sanitize");
const { eq, or, desc, inArray } = require("drizzle-orm");
const c = require("config");
const db = require("../../../db"); // Drizzle instance

module.exports = new (class extends controller {
  async me(req, res) {
    if (!req.user) return;
    const user = sanitize({ ...req.user }, ["passwordHash", "refreshToken"]);
    return this.response({
      res,
      code: 200,
      message: "user logged in by access token token",
      data: { ...user },
    });
  }
  async getChats(req, res) {
    try {
      const userId = Number(req.user.id);
      if (!userId)
        return this.response({ res, code: 401, message: "Unauthorized" });

      const chats = [];

      // ------------------- Private Chats -------------------
      const privateChats = await this.db
        .select()
        .from(this.PrivateChats)
        .where(
          or(
            eq(this.PrivateChats.user1Id, userId),
            eq(this.PrivateChats.user2Id, userId)
          )
        );
      if (privateChats.length > 0) {
        const otherUserIds = privateChats.map((c) =>
          c.user1Id === userId ? c.user2Id : c.user1Id
        );
        const usersMap = {};

        if (otherUserIds.length > 0) {
          const otherUsers = await this.db
            .select({
              id: this.User.id,
              username: this.User.username,
              displayName: this.User.displayName,
              profileImage: this.User.profileImage,
            })
            .from(this.User)
            .where(inArray(this.User.id, otherUserIds));

          otherUsers.forEach((u) => {
            usersMap[u.id] = u;
          });
        }

        for (const c of privateChats) {
          const lastMsg = await this.db
            .select()
            .from(this.Message)
            .where(
              eq(this.Message.chatType, "private"),
              eq(this.Message.chatId, c.id)
            )
            .orderBy(desc(this.Message.createdAt))
            .limit(1);

          const otherUserId = c.user1Id === userId ? c.user2Id : c.user1Id;
          const otherUser = usersMap[otherUserId];

          chats.push({
            id: c.id,
            chatType: "private",
            name: otherUser?.displayName || otherUser?.username || "Unknown",
            avatar: otherUser?.profileImage || null,
            participants: [c.user1Id, c.user2Id],
            lastMessage: lastMsg[0]?.content || null,
            lastMessageAt: lastMsg[0]?.createdAt || c.createdAt,
          });
        }
      }

      // ------------------- Group Chats -------------------
      const groupChats = await this.db
        .select({
          id: this.Group.id,
          name: this.Group.name,
          description: this.Group.description,
          createdBy: this.Group.createdBy,
          role: this.GroupMember.role,
          createdAt: this.Group.createdAt,
        })
        .from(this.Group)
        .innerJoin(
          this.GroupMember,
          eq(this.Group.id, this.GroupMember.groupId)
        )
        .where(eq(this.GroupMember.userId, userId));

      for (const c of groupChats) {
        const lastMsg = await this.db
          .select()
          .from(this.Message)
          .where(
            eq(this.Message.chatType, "group"),
            eq(this.Message.chatId, c.id)
          )
          .orderBy(desc(this.Message.createdAt))
          .limit(1);

        chats.push({
          id: c.id,
          chatType: "group",
          name: c.name,
          description: c.description,
          createdBy: c.createdBy,
          role: c.role,
          lastMessage: lastMsg[0]?.content || null,
          lastMessageAt: lastMsg[0]?.createdAt || c.createdAt,
        });
      }

      // ------------------- Channel Chats -------------------
      const channelChats = await this.db
        .select({
          id: this.Channel.id,
          name: this.Channel.name,
          description: this.Channel.description,
          createdBy: this.Channel.createdBy,
          role: this.ChannelMember.role,
          createdAt: this.Channel.createdAt,
        })
        .from(this.Channel)
        .innerJoin(
          this.ChannelMember,
          eq(this.Channel.id, this.ChannelMember.channelId)
        )
        .where(eq(this.ChannelMember.userId, userId));

      for (const c of channelChats) {
        const lastMsg = await this.db
          .select()
          .from(this.Message)
          .where(
            eq(this.Message.chatType, "channel"),
            eq(this.Message.chatId, c.id)
          )
          .orderBy(desc(this.Message.createdAt))
          .limit(1);

        chats.push({
          id: c.id,
          chatType: "channel",
          name: c.name,
          description: c.description,
          createdBy: c.createdBy,
          role: c.role,
          lastMessage: lastMsg[0]?.content || null,
          lastMessageAt: lastMsg[0]?.createdAt || c.createdAt,
        });
      }

      // ------------------- Sort by last message -------------------
      chats.sort(
        (a, b) => new Date(b.lastMessageAt) - new Date(a.lastMessageAt)
      );

      return this.response({
        res,
        message: "Chats fetched successfully",
        code: 200,
        data: chats,
      });
    } catch (err) {
      console.error("🔥 getChats error:", err);
      return this.response({
        res,
        message: "Internal server error",
        code: 500,
      });
    }
  }
  async uploadUserProfile(req, res) {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({ message: "کاربر پیدا نشد", data: {} });
      }

      const file = req.file;
      if (!file) {
        return res.status(400).json({ message: "فایل ارسال نشده", data: {} });
      }

      const fileUrl = `/uploads/${file.filename}`;

      // استفاده از Drizzle
      await this.db
        .update(this.User)
        .set({ profileImage: fileUrl })
        .where(eq(this.User.id, userId));

      return this.response({
        res,
        message: "image uploaded",
        data: { profileImage: fileUrl },
      });
    } catch (error) {
      console.error("🔥 uploadUserProfile error:", error);
      return res.status(500).json({ message: "خطا در آپلود فایل", data: {} });
    }
  }
})();
