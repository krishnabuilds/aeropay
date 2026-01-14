const express = require("express");
const db = require("./db/db");


const app = express();

// allow JSON requests
app.use(express.json());

// home route
app.get("/", (req, res) => {
  res.send("AeroPay backend running");
});

// health check route
app.get("/health", (req, res) => {
  res.json({
    status: "ok",
    app: "AeroPay",
    time: new Date()
  });
});

const PORT = 3000;

app.listen(PORT, () => {
  console.log("Server started on port " + PORT);
});
