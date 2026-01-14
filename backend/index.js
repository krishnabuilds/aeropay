const express = require("express");
const db = require("./db/db");
const userRoutes = require("./routes/users");

const app = express();
app.use(express.json());

app.use("/api/users", userRoutes);

app.get("/", (req, res) => {
  res.send("AeroPay backend running");
});

app.get("/health", (req, res) => {
  res.json({
    status: "ok",
    app: "AeroPay",
    time: new Date()
  });
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log("Server started on port " + PORT);
});
