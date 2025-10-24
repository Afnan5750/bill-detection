import express from "express";
import db from "../db.js";

const router = express.Router();

router.get("/getReasonList", (req, res) => {
  const sql = "SELECT id, det_reason, allowed_months FROM det_reason";

  db.query(sql, (err, results) => {
    if (err) {
      console.error("Error fetching reasons:", err);
      return res.status(500).json({
        status: "500",
        message: "Database query failed",
        error: err.message,
      });
    }

    res.status(200).json({
      status: "200",
      data: results,
    });
  });
});

export default router;
