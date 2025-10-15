const express = require("express");
const controller = require("./controller");
const router = express.Router();
const isLoggedIn = require("../../../middleware/auth");

router.post("/sendMessage", isLoggedIn, controller.sendGroupMessage);
router.get("/getGroupInfo/:groupId", isLoggedIn, controller.getGroupInfo);
router.get("/:chatId", controller.getGroupMessages);
router.post("/init", isLoggedIn, controller.initGroupChat);
router.post("/join", isLoggedIn, controller.joinGroupChat);

module.exports = router;
