const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const config = require("config");
const Controller = require("../controller");
const { sql } = require("drizzle-orm");
module.exports = new (class extends Controller {
  async register(req, res) {
    try {
      const { phone, username, displayName, password } = req.body;

      if (!phone || !password) {
        return this.response({
          res,
          message: "Phone & password required",
          code: 400,
        });
      }

      // بررسی وجود کاربر بدون eq
      const existing = await this.db
        .select()
        .from(this.User)
        .where(sql`phone = ${phone} OR username = ${username}`);

      if (existing.length) {
        return this.response({
          res,
          message: "Phone or user name already registered",
          code: 400,
        });
      }

      const passwordHash = await bcrypt.hash(password, 10);

      await this.db.insert(this.User).values({
        phone,
        username,
        displayName,
        passwordHash,
      });

      return this.response({
        res,
        message: "User registered ✅",
        code: 200,
        data: { phone, username, displayName },
      });
    } catch (err) {
      console.error(err);
      return this.response({ res, message: "Server error", code: 500 });
    }
  }

  async login(req, res) {
    try {
      const { phone, password } = req.body;
      console.log("📥 Login attempt:", { phone });

      if (!phone || !password) {
        console.warn("❌ Login failed: phone or password missing");
        return this.response({
          res,
          code: 400,
          message: "phone and password required",
        });
      }

      const existing = await this.db.select().from(this.User).where({ phone });
      if (!existing.length) {
        console.warn("❌ Login failed: user not found");
        return this.response({
          res,
          code: 401,
          message: "user not existed or password is incorrect",
        });
      }

      const user = existing[0];
      const isPasswordCorrect = await bcrypt.compare(
        password,
        user.passwordHash
      );
      if (!isPasswordCorrect) {
        console.warn("❌ Login failed: wrong password");
        return this.response({
          res,
          code: 401,
          message: "user not existed or password is incorrect",
        });
      }

      const accessToken = jwt.sign(
        { id: user.id, phone: user.phone },
        config.get("jwt_access_secret"),
        { expiresIn: "15m" }
      );

      const refreshToken = jwt.sign(
        { id: user.id },
        config.get("jwt_refresh_secret"),
        { expiresIn: "7d" }
      );

      await this.db
        .update(this.User)
        .set({ refreshToken })
        .where({ id: user.id });

      // console.log("✅ Tokens created:", {
      //   accessToken: accessToken ? "OK" : "MISSING",
      //   refreshToken: refreshToken ? "OK" : "MISSING",
      // });

      res.setHeader("Access-Token", accessToken);
      res.setHeader("Refresh-Token", refreshToken);

      const { id, phone: userPhone, email, bio, profileImage } = user;
      return this.response({
        res,
        data: {
          id,
          phone: userPhone,
          email,
          bio,
          profileImage,
        },
        message: "user can log in",
      });
    } catch (error) {
      console.error("🔥 Login error:", error);
      return this.response({
        res,
        code: 500,
        message: "Internal server error",
      });
    }
  }
})();
