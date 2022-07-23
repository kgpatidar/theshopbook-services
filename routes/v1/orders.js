const express = require("express");
const connection = require("../../config/connection");
const returnError = require("../../helper/returnError");
const returnSuccess = require("../../helper/returnSuccess");
const router = express.Router();

const orderStatus = {
  ALL: "ALL",
  PENDING: "PENDING",
  APPROVED: "APPROVED",
  CANCELED: "CANCELED",
  PRGORESS: "PROGRESS",
  DELIVERED: "DELIVERED",
  COMPLETED: "COMPLETED",
};

const orderPayment = {
  DUE: "DUE",
  PAID: "PAID",
  LATER: "LATE",
};

router.post("/place-new", (req, res) => {
  let body = req.body;
  const retailerId = req.userId;
  body.retailerId = retailerId;
  body.status = orderStatus.PENDING;
  body.payment = orderPayment.DUE;
  connection.query(
    "SELECT * FROM stocks where id = ?;",
    [body.stockId],
    (error, result) => {
      if (error) return returnError(res);
      if (result.length === 0) {
        return returnError(res, "Failed. Stock not found!", 404);
      }
      let stockBody = result[0];
      if (stockBody.quantity < body.quantity) {
        return returnError(
          res,
          `Failed. Only ${result[0].quantity} stocks available of this piece.`
        );
      }
      body.price = stockBody.price;
      connection.query("INSERT INTO orders SET ?", body, (error, result) => {
        if (error) return returnError(res);
        // * Send Notification to wholeseller.
        connection.end();
        return returnSuccess(res, body, "Order requested to wholeseller.");
      });
    }
  );
});

router.get("/get-orders/:wholesellerId/:status", (req, res) => {
  const status = req.params.status.toUpperCase();
  const wholesellerId = req.params.wholesellerId;
  if (status === orderStatus.ALL) {
    connection.query(
      "SELECT * FROM orders WHERE wholesellerId = ? ORDER BY time DESC;",
      [wholesellerId],
      (error, result) => {
        if (error) return returnError(res);
        connection.end();
        return returnSuccess(res, result);
      }
    );
  } else {
    connection.query(
      "SELECT * FROM orders WHERE wholesellerId = ? AND status = ? ORDER BY time DESC;",
      [wholesellerId, status],
      (error, result) => {
        if (error) return returnError(res);
        connection.end();
        return returnSuccess(res, result);
      }
    );
  }
});

router.post("/confirm-order", (req, res) => {
  let body = req.body;
  connection.query(
    "SELECT * FROM orders WHERE id = ?;",
    [body.orderId],
    (checkError, checkResult) => {
      if (checkError) return returnError(res);

      if (checkResult.length === 0) {
        return returnError(res, "Order not found!", 404);
      }

      if (body.status !== orderStatus.APPROVED) {
        return returnError(res, "Something went wrong!", 404);
      }

      let orderBody = checkResult[0];
      if (orderBody.status !== orderStatus.PENDING) {
        return returnError(res, "Already action taken on this order.");
      }

      connection.query(
        "SELECT * FROM stocks WHERE id = ? AND userId = ?;",
        [checkResult[0].stockId, req.userId],
        (error, result) => {
          if (error) return returnError(res);
          if (result.length === 0) {
            return returnError(res, "Failed. Stock not found!", 404);
          }
          let stockBody = result[0];
          if (stockBody.quantity < orderBody.quantity) {
            return returnError(
              res,
              `Failed. Only ${result[0].quantity} stocks available of this piece.`
            );
          }

          let newQty = stockBody.quantity - orderBody.quantity;
          connection.query(
            "UPDATE stocks SET quantity = ? WHERE id = ? AND userId = ?;",
            [newQty, checkResult[0].stockId, req.userId],
            (updateError, updateResult) => {
              if (updateError) {
                return returnError(res, "Failed! Please try after sometime.");
              }
              connection.query(
                "UPDATE orders SET status = ? WHERE id = ?",
                [body.status, body.orderId],
                (updateError, updateResult) => {
                  if (updateError) return returnError(res);
                  // * Send Notification to reseller.
                  return returnSuccess(
                    res,
                    body,
                    `Order ${body.status.toLowerCase()} successfully.`
                  );
                }
              );
            }
          );
        }
      );
    }
  );
});

router.get("/cancel-order/:orderId", (req, res) => {
  connection.query(
    "SELECT * FROM orders WHERE id = ?;",
    [req.params.orderId],
    (checkError, checkResult) => {
      if (checkError) return returnError(res);

      if (checkResult.length === 0) {
        return returnError(res, "Order not found!", 404);
      }

      if (checkResult[0].status === orderStatus.CANCELED) {
        return returnError(res, "Order already canceled.");
      }

      connection.query(
        "UPDATE orders SET status = ? WHERE id = ?",
        [orderStatus.CANCELED, req.params.orderId],
        (updateError, updateResult) => {
          if (updateError) return returnError(res);
          // * Send Notification to reseller.
          return returnSuccess(
            res,
            { status: orderStatus.CANCELED, orderId: req.params.orderId },
            `Order status updated to '${orderStatus.CANCELED.toLowerCase()}' successfully.`
          );
        }
      );
    }
  );
});

router.post("/update-order-status", (req, res) => {
  let body = req.body;
  connection.query(
    "SELECT * FROM orders WHERE id = ?;",
    [body.orderId],
    (checkError, checkResult) => {
      if (checkError) return returnError(res);

      if (checkResult.length === 0) {
        return returnError(res, "Order not found!", 404);
      }

      if (checkResult[0].status === orderStatus.CANCELED) {
        return returnError(res, "Order already canceled.");
      }

      connection.query(
        "SELECT * FROM stocks WHERE id = ? AND userId = ?;",
        [checkResult[0].stockId, req.userId],
        (error, result) => {
          if (error) return returnError(res);
          if (result.length === 0) {
            return returnError(res, "Failed. Stock not found!", 404);
          }

          connection.query(
            "UPDATE orders SET status = ? WHERE id = ?;",
            [body.status, body.orderId],
            (updateError, updateResult) => {
              if (updateError) return returnError(res);
              // * Send Notification to reseller.
              return returnSuccess(
                res,
                body,
                `Order status updated to '${body.status.toLowerCase()}' successfully.`
              );
            }
          );
        }
      );
    }
  );
});

router.post("/update-payment-status", (req, res) => {
  let body = req.body;
  connection.query(
    "SELECT * FROM orders WHERE id = ?;",
    [body.orderId],
    (checkError, checkResult) => {
      if (checkError) return returnError(res);

      if (checkResult.length === 0) {
        return returnError(res, "Order not found!", 404);
      }

      let orderResult = checkResult[0];
      if (
        orderResult.status === orderStatus.PENDING ||
        orderResult.status === orderStatus.CANCELED
      ) {
        return returnError(
          res,
          `Failed!. Order is ${orderResult.status.toLowerCase()}. Can not update.`
        );
      }

      connection.query(
        "UPDATE orders SET payment = ? WHERE id = ?;",
        [body.payment, body.orderId],
        (updateError, updateResult) => {
          if (updateError) return returnError(res);
          // * Send Notification to reseller.
          return returnSuccess(
            res,
            body,
            `Order payment status updated to '${body.payment.toLowerCase()}' successfully.`
          );
        }
      );
    }
  );
});

module.exports = router;
