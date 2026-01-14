const express = require("express");
const router = express.Router();
const db = require("../db/db");

router.post("/register", (req, res) => {
  const { name, phone, email } = req.body;

  if (!name || !phone) {
    return res.status(400).json({
      message: "Name and phone are required"
    });
  }

  const query =
    "INSERT INTO users (name, phone, email) VALUES (?, ?, ?)";

  db.query(query, [name, phone, email], (err, result) => {
    if (err) {
      console.log(err);
      return res.status(500).json({
        message: "Database error"
      });
    }

    res.json({
      message: "User registered successfully",
      userId: result.insertId
    });
  });
});

module.exports = router;
