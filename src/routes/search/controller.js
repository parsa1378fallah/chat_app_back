const Controller = require("../controller");
const { like, ne, and, eq, or } = require("drizzle-orm");

module.exports = new (class extends Controller {
  async searchChats(req, res) {
    try {
      const { q } = req.query;
      const currentUserId = Number(req.user?.id);

      if (!q) {
        return this.response({
          res,
          message: "Query 'q' is required",
          code: 400,
        });
      }

      if (!currentUserId) {
        return this.response({
          res,
          message: "User not authenticated",
          code: 401,
        });
      }

      // --- 1. کاربران (Private Chats) ---
      const users = await this.db
        .select({ id: this.User.id, name: this.User.username })
        .from(this.User)
        .where(
          and(
            like(this.User.username, `%${q}%`),
            ne(this.User.id, currentUserId)
          )
        );

      const userResults = await Promise.all(
        users.map(async (u) => {
          const chat = await this.db
            .select({ id: this.PrivateChats.id })
            .from(this.PrivateChats)
            .where(
              or(
                and(
                  eq(this.PrivateChats.user1Id, currentUserId),
                  eq(this.PrivateChats.user2Id, u.id)
                ),
                and(
                  eq(this.PrivateChats.user1Id, u.id),
                  eq(this.PrivateChats.user2Id, currentUserId)
                )
              )
            );

          return {
            chatType: "private",
            id: u.id,
            name: u.name,
            chatId: chat && chat[0] ? chat[0].id : null,
            isMember: chat && chat.length > 0,
          };
        })
      );

      // --- 2. گروه‌ها ---
      const groups = await this.db
        .select({ id: this.Group.id, name: this.Group.name })
        .from(this.Group)
        .where(like(this.Group.name, `%${q}%`));

      const groupResults = await Promise.all(
        groups.map(async (g) => {
          const member = await this.db
            .select()
            .from(this.GroupMember)
            .where(
              and(
                eq(this.GroupMember.groupId, g.id),
                eq(this.GroupMember.userId, currentUserId)
              )
            );

          return {
            chatType: "group",
            id: g.id,
            name: g.name,
            chatId: g.id,
            isMember: member && member.length > 0,
          };
        })
      );

      // --- 3. کانال‌ها ---
      const channels = await this.db
        .select({ id: this.Channel.id, name: this.Channel.name })
        .from(this.Channel)
        .where(like(this.Channel.name, `%${q}%`));

      const channelResults = await Promise.all(
        channels.map(async (c) => {
          const member = await this.db
            .select()
            .from(this.ChannelMember)
            .where(
              and(
                eq(this.ChannelMember.channelId, c.id),
                eq(this.ChannelMember.userId, currentUserId)
              )
            );

          return {
            chatType: "channel",
            id: c.id,
            name: c.name,
            chatId: c.id,
            isMember: member && member.length > 0,
          };
        })
      );

      // --- 4. خروجی نهایی ---
      const allResults = [...userResults, ...groupResults, ...channelResults];

      return this.response({
        res,
        message: "Search results fetched successfully",
        code: 200,
        data: allResults,
      });
    } catch (err) {
      console.error("🔥 searchChats error:", err);
      return this.response({
        res,
        message: "Internal server error",
        code: 500,
      });
    }
  }
})();
