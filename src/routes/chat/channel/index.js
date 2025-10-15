const express = require("express");
const controller = require("./controller");
const router = express.Router();
const isLoggedIn = require("../../../middleware/auth");
router.post("/sendMessage", isLoggedIn, controller.sendChannelMessage);
router.get("/getChannelInfo/:channelId", isLoggedIn, controller.getChannelInfo);
router.get("/:chatId", controller.getChannelMessages);
router.post("/init", isLoggedIn, controller.initChannelChat);
router.post("/join", isLoggedIn, controller.joinChannelChat);
router.post("/isOwner", isLoggedIn, controller.isUserOwner);

module.exports = router;
