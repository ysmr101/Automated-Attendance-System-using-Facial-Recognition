const DBConnection = require("../configs/DBConnection");
const path = require("path");
const fs = require("fs");
const util = require("util");
const queryAsync = util.promisify(DBConnection.query).bind(DBConnection);
const unlinkFile = util.promisify(fs.unlink);
const spawn = require("child_process").spawn;
const lockfile = require("proper-lockfile");

function encodeFace(filePath) {
  return new Promise((resolve, reject) => {
    const process = spawn("python", ["./src/services/encodeFace.py", filePath]);

    process.stdout.on("data", function (data) {
      resolve(JSON.parse(data.toString()));
    });

    process.stderr.on("data", function (data) {
      reject(data.toString());
    });
  });
}

const AddEncoding = function AddEncoding(encoding, id, name, profile_pic=false) {

  if(encoding.length <= 5){
    return
  }
  if (profile_pic) {
    const sqlDeleteAll =
      "DELETE FROM encodings WHERE sid = ?";
    DBConnection.query(sqlDeleteAll, [id], (err, result) => {
      if (err) {
        console.log(err);
        return;
      }

      console.log("All encodings deleted for this profile");
    });
  }
  
  const sqlCheckExist =
    "SELECT COUNT(*) as count FROM encodings WHERE sid = ? AND encoding = ?";
  DBConnection.query(sqlCheckExist, [id, encoding], (err, result) => {
    if (err) {
      console.log(err);
      return;
    }

    if (result[0].count > 0) {
      console.log("Encoding already exists, not inserting");
      return;
    }

    // Count how many encodings exist for this 'sid'
    const sqlCount = "SELECT COUNT(*) as count FROM encodings WHERE sid = ?";
    DBConnection.query(sqlCount, [id], (err, result) => {
      if (err) {
        console.log(err);
        return;
      }

      const count = result[0].count;

      // If 10 or more encodings, delete the oldest one
      if (count >= 10) {
        const sqlDeleteOldest =
          "DELETE FROM encodings WHERE sid = ? ORDER BY id ASC LIMIT 1";
        DBConnection.query(sqlDeleteOldest, [id], (err, result) => {
          if (err) {
            console.log(err);
            return;
          }

          console.log("Oldest encoding deleted");
        });
      }

      // Insert the new encoding
      const sqlInsert =
        "INSERT INTO encodings (encoding, sid, name) VALUES (?, ?, ?)";
      DBConnection.query(sqlInsert, [encoding, id, name], (err, result) => {
        if (err) {
          console.log(err);
          return;
        }

        console.log("New encoding inserted");
      });
    });
  });
};

module.exports = {
  AddEncoding: AddEncoding,

  studentSections: async (req, res) => {
    let query = `SELECT section.* FROM section
                  INNER JOIN enrollment ON section.refCode = enrollment.refCode
                  WHERE enrollment.sid = ?`;

    DBConnection.query(query, [req.id], (err, result) => {
      if (err) {
        console.error(err);
        return res.status(401).send("error");
      }

      return res.status(200).json(result);
    });
  },
  getStudentPicture: async (req, res) => {
    let query = `SELECT facePic FROM student WHERE user_id = ?`;

    DBConnection.query(query, [req.id], (err, result) => {
      if (result.length === 0) {
        return res.status(404).send("User not found");
      }
      const user = result[0];
      if (err) {
        return res.status(400).send("error");
      }

      let fileName = "";
      if (user.facePic === null || user.facePic === "") {
        fileName = "default.jpg";
      } else {
        fileName = user.facePic;
      }

      const imagePath = path.join(__dirname, "..", "/StudentsPic", fileName);
      fs.access(imagePath, fs.constants.F_OK, (err) => {
        if (err) {
          console.log("File does not exist, sending default image.");
          const defaultPath = path.join(
            __dirname,
            "..",
            "/StudentsPic",
            "default.jpg"
          );
          return res.sendFile(defaultPath);
        } else {
          return res.sendFile(imagePath);
        }
      });
    });
  },

  getAttendance: async (req, res) => {
    const refCode = req.query.refCode;
    const id = req.id;
    let currentDate = new Date().toISOString().slice(0, 10);

    const sqlSelect = `SELECT section.sectionNum, section.courseName 
                       FROM enrollment 
                       INNER JOIN section ON enrollment.refCode = section.refCode
                       WHERE enrollment.sid = ? AND enrollment.refCode = ?`;
    DBConnection.query(sqlSelect, [id, refCode], async (err, section) => {
      if (section && section.length > 0) {
        const attendanceSql = `SELECT attendance.* FROM attendance 
                               WHERE sid = ? AND refCode = ? AND date <= ?
                               ORDER BY date ASC;`;
        DBConnection.query(
          attendanceSql,
          [id, refCode, currentDate],
          async (err, attendance) => {
            return res.status(200).json(attendance);
          }
        );
      } else {
        return res.status(400).send("error");
      }
    });
  },
  addPicture: async (req, res) => {
    try {
      const file = req.file;
      if (!file || file == undefined) {
        console.log('undefined')
        return res.status(400).send("Please upload a file");
      }

      let filePath = path.join(file.filename);

      const sqlSelect = `SELECT student.facePic, student.oldFacePic, users.name 
        FROM student  
        INNER JOIN users ON student.user_id = users.id
        WHERE user_id = ?`;

      const [result] = await queryAsync(sqlSelect, [req.id]);

      let currentFilePath = null;
      let oldFilePath = null;

      if (result && result.facePic) {
        currentFilePath = result.facePic;
        oldFilePath = result.oldFacePic;
      }
      let encoding = []
      try{
        encoding = await encodeFace(filePath);
      }catch(err){
        console.log(err)
        await unlinkFile("src/StudentsPic/" + filePath);
        return res.status(400).send("error");
      }
      
      let faceEncodingString = JSON.stringify(encoding);
      if (encoding.length == 0 || encoding.length != 128) {
        await unlinkFile("src/StudentsPic/" + filePath);
        return res.status(400).send("no face detected");
      } else {
        AddEncoding(faceEncodingString, req.id, result.name, true);

        const sqlUpdate =
          "UPDATE student SET facePic = ?, oldFacePic = ? WHERE user_id = ?";

        await queryAsync(sqlUpdate, [filePath, currentFilePath, req.id]);

        if (
          oldFilePath &&
          oldFilePath !== filePath &&
          oldFilePath !== currentFilePath
        ) {
          await unlinkFile("src/StudentsPic/" + oldFilePath);
        }

        return res.status(200).send("Success");
      }
    } catch (error) {
      
      console.error(error);
      return res.status(500).send("Internal Server Error");
    }
  },
};
