const express = require("express");
const connection = require("../../config/connection");
const returnError = require("../../helper/returnError");
const returnSuccess = require("../../helper/returnSuccess");
const router = express.Router();

router.post("/add-new", (req, res) => {
  let body = req.body;
  const userId = req.userId;
  body.userId = userId;
  connection.query(
    "SELECT * from stocks WHERE id = ? and name = ?;",
    [userId, body.name],
    async (err, alreadyExist) => {
      if (err) return returnError(res);
      if (alreadyExist.length)
        return returnError(res, "Stock with this name already exist.");

      //Register User
      connection.query("INSERT INTO stocks SET ?", body, (error, result) => {
        if (error) return returnError(res);
        return returnSuccess(res, body, "Stock added successfully.");
      });
    }
  );
});

router.post("/update", (req, res) => {
  let body = req.body;
  const userId = req.userId;
  body.userId = userId;
  connection.query(
    "UPDATE stocks SET name = ?, price = ?, quantity = ? WHERE id = ?",
    [body.name, body.price, body.quantity, body.id],
    (error, result) => {
      if (error) return returnError(res);
      return returnSuccess(res, body, "Stock updated successfully.");
    }
  );
});

router.get("/delete/:id", (req, res) => {
  connection.query(
    "DELETE FROM stocks WHERE id = ?;",
    [req.params.id],
    (error, result) => {
      if (error) return returnError(res);
      return returnSuccess(res, {}, "Stock removed successfully.");
    }
  );
});

router.get("/get-stocks/:userId", (req, res) => {
  connection.query(
    "SELECT * FROM stocks WHERE userId = ?;",
    [req.params.userId],
    (err, result) => {
      if (err) return returnError(res, err.message);
      return returnSuccess(res, result);
    }
  );
});

module.exports = router;
