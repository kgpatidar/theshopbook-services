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
  const sessionToken = req.sessionToken;
  const endpoint = JSON.stringify(req.body);

  if (!endpoint || endpoint.length === 0 || endpoint === "{}")
    return returnError(res, "Endpoint not found!");

  connection.query(
    "SELECT * FROM notification WHERE userId = ? AND sessionToken = ?;",
    [userId, sessionToken],
    (err, endpointResults) => {
      if (err) return returnError(res);
      if (endpointResults && endpointResults.length > 0) {
        return returnSuccess(res, "Already subscribed");
      }
      connection.query(
        "INSERT INTO notification SET ?;",
        { userId, sessionToken, endpoint },
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

const unsubscriptEndpoint = (sessionToken) => {
  return new Promise((resolve, reject) => {
    connection.query(
      "DELETE FROM notification WHERE sessionToken = ?",
      [sessionToken],
      (error, result) => {
        if (error) return reject(error);
        return resolve(result);
      }
    );
  });
};

router.get("/unsubscribe", async (req, res) => {
  const sessionToken = req.sessionToken;
  unsubscriptEndpoint(sessionToken)
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
