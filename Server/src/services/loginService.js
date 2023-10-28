const DBConnection = require("../configs/DBConnection");
const bcrypt = require("bcryptjs");


let findUserById = (id) => {
  
  return new Promise((resolve, reject) => {
    try {
      DBConnection.query(
        `SELECT  * FROM users WHERE id = ?`,
        [id],
        function (err, rows) {
          if (err) {
            reject(err);
          }
          let user = rows[0];
          resolve(user);
        }
      );
    } catch (err) {
      reject(err);
    }
  });
};

let findRefreshToken = (refreshToken) => {
  return new Promise(async (resolve, reject) => {
    try {
      DBConnection.query(
        `SELECT * FROM users WHERE refreshToken = ? `,
        [refreshToken],
        function (err, rows) {
          if (err) {
            reject(err);
          }
          
          let user = rows[0];
          resolve(user);
        }
      );
    } catch (err) {
      reject(err);
    }
  });
};

let findDeviceRefreshToken = (refreshToken) => {
  return new Promise(async (resolve, reject) => {
    try {
      DBConnection.query(
        `SELECT * FROM classroomdevice WHERE refreshToken = ? `,
        [refreshToken],
        function (err, rows) {
          if (err) {
            reject(err);
          }
          
          let user = rows[0];
          resolve(user);
        }
      );
    } catch (err) {
      reject(err);
    }
  });
};



let updateRefreshToken = (id, refreshToken) => {
  return new Promise((resolve, reject) => {
    try {
      DBConnection.query(
        `UPDATE users SET refreshToken = ? WHERE id = ?`,
        [refreshToken, id],
        function (err, rows) {
          
          if (err) {
            
            reject(err);  // If there's an error, reject the Promise
          } else {
            
            resolve('updated');  // If there's no error, resolve the Promise
          }
        }
      );
    } catch (err) {
      reject(err);  // If there's an error in the try block, reject the Promise
    }
  });
};


let findDeviceById = (id) => {
  return new Promise(async (resolve, reject) => {
   
    try {
      DBConnection.query(
        `SELECT * FROM classroomdevice WHERE id = ?`,
        id,
        function (err, rows) {
          if (err) {
            reject(err);
          }
          let Device = rows[0];
          resolve(Device);
        }
      );
    } catch (err) {
      reject(err);
    }
  });
};

let updateDeviceRefreshToken = (id, refreshToken) => {
  return new Promise((resolve, reject) => {
    try {
      DBConnection.query(
        `UPDATE classroomdevice SET refreshToken = ? WHERE id = ?`,
        [refreshToken, id],
        function (err, rows) {
          
          if (err) {
            
            reject(err);  // If there's an error, reject the Promise
          } else {
            
            resolve('updated');  // If there's no error, resolve the Promise
          }
        }
      );
    } catch (err) {
      reject(err);  // If there's an error in the try block, reject the Promise
    }
  });
};

let comparePassword = (password, userObject) => {
  
  return new Promise(async (resolve, reject) => {
    try {
      
      await bcrypt.compare(password, userObject.password).then((isMatch) => {
        if (isMatch) {
          
          resolve(true);
        } else {
          
          resolve(false);
        }
      });
    } catch (e) {
      console.log(e);
      reject(e);
    }
  });
};
module.exports = {
  findUserById: findUserById,
  comparePassword: comparePassword,
  findDeviceById: findDeviceById,
  updateRefreshToken: updateRefreshToken,
  findRefreshToken: findRefreshToken,
  findDeviceRefreshToken: findDeviceRefreshToken,
  updateDeviceRefreshToken: updateDeviceRefreshToken
};
