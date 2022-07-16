const express = require("express");
const connection = require("../../config/connection");
const returnError = require("../../helper/returnError");
const returnSuccess = require("../../helper/returnSuccess");
const router = express.Router();

const IMAGE_REMOVE_TYPE = {
  ALL: "ALL",
  SINGLE: "SINGLE",
};

router.post("/add-image", (req, res) => {
  let body = req.body;

  let newBody = {};
  newBody.stockId = body.stockId;
  newBody.userId = req.userId;
  newBody.url =
    "https://cdn.utterlyprintable.com/products/wedding-invite-card-deco-cream-portrait-a5-flat-1-cream-medium.jpg";
  connection.query(
    "INSERT INTO images SET ?;",
    [newBody],
    async (err, result) => {
      if (err) return returnError(res);
      return returnSuccess(res, newBody, "Image uploaded successfully.");
    }
  );
});

router.get("/get-images", (req, res) => {
  connection.query(
    "SELECT * FROM images WHERE userId = ?;",
    [req.userId],
    (err, result) => {
      if (err) return returnError(res);
      return returnSuccess(res, result);
    }
  );
});

router.post("/remove-image", (req, res) => {
  let body = req.body;
  const type = body.type;
  const id = body.id;

  if (type === IMAGE_REMOVE_TYPE.ALL) {
    connection.query(
      "DELETE FROM images WHERE userId = ?;",
      [id],
      (err, result) => {
        if (err) returnError(res);
        return returnSuccess(res, {}, "Images removed successfully.");
      }
    );
  } else if (type === IMAGE_REMOVE_TYPE.SINGLE) {
    connection.query(
      "DELETE FROM images WHERE id = ?;",
      [id],
      (err, result) => {
        if (err) returnError(res);
        return returnSuccess(res, {}, "Image removed successfully.");
      }
    );
  }
});

module.exports = router;
