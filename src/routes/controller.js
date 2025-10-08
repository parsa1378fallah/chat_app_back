const db = require("../../db"); // کانکشن Drizzle
const autoBind = require("auto-bind");

// جداول
const { users } = require("../models/user");
const { groups } = require("../models/group");
const { groupMembers } = require("../models/groupMember");
const { channels } = require("../models/channel");
const { channelMembers } = require("../models/channelMember");
const { messages } = require("../models/message");
const { contacts } = require("../models/contact");
const { files } = require("../models/file");
const { unreadMessages } = require("../models/unreadMessage");
const { privateChats } = require("../models/pivateChat");

module.exports = class {
  constructor() {
    autoBind(this);
    this.db = db; // اتصال به دیتابیس

    // جداول
    this.User = users;
    this.Group = groups;
    this.GroupMember = groupMembers;
    this.Channel = channels;
    this.ChannelMember = channelMembers;
    this.Message = messages;
    this.Contact = contacts;
    this.File = files;
    this.UnreadMessage = unreadMessages;
    this.PrivateChats = privateChats;
  }

  // پاسخ استاندارد
  response({ res, message, code = 200, data = {} }) {
    res.status(code).json({ message, data });
  }
};
