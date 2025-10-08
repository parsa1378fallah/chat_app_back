const express = require("express");
const controller = require("./controller");
const router = express.Router();
const isLoggedIn = require("../../../middleware/auth");
router.post("/sendMessage", isLoggedIn, controller.sendPrivateMessage);
router.get("/getMessages/:chatId", controller.getPrivateMessages);
router.get("/:chatId/friend", isLoggedIn, controller.getFriendInfo);
router.post("/init", isLoggedIn, controller.initPrivateChat);

module.exports = router;
