const express = require("express");
const router = express.Router();
const db = require("../db/db");

// REQUEST OTP
router.post("/request-otp", (req, res) => {
  const { phone } = req.body;

  if (!phone) {
    return res.status(400).json({ message: "Phone number required" });
  }

  const otp = Math.floor(100000 + Math.random() * 900000).toString();

  const insertOtp = "INSERT INTO otp (phone, otp) VALUES (?, ?)";

  db.query(insertOtp, [phone, otp], (err) => {
    if (err) {
      console.log(err);
      return res.status(500).json({ message: "DB error" });
    }

    // Dev only (SMS later)
    console.log("OTP for", phone, "is", otp);

    res.json({ message: "OTP sent successfully" });
  });
});

// VERIFY OTP + LOGIN + WALLET CREATION
router.post("/verify-otp", (req, res) => {
  const { phone, otp } = req.body;

  if (!phone || !otp) {
    return res.status(400).json({
      message: "Phone and OTP required"
    });
  }

  const getOtp =
    "SELECT * FROM otp WHERE phone = ? ORDER BY created_at DESC LIMIT 1";

  db.query(getOtp, [phone], (err, otpResult) => {
    if (err) {
      console.log(err);
      return res.status(500).json({ message: "DB error" });
    }

    if (otpResult.length === 0 || otpResult[0].otp !== otp) {
      return res.status(401).json({ message: "Invalid OTP" });
    }

    // OTP valid → check user
    const getUser = "SELECT * FROM users WHERE phone = ?";

    db.query(getUser, [phone], (err, users) => {
      if (err) {
        console.log(err);
        return res.status(500).json({ message: "DB error" });
      }

      if (users.length === 0) {
        // create new user
        const createUser =
          "INSERT INTO users (name, phone) VALUES (?, ?)";

        db.query(createUser, ["User", phone], (err, userResult) => {
          if (err) {
            console.log(err);
            return res.status(500).json({ message: "User creation failed" });
          }

          createWallet(userResult.insertId, res);
        });
      } else {
        createWallet(users[0].id, res);
      }
    });
  });
});

// CREATE WALLET IF NOT EXISTS
function createWallet(userId, res) {
  const getWallet =
    "SELECT * FROM wallets WHERE user_id = ?";

  db.query(getWallet, [userId], (err, wallet) => {
    if (err) {
      console.log(err);
      return res.status(500).json({ message: "Wallet error" });
    }

    if (wallet.length === 0) {
      const createWalletQuery =
        "INSERT INTO wallets (user_id, balance) VALUES (?, ?)";

      db.query(createWalletQuery, [userId, 0], (err) => {
        if (err) {
          console.log(err);
          return res.status(500).json({ message: "Wallet creation failed" });
        }

        return res.json({
          message: "Login successful",
          userId: userId,
          balance: 0
        });
      });
    } else {
      return res.json({
        message: "Login successful",
        userId: userId,
        balance: wallet[0].balance
      });
    }
  });
}

module.exports = router;
