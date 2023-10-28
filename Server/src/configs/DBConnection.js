require('dotenv').config();
const mysql = require("mysql2");

const connection = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '1111',
    database: 'attendancedb'
  });

connection.connect(function(err) {
    if (err) throw err;
    console.log("Database connected!");
});

module.exports = connection;
