const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const connection = require("../../config/connection");
const returnError = require("../../helper/returnError");
const returnSuccess = require("../../helper/returnSuccess");
const sendEmail = require("../../helper/email");
const {
  getVerificationEmailTemplate,
  getSendUserDetailEmailTemplate,
} = require("../../helper/emailTemplate");
const auth = require("../../config/middleware");
const router = express.Router();

router.post("/login", (req, res) => {
  let body = req.body;
  connection.query(
    "SELECT * from users WHERE email = ?;",
    [body.email],
    async (err, user) => {
      if (err) return returnError(res);
      else if (user.length == 0)
        return returnError(res, "Invalid email or password.");
      user = user[0];
      if (!(await bcrypt.compare(body.password, user.password)))
        return returnError(res, "Invalid email or password.");
      delete user.password;
      user.token = jwt.sign({ userId: user.id }, process.env.SECRET_KEY, {
        expiresIn: 999999999999,
      });

      return returnSuccess(res, user);
    }
  );
});

// verify
router.post("/send/verify", (req, res) => {
  const { email, otp } = req.body;
  return sendEmail(res, email, getVerificationEmailTemplate(otp));
});

// send details
router.get("/send/detail", auth, (req, res) => {
  return sendEmail(
    res,
    req.query.email,
    getSendUserDetailEmailTemplate(req.query)
  );
});

// Register User
router.post("/register", (req, res) => {
  let body = req.body;
  connection.query(
    "SELECT * from users WHERE email = ?;",
    [body.email],
    async (err, alreadyExist) => {
      if (err) return returnError(res);
      if (alreadyExist.length)
        return returnError(res, "User with this email already exist.");

      //Register User
      body.password = await bcrypt.hash(body.password, 10);
      connection.query("INSERT INTO users SET ?", body, (error, result) => {
        if (err) return returnError(res);
        delete body.password;

        return returnSuccess(res, body, "Registration successfull.");
      });
    }
  );
});

// Register User
router.post("/add-retailer", auth, (req, res) => {
  let body = req.body;
  connection.query(
    "SELECT * from users WHERE email = ?;",
    [body.email],
    async (err, alreadyExist) => {
      if (err) return returnError(res);
      if (alreadyExist.length)
        return returnError(res, "User with this email already exist.");

      //Register User
      body.password = await bcrypt.hash(body.password, 10);
      connection.query("INSERT INTO users SET ?", body, (error, result) => {
        if (err) return returnError(res);

        return returnSuccess(res, body, "User registered successfully.");
      });
    }
  );
});

router.get("/get-retailers", auth, (req, res) => {
  connection.query(
    "SELECT * FROM users WHERE wholesellerId = ?;",
    [req.userId],
    (err, result) => {
      if (err) return returnError(res, err.message);

      return returnSuccess(res, result);
    }
  );
});

module.exports = router;
