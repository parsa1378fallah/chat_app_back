const express = require("express");
const router = express.Router();
const controller = require("./controller");
const isLoggedIn = require("../../middleware/auth");

router.get("/chats", isLoggedIn, controller.searchChats);
module.exports = router;
