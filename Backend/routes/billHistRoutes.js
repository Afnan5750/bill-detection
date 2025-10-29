import express from "express";
import fetch from "node-fetch";

const router = express.Router();

router.post("/billHistory", async (req, res) => {
  const { refNo } = req.body;

  if (!refNo) {
    return res.status(400).json({ error: "Reference number is required" });
  }

  try {
    const response = await fetch(
      "https://detectionbill.pitc.com.pk/api/Consumption/GetConsumption",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ REFERENCE_NO: refNo }),
      }
    );

    const data = await response.json();

    if (!data || data.STATUS !== 1 || !Array.isArray(data.DATA)) {
      return res
        .status(404)
        .json({ message: "No bill history found for this reference number." });
    }

    const monthNames = [
      "Jan", "Feb", "Mar", "Apr", "May", "Jun",
      "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
    ];

    const formattedData = data.DATA.map((item) => {
      const billMonth = item.BILL_MONTH || "";
      const year = billMonth.slice(0, 4);
      const monthNum = parseInt(billMonth.slice(4, 6), 10);
      const monthName = monthNames[monthNum - 1] || "N/A";

      return {
        ...item,
        BILL_MONTH: `${year}-${monthName}`, // ✅ formatted
      };
    });

    res.status(200).json(formattedData);
  } catch (error) {
    console.error("❌ Error fetching bill history:", error);
    res
      .status(500)
      .json({ error: "Failed to fetch bill history from PITC API" });
  }
});

export default router;
