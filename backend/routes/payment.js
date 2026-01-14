const express = require("express");
const router = express.Router();
const db = require("../db/db");

// send money
router.post("/send", (req, res) => {
  const { senderId, receiverPhone, amount } = req.body;

  if (!senderId || !receiverPhone || !amount) {
    return res.status(400).json({ message: "All fields required" });
  }

  // get receiver
  const getReceiver = "SELECT id FROM users WHERE phone = ?";

  db.query(getReceiver, [receiverPhone], (err, receiver) => {
    if (err) return res.status(500).json({ message: "DB error" });

    if (receiver.length === 0) {
      return res.status(404).json({ message: "Receiver not found" });
    }

    const receiverId = receiver[0].id;

    // check sender balance
    const getSenderWallet =
      "SELECT balance FROM wallets WHERE user_id = ?";

    db.query(getSenderWallet, [senderId], (err, senderWallet) => {
      if (err) return res.status(500).json({ message: "DB error" });

      if (senderWallet[0].balance < amount) {
        return res.status(400).json({ message: "Insufficient balance" });
      }

      // deduct sender balance
      const deduct =
        "UPDATE wallets SET balance = balance - ? WHERE user_id = ?";

      db.query(deduct, [amount, senderId]);

      // add receiver balance
      const add =
        "UPDATE wallets SET balance = balance + ? WHERE user_id = ?";

      db.query(add, [amount, receiverId]);

      // store transaction
      const insertTxn =
        "INSERT INTO transactions (sender_id, receiver_id, amount) VALUES (?, ?, ?)";

      db.query(insertTxn, [senderId, receiverId, amount]);

      res.json({ message: "Payment successful" });
    });
  });
});

module.exports = router;
