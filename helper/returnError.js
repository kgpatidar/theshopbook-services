const returnError = (res, msg = "Something went wrong.", status = 400) => {
  return res.status(status).send({ ok: false, msg });
};
module.exports = returnError;
