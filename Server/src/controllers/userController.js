const loginService = require("../services/loginService");
const DBConnection = require("../configs/DBConnection");
const bcrypt = require("bcryptjs");

module.exports = {
  changePassword: async (req, res) => {
    const { CurrentPwd, pwd } = req.body;

    let query = `SELECT password FROM users WHERE users.id = ?`;

    DBConnection.query(query, [req.id], async (err, result) => {
      if (result.length === 0) {
        return res.status(404).send({error:"User not found"});
      }
      const user = result[0];
      if (err) {
        console.error(err);
        return;
      }
      
      const match = await loginService.comparePassword(CurrentPwd, user);
      if (match) {
        
        const UpdateQuery = `UPDATE users SET password = ? WHERE id = ?`;

        let salt = bcrypt.genSaltSync(10);
        const password = bcrypt.hashSync(pwd, salt);

        DBConnection.query(UpdateQuery, [password,req.id], (err, result) => {
          if (result.length === 0) {
            return res.status(404).send({error:"User not found"});
          }
          const user = result[0];
          if (err) {
            console.error(err);
            return;
          }
          return res.status(201).send("Password Changed");
        });
      } else {
        return res.status(401).json({error:"Incorrect password"});
      }
    });
  },

  getUserData: async (req, res) => {
    let query = `SELECT id , name, email FROM users WHERE users.id = ?`;

    DBConnection.query(query, [req.id], (err, result) => {
      if (result.length === 0) {
        return res.status(404).send("User not found");
      }
      const user = result[0];
      if (err) {
        console.error(err);
        return;
      }
      return res.status(200).json(user);
    });
  },

  EditData: async (req, res, next) => {
    const newName = req.body.name;
    const id = req.id;
    const sqlUpdate = "UPDATE users SET name = ? WHERE id = ?";
    try {
      DBConnection.query(sqlUpdate, [newName, id], async (err, result) => {
        if (err) throw err;

        return res.status(201).json("Updated");
      });
    } catch (err) {
      return res.status(401);
    }
  },
};
