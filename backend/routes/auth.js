const express = require("express");
const router = express.Router();
const db = require("../db/db");

// request OTP
router.post("/request-otp", (req, res) => {
  const { phone } = req.body;

  if (!phone) {
    return res.status(400).json({ message: "Phone number required" });
  }

  const otp = Math.floor(100000 + Math.random() * 900000).toString();

  const query = "INSERT INTO otp (phone, otp) VALUES (?, ?)";

  db.query(query, [phone, otp], (err) => {
    if (err) {
      console.log(err);
      return res.status(500).json({ message: "DB error" });
    }

    console.log("OTP for", phone, "is", otp); // dev only

    res.json({ message: "OTP sent successfully" });
  });
});

// verify OTP
router.post("/verify-otp", (req, res) => {
  const { phone, otp } = req.body;

  if (!phone || !otp) {
    return res.status(400).json({ message: "Phone and OTP required" });
  }

  const query =
    "SELECT * FROM otp WHERE phone = ? ORDER BY created_at DESC LIMIT 1";

  db.query(query, [phone], (err, result) => {
    if (err) {
      console.log(err);
      return res.status(500).json({ message: "DB error" });
    }

    if (result.length === 0 || result[0].otp !== otp) {
      return res.status(401).json({ message: "Invalid OTP" });
    }

    res.json({ message: "OTP verified successfully" });
  });
});

module.exports = router;
