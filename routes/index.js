const express = require("express");
const connection = require("../config/connection");
const auth = require("../config/middleware");
const returnError = require("../helper/returnError");
const returnSuccess = require("../helper/returnSuccess");
const router = express.Router();

/** @V1 Routing */
router.use("/v1/user", require("./v1/users"));
router.use("/v1/stocks", auth, require("./v1/stocks"));
router.use("/v1/orders", auth, require("./v1/orders"));
router.use("/v1/images", auth, require("./v1/images"));

/**
 * @Support
 */
router.get("/create/users", async (req, res) => {
  connection.query("DROP TABLE IF EXISTS users; ", () => {
    connection.query(
      "CREATE TABLE users (id INT AUTO_INCREMENT PRIMARY KEY, name VARCHAR(40), email VARCHAR(50) UNIQUE, buisnessName VARCHAR(80), address VARCHAR(80), password VARCHAR(255), phoneNo VARCHAR(12), wholesellerId INT DEFAULT NULL, time TIMESTAMP DEFAULT CURRENT_TIMESTAMP);",
      (error, result) => {
        if (error) {
          return res.status(400).send({ ok: false, message: error.message });
        }
        return res.send({
          ok: true,
          message: "Users table created successfully.",
        });
      }
    );
  });
});

router.get("/create/stocks", async (req, res) => {
  connection.query("DROP TABLE IF EXISTS stocks; ", () => {
    connection.query(
      "CREATE TABLE stocks (id INT AUTO_INCREMENT PRIMARY KEY, userId INT, name VARCHAR(40), price INT, quantity INT);",
      (error, result) => {
        if (error) {
          return res.status(400).send({ ok: false, message: error.message });
        }
        return res.send({
          ok: true,
          message: "Stocks table created successfully.",
        });
      }
    );
  });
});

router.get("/create/orders", async (req, res) => {
  connection.query("DROP TABLE IF EXISTS orders; ", () => {
    connection.query(
      "CREATE TABLE orders (id INT AUTO_INCREMENT PRIMARY KEY, retailerId INT, wholesellerId INT, stockId INT, quantity INT, status VARCHAR(10), price int, payment VARCHAR(4), time TIMESTAMP DEFAULT CURRENT_TIMESTAMP);",
      (error, result) => {
        if (error) {
          return res.status(400).send({ ok: false, message: error.message });
        }
        connection.query("DROP TABLE IF EXISTS images;", () => {
          connection.query(
            "CREATE TABLE images (id INT AUTO_INCREMENT PRIMARY KEY, stockId INT, userId INT, url TEXT);",
            () => {
              return res.send({
                ok: true,
                message: "Orders table created successfully.",
              });
            }
          );
        });
      }
    );
  });
});

router.get("/list", (req, res) => {
  connection.query("SELECT * FROM users;", (errU, user) => {
    if (errU) return returnError(res, errU.message);
    connection.query("SELECT * FROM stocks;", (errS, stock) => {
      if (errS) return returnError(res, errS.message);
      return returnSuccess(res, { user, stock });
    });
  });
});

module.exports = router;
