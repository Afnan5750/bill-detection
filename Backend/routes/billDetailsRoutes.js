import express from "express";
import fetch from "node-fetch";

const router = express.Router();

router.post("/billDetails", async (req, res) => {
  const { refNo } = req.body;

  const companyCode = refNo.slice(2, 4);

  try {
    const response = await fetch("https://bill.pitc.com.pk/bill/info", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        refNo: refNo,
        secret_token: "token_4usaid_security",
        app_name: "DetectionOnline",
        companyCode: companyCode,
      }),
    });

    const data = await response.json();
    res.status(200).json(data);
  } catch (error) {
    console.error("Error fetching bill:", error);
    res.status(500).json({ error: "Failed to fetch data from PITC API" });
  }
});

export default router;
