const multer = require("multer");
const path = require("path");
const fs = require("fs");

// مسیر ذخیره فایل‌ها
const uploadFolder = path.join(process.cwd(), "public/uploads");
if (!fs.existsSync(uploadFolder))
  fs.mkdirSync(uploadFolder, { recursive: true });

// تنظیمات ذخیره multer
const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, uploadFolder),
  filename: async (req, file, cb) => {
    try {
      const ext = path.extname(file.originalname);
      const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
      const newFilename = "avatar-" + uniqueSuffix + ext;

      // حذف آواتار قبلی اگر وجود داشت
      if (req.user && req.user.profileImage) {
        const oldFilePath = path.join(
          process.cwd(),
          "public",
          req.user.profileImage
        );
        if (fs.existsSync(oldFilePath)) {
          fs.unlinkSync(oldFilePath);
          console.log("Old avatar removed:", oldFilePath);
        }
      }

      cb(null, newFilename);
    } catch (err) {
      console.error("Error removing old avatar:", err);
      cb(err);
    }
  },
});

// middleware آپلود یک فایل
const uploadAvatar = multer({ storage }).single("avatar");

module.exports = { uploadAvatar };
