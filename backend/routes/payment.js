const express = require("express");
const router = express.Router();
const db = require("../db/db");

// SEND MONEY
router.post("/send", (req, res) => {
  const { senderId, receiverPhone, amount } = req.body;

  if (!senderId || !receiverPhone || !amount) {
    return res.status(400).json({ message: "All fields required" });
  }

  // find receiver
  const getReceiver = "SELECT id FROM users WHERE phone = ?";

  db.query(getReceiver, [receiverPhone], (err, receiver) => {
    if (err) {
      console.log(err);
      return res.status(500).json({ message: "DB error" });
    }

    if (receiver.length === 0) {
      return res.status(404).json({ message: "Receiver not found" });
    }

    const receiverId = receiver[0].id;

    // get sender balance
    const getSenderWallet =
      "SELECT balance FROM wallets WHERE user_id = ?";

    db.query(getSenderWallet, [senderId], (err, senderWallet) => {
      if (err) {
        console.log(err);
        return res.status(500).json({ message: "DB error" });
      }

      if (senderWallet.length === 0) {
        return res.status(404).json({ message: "Sender wallet not found" });
      }

      if (senderWallet[0].balance < amount) {
        return res.status(400).json({ message: "Insufficient balance" });
      }

      // deduct sender balance
      const deductBalance =
        "UPDATE wallets SET balance = balance - ? WHERE user_id = ?";

      db.query(deductBalance, [amount, senderId], (err) => {
        if (err) {
          console.log(err);
          return res.status(500).json({ message: "Payment failed" });
        }

        // add receiver balance
        const addBalance =
          "UPDATE wallets SET balance = balance + ? WHERE user_id = ?";

        db.query(addBalance, [amount, receiverId], (err) => {
          if (err) {
            console.log(err);
            return res.status(500).json({ message: "Payment failed" });
          }

          // save transaction
          const saveTransaction =
            "INSERT INTO transactions (sender_id, receiver_id, amount) VALUES (?, ?, ?)";

          db.query(
            saveTransaction,
            [senderId, receiverId, amount],
            (err) => {
              if (err) {
                console.log(err);
                return res.status(500).json({ message: "Transaction failed" });
              }

              res.json({ message: "Payment successful" });
            }
          );
        });
      });
    });
  });
});

// TRANSACTION HISTORY (GPay-style)
router.get("/history/:userId", (req, res) => {
  const userId = req.params.userId;

  const historyQuery = `
    SELECT 
      t.id,
      t.amount,
      t.created_at,
      sender.phone AS sender,
      receiver.phone AS receiver
    FROM transactions t
    JOIN users sender ON t.sender_id = sender.id
    JOIN users receiver ON t.receiver_id = receiver.id
    WHERE t.sender_id = ? OR t.receiver_id = ?
    ORDER BY t.created_at DESC
  `;

  db.query(historyQuery, [userId, userId], (err, result) => {
    if (err) {
      console.log(err);
      return res.status(500).json({ message: "DB error" });
    }

    res.json(result);
  });
});

module.exports = router;
