const Controller = require("../../controller");
const { eq, or, asc } = require("drizzle-orm");

module.exports = new (class extends Controller {
  // ارسال پیام به گروه
  async sendGroupMessage(req, res) {
    try {
      const { id } = req.user; // فرستنده پیام
      const userId = Number(id);
      const { chatId, content, message_type } = req.body;

      // اعتبارسنجی پایه
      if (!content) {
        return this.response({
          res,
          message: "content is required",
          code: 400,
        });
      }

      // ذخیره پیام
      const result = await this.db.insert(this.Message).values({
        senderId: Number(userId),
        chatType: "group",
        chatId: Number(chatId),
        content,
        messageType: message_type || "text",
      });

      const insertedId = result.insertId;

      // گرفتن رکورد واقعی پیام بعد از insert
      const [inserted] = await this.db
        .select()
        .from(this.Message)
        .where(eq(this.Message.id, insertedId));

      // Emit پیام به روم گروه
      // io.to(`group_${chatId}`).emit("newMessage", inserted);

      return this.response({
        res,
        message: "Group message sent successfully",
        code: 201,
        data: inserted,
      });
    } catch (err) {
      console.error("🔥 sendGroupMessage error:", err);
      return this.response({
        res,
        message: "Internal server error",
        code: 500,
      });
    }
  }

  // دریافت پیام‌های گروه
  async getGroupMessages(req, res) {
    try {
      const { chatId } = req.params;

      if (!chatId) {
        return this.response({
          res,
          message: "chatId is required",
          code: 400,
        });
      }

      // گرفتن پیام‌ها به همراه اطلاعات فرستنده (یوزرنیم و عکس پروفایل)
      const groupMessages = await this.db
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
        data: groupMessages,
      });
    } catch (err) {
      console.error("🔥 getGroupMessages error:", err);
      return this.response({
        res,
        message: "Internal server error",
        code: 500,
      });
    }
  }

  // ایجاد چت گروهی جدید
  async initGroupChat(req, res) {
    try {
      const userId = req.user?.id; // شناسه کاربر فعلی
      const { groupName } = req.body;

      if (!groupName || !groupName.trim()) {
        return this.response({
          res,
          code: 400,
          message: "نام گروه الزامی است",
        });
      }

      // بررسی اینکه گروه با همین نام از قبل وجود نداشته باشد
      const existingGroup = await this.db
        .select()
        .from(this.Group)
        .where(eq(this.Group.name, groupName));

      if (existingGroup.length) {
        return this.response({
          res,
          code: 200,
          message: "گروه از قبل وجود دارد",
          data: existingGroup[0],
        });
      }

      // ایجاد گروه جدید
      const [result] = await this.db
        .insert(this.Group)
        .values({
          name: groupName,
          createdBy: userId,
          createdAt: new Date(),
        })
        .execute();

      const newGroupId = result.insertId;
      console.log(newGroupId);
      if (!newGroupId) {
        throw new Error("شناسه گروه ایجاد شده دریافت نشد");
      }
      console.log(newGroupId);
      // گرفتن داده گروه ایجاد شده با همان شناسه
      const [newGroup] = await this.db
        .select()
        .from(this.Group)
        .where(eq(this.Group.id, newGroupId));
      console.log(newGroupId, newGroup);
      if (!newGroup) {
        throw new Error("گروه ایجاد شده پیدا نشد");
      }

      // اضافه کردن سازنده به جدول اعضای گروه
      await this.db
        .insert(this.GroupMember)
        .values({
          groupId: newGroupId,
          userId: userId,
          role: "owner",
          joinedAt: new Date(),
        })
        .execute();

      return this.response({
        res,
        code: 201,
        message: "گروه با موفقیت ایجاد شد",
        data: newGroup,
      });
    } catch (err) {
      console.error("Error in initGroupChat:", err);
      return this.response({
        res,
        code: 500,
        message: "خطای داخلی سرور",
      });
    }
  }

  // پیوستن به گروه
  // پیوستن به گروه
  async joinGroupChat(req, res) {
    try {
      const userId = req.user?.id;
      const { groupId } = req.body;

      if (!groupId) {
        return this.response({
          res,
          message: "groupId is required",
          code: 400,
        });
      }

      // بررسی اینکه کاربر از قبل عضو گروه هست یا نه
      const existingMember = await this.db
        .select()
        .from(this.GroupMember)
        .where(
          eq(this.GroupMember.groupId, Number(groupId)) &&
            eq(this.GroupMember.userId, Number(userId))
        );

      if (existingMember.length) {
        return this.response({
          res,
          message: "You are already a member of this group",
          code: 400,
        });
      }

      // اضافه کردن کاربر به گروه
      await this.db.insert(this.GroupMember).values({
        userId: Number(userId),
        groupId: Number(groupId),
        joinedAt: new Date(),
      });

      // گرفتن اطلاعات گروه
      const [group] = await this.db
        .select({
          id: this.Group.id,
          name: this.Group.name,
          createdAt: this.Group.createdAt,
        })
        .from(this.Group)
        .where(eq(this.Group.id, Number(groupId)));

      if (!group) {
        return this.response({
          res,
          code: 404,
          message: "Group not found",
        });
      }

      // گرفتن آخرین پیام گروه (اختیاری)
      const [lastMessage] = await this.db
        .select({
          content: this.Message.content,
          createdAt: this.Message.createdAt,
        })
        .from(this.Message)
        .where(eq(this.Message.chatId, Number(groupId)))
        .orderBy(asc(this.Message.createdAt)) // اگر خواستی می‌تونی desc هم بذاری برای آخرین پیام
        .limit(1);

      // ساخت آبجکت نهایی در قالب Chat
      const chatData = {
        id: group.id,
        chatType: "group",
        name: group.name,
        lastMessage: lastMessage?.content || null,
        lastMessageAt: lastMessage?.createdAt || null,
        avatar: null, // اگر خواستی برای گروه‌ها آواتار اضافه کنی
        unread: 0,
        time: lastMessage?.createdAt || null,
      };

      return this.response({
        res,
        message: "User joined the group successfully",
        code: 201,
        data: chatData,
      });
    } catch (err) {
      console.error("Error in joinGroupChat:", err);
      return this.response({
        res,
        code: 500,
        message: "Internal server error",
      });
    }
  }

  // دریافت اطلاعات کامل گروه
  async getGroupInfo(req, res) {
    try {
      const { groupId } = req.params;
      console.log(groupId, "cccc");

      // بررسی ورودی
      if (!groupId) {
        return this.response({
          res,
          code: 400,
          message: "groupId is required",
        });
      }

      // گرفتن اطلاعات گروه
      const [group] = await this.db
        .select({
          id: this.Group.id,
          name: this.Group.name,
          createdBy: this.Group.createdBy,
          createdAt: this.Group.createdAt,
        })
        .from(this.Group)
        .where(eq(this.Group.id, Number(groupId)));

      if (!group) {
        return this.response({
          res,
          code: 404,
          message: "Group not found",
        });
      }

      // گرفتن اطلاعات سازنده گروه
      const [creator] = await this.db
        .select({
          id: this.User.id,
          username: this.User.username,
          profileImage: this.User.profileImage,
        })
        .from(this.User)
        .where(eq(this.User.id, group.createdBy));

      // گرفتن اعضای گروه
      const members = await this.db
        .select({
          id: this.User.id,
          username: this.User.username,
          profileImage: this.User.profileImage,
          role: this.GroupMember.role,
          joinedAt: this.GroupMember.joinedAt,
        })
        .from(this.GroupMember)
        .innerJoin(this.User, eq(this.GroupMember.userId, this.User.id))
        .where(eq(this.GroupMember.groupId, Number(groupId)));

      // ترکیب همه داده‌ها
      const groupInfo = {
        ...group,
        creator: creator || null,
        members,
        membersCount: members.length,
      };

      return this.response({
        res,
        code: 200,
        message: "Group info fetched successfully",
        data: groupInfo,
      });
    } catch (err) {
      console.error("🔥 getGroupInfo error:", err);
      return this.response({
        res,
        code: 500,
        message: "Internal server error",
      });
    }
  }
})();
