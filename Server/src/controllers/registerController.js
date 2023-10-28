const registerService = require("../services/registerService");


let getPageRegister = (req, res) => {
  return res.render("register.ejs", {
    errors: req.flash("errors"),
  });
};
let confirmationCodePage = (req, res) => {
  return res.render("ConfirmationCode.ejs", {
    errors: req.flash("errors"),
    userId: userId,
  });
};

let createNewUser = async (req, res) => {
  
console.log('ggg')
  try {
    await registerService.createtempUser(req, res);
    return res.status(200).json({ success : 'Confirm code'});
  } catch (err) {
      console.log(err);
      return res.status(500).json({ errors: [err.message || err] });
    
  }
};

let ConfirmUser = async (req, res) => {
  if (
    !req.body.userId ||
    req.body.userId === "" ||
    req.body.codes == undefined ||
    req.body.codes.length != 6
  ) {
    return res.status(400).json({ errors: ["Invalid entry"] });
  }
  let confirmationCode =req.body.codes[0] +req.body.codes[1] +req.body.codes[2] +req.body.codes[3] +req.body.codes[4]+req.body.codes[5];

 console.log(confirmationCode)
  try {
    return await registerService.ConfirmUser(req.body.userId, confirmationCode, res);
   
  } catch (err) {
    return res.status(500).json({ errors: [err.message] });
  }
};
module.exports = {
  getPageRegister: getPageRegister,
  createNewUser: createNewUser,
  ConfirmUser: ConfirmUser,
  confirmationCodePage: confirmationCodePage
};
