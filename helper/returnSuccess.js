const returnSuccess = (res, result, msg = "success") => {
  return res.status(200).send({ ok: true, msg, data: result });
};
module.exports = returnSuccess;
