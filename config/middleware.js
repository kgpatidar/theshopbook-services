const jwt = require("jsonwebtoken");
const returnError = require("../helper/returnError");
const SECRET_KEY = process.env.SECRET_KEY;
const auth = (req, res, next) => {
  if (req && req.headers && req.headers.token) {
    jwt.verify(req.headers["token"], SECRET_KEY, function (err, decodedToken) {
      if (err) {
        return returnError(res, "Invalid User", 403);
      } else {
        req.userId = decodedToken.userId;
        req.sessionToken = decodedToken.sessionToken;
        next();
      }
    });
  } else {
    return returnError(res, "Invalid User", 403);
  }
};

module.exports = auth;
