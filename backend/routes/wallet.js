const express = require("express");
const router = express.Router();
const db = require("../db/db");

router.get("/:userId", (req, res) => {
  const userId = req.params.userId;

  const query =
    "SELECT balance FROM wallets WHERE user_id = ?";

  db.query(query, [userId], (err, result) => {
    if (err) {
      console.log(err);
      return res.status(500).json({ message: "DB error" });
    }

    if (result.length === 0) {
      return res.status(404).json({ message: "Wallet not found" });
    }

    res.json({ balance: result[0].balance });
  });
});

module.exports = router;
