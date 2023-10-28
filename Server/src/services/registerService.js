const DBConnection = require("../configs/DBConnection");
const nodemailer = require("nodemailer");
const bcrypt = require("bcryptjs");


let temporaryUsers = {};

let createtempUser = (req, res) => {
  return new Promise(async (resolve, reject) => {
    // check email is exist or not
    let isIdExist = await checkExistId(req.body.id);
    if (isIdExist) {
      reject(`ID: "${req.body.id}" already exist.`);
    } else {
      if (!/^\d{1,10}$/.test(req.body.id)) {
        return res
          .status(400)
          .json(
            {errors: ["Inviled id"]}
          );
      }
      if (req.body.userType != 'faculty' && req.body.userType != 'student') {
        return res
          .status(400)
          .json(
            {errors: ["not a user type"]}
          );
      }
      
      const confirmationCode = Math.floor(100000 + Math.random() * 900000);

      let salt = bcrypt.genSaltSync(10);
    
      let password = bcrypt.hashSync(req.body.password, salt);
      //create a new user
      let tempUser = {
        fullname: req.body.fullName,
        id: req.body.id,
        email: req.body.email,
        password: password,
        userType: req.body.userType,
        confirmationCode: confirmationCode,
      };
      console.log(tempUser)

      temporaryUsers[tempUser.id] = tempUser
      await sendConfirmationCode(tempUser.email,tempUser.confirmationCode)
      resolve();
    
    }
  });
};

let checkExistId = (id) => {
  return new Promise((resolve, reject) => {
    try {
      DBConnection.query(
        `SELECT id FROM users WHERE id = ? `,
        [id],
        function (err, rows) {
          if (err) {
            reject(err);
          }
          if (rows && rows.length > 0) {
            resolve(true);
          } else {
            resolve(false);
          }
        }
      );
    } catch (err) {
      reject(err);
    }
  });
};

let InsertUser = (user) => {
  return new Promise(async (resolve, reject) => {
    try {
      // Step 1: Insert common details into users table
      let commonValues = [user.id, user.fullname, user.password, user.email, user.userType];
      let commonSql = `INSERT INTO users (id, name, password, email, type) VALUES (?, ?, ?, ?, ?)`;
      
      DBConnection.query(commonSql, commonValues, function (err, result) {
        if (err) throw err;

        // Step 2: Insert specific details based on user type
        let specificSql = "";
        let specificValues = [user.id];  // assuming the ID remains common for specific attributes
        
        if (user.userType === "student") {
          specificSql = `INSERT INTO student (user_id) VALUES (?)`;
        } else if (user.userType === "faculty") {
          specificSql = `INSERT INTO facultymember (user_id) VALUES (?)`;
        }
        
        if (specificSql !== "") {
          DBConnection.query(specificSql, specificValues, function (err, result) {
            if (err) throw err;
            resolve();
          });
        } else {
          resolve();  // if no specific table insert is needed, resolve immediately
        }
      });
      
    } catch (err) {
      reject(err);
    }
  });
};


let ConfirmUser = async (userId, confirmationCode, res) => {
 
  if (!/^\d{1,10}$/.test(userId)) {
    return res
      .status(400)
      .json(
        {error: "Invalid id"}
      );
  }
  if (!(userId in temporaryUsers)) {
    return res.status(400).json({ errors: ["Invalid user ID."] });
  }
  
  let user = temporaryUsers[userId];

  // Check if the confirmation code matches
  if (user.confirmationCode !== parseInt(confirmationCode)) {
    return res.status(400).json({ errors: ["Invalid code."] });
  } else {
    try {
      await InsertUser(user);
      delete temporaryUsers[userId]; // Remove the user from temporaryUsers
      return res.status(200).json({ success: "User confirmed and inserted successfully." });
    } catch(err) {
      return res.status(500).json({ errors: [err.message] });
    }
  }
}

let sendConfirmationCode = async (email, confirmationCode) => {
  return new Promise((resolve, reject) => {
    try {
      
      let transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
          user: 'attendancesystem6@gmail.com',
          pass: 'tnjwblvconsyhqfk',
        },
      });

      let mailOptions = {
        from: "attendancesystem6@gmail.com",
        to: email,
        subject: "Confirmation Code",
        text: `Your confirmation code is: ${confirmationCode}`,
      };

      transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
          reject("Failed to send email: " + error);
        } else {
          console.log("Email sent: " + info.response);
          resolve(confirmationCode);
        }
      });
    } catch (err) {
      reject(err);
    }
  }).catch((error) => {
    console.log("Error: ", error);
  });
};

module.exports = {
  createtempUser: createtempUser,
  ConfirmUser: ConfirmUser
};
