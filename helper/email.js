var nodemailer = require("nodemailer");
const returnError = require("./returnError");
const returnSuccess = require("./returnSuccess");

const senderEmail = process.env.EMAIL;
const senderAuth = process.env.PASSWORD;

async function sendEmail(res, email, html) {
  var transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 465,
    secure: true,
    auth: {
      user: senderEmail,
      pass: senderAuth,
    },
  });

  var mailOptions = {
    from: senderEmail,
    to: email,
    subject: "TheShopbook Verification.",
    html: html,
  };

  transporter.sendMail(mailOptions, function (error, info) {
    if (error) {
      return res.status(403).send({
        ok: false,
        msg: error.message,
        data: { senderEmail, senderAuth },
      });
    } else {
      return returnSuccess(res, "Please check your mail.");
    }
  });
}

module.exports = sendEmail;
