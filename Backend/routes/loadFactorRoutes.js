import express from "express";
import db from "../db.js";

const router = express.Router();

router.get("/getLoadFactorList", (req, res) => {
  const sql = "SELECT * FROM tbl_load_factor";

  db.query(sql, (err, results) => {
    if (err) {
      console.error("Error fetching load factor data:", err);
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

router.get("/getLoadFactor/:tariffCode", (req, res) => {
  const { tariffCode } = req.params;

  const sql = "SELECT load_factor FROM tbl_load_factor WHERE trf_code = ?";

  db.query(sql, [tariffCode], (err, results) => {
    if (err) {
      console.error("Error fetching load factor:", err);
      return res.status(500).json({
        status: "500",
        message: "Database query failed",
        error: err.message,
      });
    }

    if (results.length === 0) {
      return res.status(404).json({
        status: "404",
        message: "Load factor not found for this tariff code",
      });
    }

    res.status(200).json({
      status: "200",
      data: results[0],
    });
  });
});

export default router;
