const loginService = require("../services/loginService");
const DBConnection = require("../configs/DBConnection");
const nodemailer = require("nodemailer");
const bcrypt = require("bcryptjs");

let tempCode = {};
let sendCodeToUser = async (email, confirmationCode) => {
  return new Promise((resolve, reject) => {
    try {
      let transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
          user: "attendancesystem6@gmail.com",
          pass: "tnjwblvconsyhqfk",
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
          reject([false, error]);
        } else {
          console.log("Email sent: " + info.response);
          resolve([true, "success"]);
        }
      });
    } catch (err) {
      reject([false, err]);
    }
  }).catch((error) => {
    console.log("Error: ", error[1]);
  });
};

let changeUserPassword = async (userId) => {
  const newPassword = generateStrongPassword(8);
  let salt = bcrypt.genSaltSync(10);
  const password = bcrypt.hashSync(newPassword, salt);

  try {
    let sqlUpdate = "UPDATE users SET password = ? WHERE id = ?";
    DBConnection.query(sqlUpdate, [password, userId], async (err, result) => {
      if (err) throw err;
    });
  } catch (Err) {
    console.error(Err);
  }

  return newPassword;
};

let sendPassword = async (email, password) => {
  return new Promise((resolve, reject) => {
    try {
      let transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
          user: "attendancesystem6@gmail.com",
          pass: "tnjwblvconsyhqfk",
        },
      });

      let mailOptions = {
        from: "attendancesystem6@gmail.com",
        to: email,
        subject: "password",
        text: `You can use this password to login: ${password}`,
      };

      transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
          reject([false, error]);
        } else {
          console.log("Email sent: " + info.response);
          resolve([true, "success"]);
        }
      });
    } catch (err) {
      reject([false, err]);
    }
  }).catch((error) => {
    console.log("Error: ", error[1]);
  });
};

let generateStrongPassword = (length = 8) => {
  // Define the characters from which the password will be generated
  const upperCaseChars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  const lowerCaseChars = "abcdefghijklmnopqrstuvwxyz";
  const numberChars = "0123456789";
  const specialChars = "!@#$";

  // Combine all possible characters
  const allChars = upperCaseChars + lowerCaseChars + numberChars + specialChars;

  // Ensure that the generated password includes at least one character from each category
  const mandatoryChars = [
    upperCaseChars[Math.floor(Math.random() * upperCaseChars.length)],
    lowerCaseChars[Math.floor(Math.random() * lowerCaseChars.length)],
    numberChars[Math.floor(Math.random() * numberChars.length)],
    specialChars[Math.floor(Math.random() * specialChars.length)],
  ];

  // Generate the remaining random characters for the password
  let remainingChars = [];
  for (let i = 0; i < length - mandatoryChars.length; i++) {
    remainingChars.push(allChars[Math.floor(Math.random() * allChars.length)]);
  }

  // Combine the mandatory and remaining characters
  const passwordArray = [...mandatoryChars, ...remainingChars];

  // Shuffle the array to ensure randomness
  const shuffledArray = passwordArray.sort(() => 0.5 - Math.random());

  // Convert the array into a string and return it
  return shuffledArray.join("");
};

let ConfirmUserCode = async (userId, confirmationCode, res) => {

  if (!/^\d{1,10}$/.test(userId)) {
    return res
      .status(400)
      .json(
        "Invalid id"
      );
  }
  if (!(userId in tempCode)) {
    return res.status(400).json({ errors: ["Invalid user ID."] });
  }

  let user = tempCode[userId];

  // Check if the confirmation code matches
  if (parseInt(user.confirmationCode) !== parseInt(confirmationCode)) {
    return res.status(400).json({ errors: ["Invalid code."] });
  } else {
    try {
      const userPassword = await changeUserPassword(userId);
      const passSent = await sendPassword(user.email, userPassword);
      if (passSent[0]) {
        delete tempCode[userId];
        return res.status(200).json({ success: "password sent to your email" });
      } else {
        delete tempCode[userId];
        return res.status(401).json({ error: `someting went wrong` });
      }
    } catch (err) {
      return res.status(500).json({ errors: `someting went wrong` });
    }
  }
};

module.exports = {
  sendCode: async (req, res) => {
    try {
      const { id } = req.body;
      if (!/^\d{1,10}$/.test(id)) {
        return res
          .status(401)
          .json(
            {error: "Invalid id"}
          );
      }
      if (!id) return res.status(400).json({ message: "id is required." });
      const user = await loginService.findUserById(id);
      if (!user)
        return res
          .status(401)
          .json({ error: `This user id "${id}" doesn't exist` }); //Unauthorized

      const confirmationCode = Math.floor(100000 + Math.random() * 900000);

      if (user.email === null || user.email === "")
        return res.status(401).json({ error: `user dose not have an email` }); //Unauthorized

      tempCode[id] = { confirmationCode: confirmationCode, email: user.email };
      const sent = await sendCodeToUser(user.email, confirmationCode);
      if (sent[0]) {
        const userEmail = user.email;
        return res.status(200).json(userEmail);
      } else {
        return res.status(401).json({ error: `someting went wrong` });
      }
    } catch (err) {
      return res.status(401).json({ error: `someting went wrong` });
    }
  },

  confirmUser: async (req, res) => {
    if (
      !req.body.userId ||
      req.body.userId === "" ||
      req.body.codes == undefined ||
      req.body.codes.length != 6
    ) {
      return res.status(400).json({ errors: ["Invalid entry"] });
    }
    let confirmationCode =
      req.body.codes[0] +
      req.body.codes[1] +
      req.body.codes[2] +
      req.body.codes[3] +
      req.body.codes[4] +
      req.body.codes[5];
    console.log(confirmationCode);
    ConfirmUserCode(req.body.userId, confirmationCode, res);
  },
};
