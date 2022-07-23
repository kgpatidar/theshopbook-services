const express = require("express");
const connection = require("../../config/connection");
const returnError = require("../../helper/returnError");
const returnSuccess = require("../../helper/returnSuccess");
const router = express.Router();

router.post("/generate", (req, res) => {
  const body = req.body;
  const wholesalerId = req.userId;
  connection.query(
    "SELECT * FROM orders WHERE wholesellerId = ? AND time >= ? AND time <= ?;",
    [wholesalerId, body.startDate, body.endDate],
    async (err, result) => {
      if (err) return returnError(res);
      return returnSuccess(res, result);
    }
  );
});

module.exports = router;
