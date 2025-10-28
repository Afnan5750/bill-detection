// billHistRoutes.js
import express from "express";
import fetch from "node-fetch";

const router = express.Router();

// 🔹 Route to fetch bill history from PITC DetectionBill API
router.post("/billHistory", async (req, res) => {
  const { refNo } = req.body;

  if (!refNo) {
    return res.status(400).json({ error: "Reference number is required" });
  }

  try {
    const response = await fetch("https://detectionbill.pitc.com.pk/api/Consumption/GetConsumption", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ REFERENCE_NO: refNo }),
    });

    const data = await response.json();

    if (!data || data.STATUS !== 1) {
      return res.status(404).json({ message: "No bill history found for this reference number." });
    }

    // Return only the bill history data
    res.status(200).json(data.DATA);
  } catch (error) {
    console.error("Error fetching bill history:", error);
    res.status(500).json({ error: "Failed to fetch bill history from PITC API" });
  }
});

export default router;
