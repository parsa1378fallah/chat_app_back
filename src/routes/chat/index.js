const express = require("express");
const router = express.Router();
const privateChat = require("./private");
const channelChat = require("./channel");
const groupChat = require("./group");
router.use("/private", privateChat);
router.use("/channel", channelChat);
router.use("/group", groupChat);

module.exports = router;
