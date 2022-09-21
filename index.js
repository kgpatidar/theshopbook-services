require("dotenv").config();
const express = require("express");
const cors = require("cors");

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Welcome route
app.get("/", (req, res) => {
  res.json({ message: "Welcome to TheShopbook." });
});

// Main routes
app.use("/", require("./routes/index"));

app.listen(process.env.PORT || 5000, () => {
  console.log(`Server started.`);
});
