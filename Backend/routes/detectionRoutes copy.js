import express from "express";
import db from "../db.js";
import { format } from "date-fns";

const router = express.Router();

router.get("/detectionList", (req, res) => {
  const sql = `SELECT * FROM tbl_detection_trx ORDER BY id ASC`;

  db.query(sql, (err, results) => {
    if (err) {
      console.error("❌ Error fetching records:", err);
      return res.status(500).json({ message: "Database error", error: err });
    }

    res.status(200).json({
      message: "200",
      data: results,
    });
  });
});

function monthYearToDateString(monthYear) {
  if (!monthYear || typeof monthYear !== "string") return null;

  monthYear = monthYear.trim();

  // ✅ Case 1: Format is "YYYY-MM"
  const yearMonthMatch = monthYear.match(/^(\d{4})[-/](\d{2})$/);
  if (yearMonthMatch) {
    const [_, year, month] = yearMonthMatch;
    return `${year}-${month}-01`;
  }

  // ✅ Case 2: Format is "MMM-YY" or "MMM-YYYY"
  monthYear =
    monthYear.charAt(0).toUpperCase() +
    monthYear.slice(1, 3).toLowerCase() +
    monthYear.slice(3);

  const [mon, yr] = monthYear.split("-");
  const months = {
    Jan: "01",
    Feb: "02",
    Mar: "03",
    Apr: "04",
    May: "05",
    Jun: "06",
    Jul: "07",
    Aug: "08",
    Sep: "09",
    Oct: "10",
    Nov: "11",
    Dec: "12",
  };

  const month = months[mon];
  if (!month) {
    console.warn("⚠️ Invalid month format:", monthYear);
    return null;
  }

  let year = yr;
  if (year.length === 2) year = `20${year}`;
  if (year.length !== 4 || isNaN(year)) {
    console.warn("⚠️ Invalid year format:", monthYear);
    return null;
  }

  return `${year}-${month}-01`;
}

router.post("/submit", (req, res) => {
  const {
    refno,
    cons_name,
    tariff,
    sanction_load,
    connected_load,
    checked_by,
    remarks,
    reason_id,
    charging_prd_days,
    units_assessed,
    units_already_charged,
    units_chargeable,
    det_notice_no,
    det_notice_dt,
    created_by,
    approved_by,
    modified_by,
    det_start_dt,
    det_end_dt,
    b_month,
    billHistory,
  } = req.body;

  const sqlDetection = `
    INSERT INTO tbl_detection_trx (
      refno, cons_name, tariff, sanction_load, connected_load,
      checked_by, remarks, reason_id, charging_prd_days, units_assessed,
      units_already_charged, units_chargeable, det_notice_no, det_notice_dt,
      created_by, approved_by, modified_by, det_start_dt, det_end_dt, b_month,
      created_dt, approved_dt, modified_dt
    )
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW(), NOW())
  `;

  const detectionValues = [
    refno,
    cons_name,
    tariff,
    parseFloat(sanction_load),
    parseFloat(connected_load),
    checked_by,
    remarks,
    reason_id,
    charging_prd_days,
    units_assessed,
    units_already_charged,
    units_chargeable,
    det_notice_no,
    det_notice_dt,
    created_by,
    approved_by,
    modified_by,
    det_start_dt,
    det_end_dt,
    b_month,
  ];

  db.query(sqlDetection, detectionValues, (err, result) => {
    if (err) {
      console.error("❌ Error inserting record:", err);
      return res.status(500).json({ message: "Database error", error: err });
    }

    const det_trx_id = result.insertId;
    console.log("✅ Main record inserted with ID:", det_trx_id);

    if (Array.isArray(billHistory) && billHistory.length > 0) {
      const billValues = billHistory.map((item) => [
        monthYearToDateString(item.month),
        item.units,
        det_trx_id,
      ]);

      const sqlBillHistory = `
        INSERT INTO units_cons_hist (b_month, units_charged, det_trx_id)
        VALUES ?
      `;

      db.query(sqlBillHistory, [billValues], (err2) => {
        if (err2) {
          console.error("❌ Error inserting bill history:", err2);
          return res.status(500).json({
            message: "Detection saved, but error saving bill history",
            error: err2,
          });
        }

        console.log("✅ Bill history inserted successfully!");
        res.status(200).json({
          message: "Form data and bill history stored successfully!",
          id: det_trx_id,
        });
      });
    } else {
      res.status(200).json({
        message: "Form data stored successfully (no bill history provided)",
        id: det_trx_id,
      });
    }
  });
});

