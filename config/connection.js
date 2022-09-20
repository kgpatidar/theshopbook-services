const mysql = require("mysql");
const db = {
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  user: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: process.env.DB_NAME,
  connectTimeout: 30000,
};

const connection = mysql.createPool(db);

// connection.connect((err) =>
//   console.log(err ? "Error : " + err : "Database connected.")
// );

module.exports = connection;
