import express from "express";
import db from "../db.js";

const router = express.Router();

router.get("/getTariffList", (req, res) => {
  const sql = "SELECT * FROM tbl_tariff";

  db.query(sql, (err, results) => {
    if (err) {
      console.error("Error fetching tariff data:", err);
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
