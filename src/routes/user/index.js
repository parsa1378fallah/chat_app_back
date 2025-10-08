const express = require("express");
const router = express.Router();
const controller = require("./controller");
const isLoggedIn = require("../../middleware/auth");
const { uploadAvatar } = require("../../middleware/uploadAvatar");
router.post("/me", isLoggedIn, controller.me);
router.get("/me/chats", isLoggedIn, controller.getChats);
router.post(
  "/me/uploadUserProfile",
  isLoggedIn,
  uploadAvatar,
  controller.uploadUserProfile
);

module.exports = router;
