import express from "express";
import db from "../db.js";
import bcrypt from "bcryptjs";

const router = express.Router();

router.post("/signup", async (req, res) => {
  const {
    user_id,
    user_name,
    user_cnic,
    role_id,
    pwd,
    created_by,
    created_dt,
    status,
  } = req.body;

  if (!user_id || !user_name || !role_id || !pwd) {
    return res.status(400).json({ message: "Required fields missing" });
  }

  try {
    const salt = await bcrypt.genSalt(10);
    const hashedPwd = await bcrypt.hash(pwd, salt);

    const insertSql = `
      INSERT INTO tbl_users 
      (user_id, user_name, user_cnic, role_id, pwd, created_by, created_dt, status)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `;

    db.query(
      insertSql,
      [
        user_id,
        user_name,
        user_cnic || null,
        role_id,
        hashedPwd,
        created_by || "system",
        created_dt || new Date(),
        status || 1,
      ],
      (err2, result) => {
        if (err2) {
          console.error("❌ Database error:", err2);
          return res
            .status(500)
            .json({ message: "Database error", error: err2 });
        }

        res.status(201).json({
          message: "User registered successfully",
          data: { id: result.insertId, user_id, user_name },
        });
      }
    );
  } catch (error) {
    console.error("❌ Signup error:", error);
    res.status(500).json({ message: "Internal server error", error });
  }
});

router.post("/login", async (req, res) => {
  const { user_id, pwd } = req.body;

  if (!user_id || !pwd) {
    return res
      .status(400)
      .json({ message: "User ID and password are required" });
  }

  const sql = `SELECT * FROM tbl_users WHERE user_id = ?`;

  db.query(sql, [user_id], async (err, results) => {
    if (err) {
      console.error("❌ Database error:", err);
      return res.status(500).json({ message: "Database error", error: err });
    }

    if (results.length === 0) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const user = results[0];

    const isMatch = await bcrypt.compare(pwd, user.pwd);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    res.status(200).json({
      message: "Login successful",
      data: {
        user_id: user.user_id,
        user_name: user.user_name,
        user_cnic: user.user_cnic,
        role_id: user.role_id,
        created_by: user.created_by,
        created_dt: user.created_dt,
        status: user.status,
      },
    });
  });
});

router.get("/users", (req, res) => {
  const sql = `SELECT id, user_id, user_name, user_cnic, role_id, pwd ,created_by, created_dt, status FROM tbl_users`; // don't return pwd
  db.query(sql, (err, results) => {
    if (err) {
      console.error("❌ Error fetching users:", err);
      return res.status(500).json({ message: "Database error", error: err });
    }
    res.status(200).json({
      message: "Users fetched successfully",
      data: results,
    });
  });
});

export default router;
