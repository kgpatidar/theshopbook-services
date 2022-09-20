const connection = require("../config/connection");
const webpush = require("web-push");

const publicVapidKey = process.env.PUBLIC_VAPID_KEY;
const privateVapidKey = process.env.PRIVATE_VAPID_KEY;

webpush.setVapidDetails(
  "mailto:test@test.com",
  publicVapidKey,
  privateVapidKey
);

const sendNotificationToAllSubscribe = async (userId, data = {}) => {
  connection.query(
    `SELECT * FROM notification WHERE userId = ${userId};`,
    (err, result) => {
      if (err) return false;
      result.forEach((ep) => {
        console.log(JSON.parse(ep.endpoint));
        sendNotification(JSON.parse(ep.endpoint), data);
      });
    }
  );
};

const sendNotification = (sendTo, data = {}) => {
  const { title = "TheShopBook", body = "Oh! You are busy?" } = data;
  const payload = JSON.stringify({ title, body });
  webpush.sendNotification(sendTo, payload).catch((err) => console.error(err));
};

module.exports = { sendNotificationToAllSubscribe, sendNotification };
