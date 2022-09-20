const express = require("express");
const connection = require("../../config/connection");
const router = express.Router();
const returnSuccess = require("../../helper/returnSuccess");
const returnError = require("../../helper/returnError");
const { sendNotification } = require("../../helper/notification");

const getUserEndpoints = async (userId) => {
  return new Promise((resolve, reject) => {
    connection.query(
      `SELECT * FROM notification WHERE userId = ${userId};`,
      (err, result) => {
        if (err) return reject("Something went wrong.");
        return resolve(result);
      }
    );
  });
};

router.post("/subscribe", async (req, res) => {
  const userId = req.userId;
  const endpoint = JSON.stringify(req.body);

  connection.query(
    "SELECT * FROM notification WHERE userId = ? AND endpoint = ?;",
    [userId, endpoint],
    (err, endpointResults) => {
      if (err) return returnError(res);
      if (endpointResults && endpointResults.length > 0) {
        return returnSuccess(res, "Already subscribed");
      }
      connection.query(
        "INSERT INTO notification SET ?;",
        { userId, endpoint },
        (error, result) => {
          if (error) return returnError(res, "Something went wrong!");
          return returnSuccess(
            res,
            "Successfully subscribed for notification."
          );
        }
      );
    }
  );
});

const unsubscriptEndpoint = (userId, endpoint) => {
  return new Promise((resolve, reject) => {
    connection.query(
      "DELETE FROM notification WHERE userId = ? AND endpoint = ?",
      [userId, JSON.stringify(endpoint)],
      (error, result) => {
        if (error) return reject(error);
        return resolve(result);
      }
    );
  });
};

router.post("/unsubscribe", async (req, res) => {
  const userId = req.userId;
  const endpoint = req.body;
  unsubscriptEndpoint(userId, endpoint)
    .then(() => {
      return returnSuccess(res, "Unsubscribed successfully!");
    })
    .catch(() => {
      return returnError(res, "Failed to unsubscribe!");
    });
});

router.post("/test", (req, res) => {
  const moz = req.body;
  sendNotification(moz);
  return returnSuccess(res);
});

router.get("/get-endpoints", (req, res) => {
  connection.query("SELECT * FROM notification;", (error, result) => {
    if (error) return returnError(res, "Something went wrong!");
    return returnSuccess(res, "Endpoints", result);
  });
});

module.exports = router;
