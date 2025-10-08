const jwt = require("jsonwebtoken");
const { users } = require("../models/user");
const User = users;
const db = require("../../db");
const config = require("config");

async function isLoggedIn(req, res, next) {
  try {
    const accessToken = req.headers["access-token"];
    const refreshToken = req.headers["refresh-token"];

    console.log("📥 Incoming Tokens:", {
      accessToken: accessToken || "MISSING",
      refreshToken: refreshToken || "MISSING",
    });

    // اگر accessToken موجود باشد، بررسی می‌کنیم
    if (accessToken) {
      try {
        const decodedAccess = jwt.verify(
          accessToken,
          config.get("jwt_access_secret")
        );
        // بررسی کاربر
        const existing = await db
          .select()
          .from(User)
          .where({ id: decodedAccess.id });
        if (!existing.length || !existing[0].isActive) {
          console.warn("❌ User not found with access token");
          return res
            .status(401)
            .json({ message: "Unauthorized: user not found" });
        }
        req.user = existing[0];
        return next();
      } catch (err) {
        if (err.name !== "TokenExpiredError") {
          console.error("🔥 Access Token error:", err.message);
          return res
            .status(401)
            .json({ message: "Unauthorized: invalid access token" });
        }
        // اگر accessToken منقضی شده باشد، سراغ refreshToken می‌رویم
        if (!refreshToken) {
          console.warn("❌ Access token expired and no refresh token provided");
          return res
            .status(401)
            .json({ message: "Unauthorized: access token expired" });
        }
        try {
          const decodedRefresh = jwt.verify(
            refreshToken,
            config.get("jwt_refresh_secret")
          );
          const existing = await db
            .select()
            .from(User)
            .where({ id: decodedRefresh.id });
          if (!existing.length || !existing[0].isActive) {
            console.warn("❌ User not found with refresh token");
            return res
              .status(401)
              .json({ message: "Unauthorized: user not found" });
          }
          // صدور accessToken جدید
          const newAccessToken = jwt.sign(
            { id: existing[0].id, phone: existing[0].phone },
            config.get("jwt_access_secret"),
            { expiresIn: "15m" }
          );
          console.log("✅ New Access Token generated");

          res.setHeader("access-token", newAccessToken);
          req.user = existing[0];
          return next();
        } catch (refreshErr) {
          console.error("🔥 Refresh Token error:", refreshErr.message);
          return res
            .status(401)
            .json({ message: "Unauthorized: invalid refresh token" });
        }
      }
    } else {
      // اگر accessToken وجود ندارد، بررسی refreshToken
      if (!refreshToken) {
        console.warn("❌ No tokens provided");
        return res.status(401).json({ message: "Unauthorized: no tokens" });
      }
      try {
        const decodedRefresh = jwt.verify(
          refreshToken,
          config.get("jwt_refresh_secret")
        );
        const existing = await db
          .select()
          .from(User)
          .where({ id: decodedRefresh.id });
        if (!existing.length || !existing[0].isActive) {
          console.warn("❌ User not found with refresh token");
          return res
            .status(401)
            .json({ message: "Unauthorized: user not found" });
        }
        const newAccessToken = jwt.sign(
          { id: existing[0].id, phone: existing[0].phone },
          config.get("jwt_access_secret"),
          { expiresIn: "15m" }
        );
        console.log("✅ New Access Token generated via refreshToken");

        res.setHeader("access-token", newAccessToken);
        req.user = existing[0];
        return next();
      } catch (err) {
        console.error("🔥 Refresh Token error:", err.message);
        return res
          .status(401)
          .json({ message: "Unauthorized: invalid refresh token" });
      }
    }
  } catch (err) {
    console.error("🔥 Auth middleware fatal error:", err);
    return res.status(401).json({ message: "Unauthorized: middleware error" });
  }
}

module.exports = isLoggedIn;