router.get("/detection/:id", (req, res) => {
  const { id } = req.params;

  const sqlDetection = `SELECT * FROM tbl_detection_trx WHERE id = ?`;
  const sqlBillHistory = `
    SELECT 
      DATE_FORMAT(b_month, '%Y-%m') AS b_month, 
      units_charged 
    FROM units_cons_hist 
    WHERE det_trx_id = ? 
    ORDER BY b_month ASC
  `;

  db.query(sqlDetection, [id], (err, detectionResult) => {
    if (err) {
      console.error("❌ Error fetching detection:", err);
      return res.status(500).json({ error: "Error fetching detection" });
    }

    if (detectionResult.length === 0) {
      return res.status(404).json({ message: "Detection not found" });
    }

    db.query(sqlBillHistory, [id], (err, billHistoryResult) => {
      if (err) {
        console.error("❌ Error fetching bill history:", err);
        return res.status(500).json({ error: "Error fetching bill history" });
      }

      res.json({
        detection: detectionResult[0],
        billHistory: billHistoryResult.map((row) => ({
          ...row,
          b_month: row.b_month || "", // ensure string
        })),
      });
    });
  });
});

router.put("/update/:id", (req, res) => {
  const { id } = req.params;
  const {
    refno,
    cons_name,
    tariff,
    sanction_load,
    connected_load,
    checked_by,
    remarks,
    reason_id,
    charging_prd_days,
    units_assessed,
    units_already_charged,
    units_chargeable,
    det_notice_no,
    det_notice_dt,
    created_by,
    approved_by,
    modified_by,
    det_start_dt,
    det_end_dt,
    billHistory,
  } = req.body;

  const sqlUpdate = `
    UPDATE tbl_detection_trx SET
      refno = ?, cons_name = ?, tariff = ?, sanction_load = ?, connected_load = ?,
      checked_by = ?, remarks = ?, reason_id = ?, charging_prd_days = ?, units_assessed = ?,
      units_already_charged = ?, units_chargeable = ?, det_notice_no = ?, det_notice_dt = ?,
      created_by = ?, approved_by = ?, modified_by = ?, det_start_dt = ?, det_end_dt = ?,
      approved_dt = NOW(), modified_dt = NOW()
    WHERE id = ?
  `;

  const updateValues = [
    refno,
    cons_name,
    tariff,
    parseFloat(sanction_load) || 0,
    parseFloat(connected_load) || 0,
    checked_by,
    remarks,
    reason_id,
    charging_prd_days,
    units_assessed,
    units_already_charged,
    units_chargeable,
    det_notice_no,
    det_notice_dt,
    created_by,
    approved_by,
    modified_by,
    det_start_dt,
    det_end_dt,
    id,
  ];

  db.query(sqlUpdate, updateValues, (err, result) => {
    if (err) {
      console.error("❌ Error updating record:", err);
      return res.status(500).json({ message: "Database error", error: err });
    }

    if (Array.isArray(billHistory) && billHistory.length > 0) {
      const deleteOld = `DELETE FROM units_cons_hist WHERE det_trx_id = ?`;

      db.query(deleteOld, [id], (errDel) => {
        if (errDel) {
          console.error("❌ Error deleting old bill history:", errDel);
          return res.status(500).json({
            message:
              "Record updated but failed to update bill history (delete)",
            error: errDel,
          });
        }

        const billValues = billHistory.map((item) => [
          monthYearToDateString(item.month),
          item.units,
          id,
        ]);

        const sqlBillHistory = `
          INSERT INTO units_cons_hist (b_month, units_charged, det_trx_id)
          VALUES ?
        `;

        db.query(sqlBillHistory, [billValues], (err2) => {
          if (err2) {
            console.error("❌ Error inserting new bill history:", err2);
            return res.status(500).json({
              message: "Record updated but failed to insert new bill history",
              error: err2,
            });
          }

          console.log("✅ Bill history updated successfully!");
          res.status(200).json({
            message: "Record and bill history updated successfully!",
            id,
          });
        });
      });
    } else {
      res.status(200).json({
        message: "Record updated successfully (no bill history provided)",
        id,
      });
    }
  });
});

export default router;
