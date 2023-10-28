const DBConnection = require("../configs/DBConnection");
require("dotenv").config();
const studentController = require("./studentController");

const formatDate = (dateString) => {
  const date = new Date(dateString);

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  const formattedDate = `${year}-${month}-${day}`;

  return formattedDate;
};

module.exports = {
  getCurrentClass: async (req, res) => {
    const { currentTime, currentDate } = req.body;
  
    try {
      DBConnection.execute(
        "SELECT * FROM lecture WHERE startTime <= ? AND endTime >= ? AND ClassNumber = ? AND date = ?",
        [currentTime, currentTime, req.id, currentDate],
        function (err, result) {
          if (err) {
            console.log(err);
            return res.status(500).json({
              message: "An error occurred",
              error: err.message,
            });
          }
  
          // Check if any lecture is happening right now
          if (result.length > 0) {
            DBConnection.execute(
              "SELECT facultymember.late , facultymember.absent FROM facultymember INNER JOIN teach ON teach.eid = facultymember.user_id WHERE refCode = ?",
              [result[0].refCode],
              function (err, times) {
                if (err) {
                  console.log(err);
                  return res.status(500).json({
                    message: "An error occurred",
                    error: err.message,
                  });
                }
  
                // Default values
                let late = 45;
                let absent = 45;
  
                // If a teacher is assigned
                if (times.length > 0 && times[0].late !== null && times[0].absent !== null) {
                  late = times[0].late;
                  absent = times[0].absent;
                }
  
                const lectureWithTimes = {
                  ...result[0],
                  late,
                  absent
                };
  
                return res.status(200).json({
                  currentClass: true,
                  lecture: lectureWithTimes
                });
              }
            );
          } else {
            // No lecture is happening now
            return res.status(200).json({
              currentClass: false,
            });
          }
        }
      );
    } catch (err) {
      console.log(err);
      // Close the connection in case of an error
      DBConnection.end();
  
      // Send an error response
      return res.status(500).json({
        message: "An error occurred",
        error: err.message,
      });
    }
  },  
  getStudentEncodings: async (req, res) => {
    const refCode = req.body.refCode;
    try {
      const sql = `
        SELECT e.sid, e.name, e.encoding 
        FROM encodings AS e
        INNER JOIN enrollment AS en ON e.sid = en.sid
        WHERE en.refCode = ?
      `;

      DBConnection.query(sql, [refCode], (err, results) => {
        if (err) {
          console.error("Error fetching data:", err);
          return res.status(500).send("Internal server error");
        }

        const known_face_encodings = [];
        const known_face_names = [];
        const known_face_SID = [];

        results.forEach((row) => {
          known_face_encodings.push(JSON.parse(row.encoding));
          known_face_names.push(row.name);
          known_face_SID.push(row.sid);
        });

        const output = {
          known_face_encodings,
          known_face_names,
          known_face_SID,
        };

        //console.log(JSON.stringify(output, null, 2));
        res.status(200).send(output); // Sending response back to client
      });
    } catch (err) {
      console.error(err);
      res.status(500).send("Internal server error");
    }
  },
  saveStudentEncodings: async (req, res) => {
    const { known_face_encodings, known_face_names, known_face_SID } = req.body;

    try {
      for (let i = 0; i < known_face_SID.length; i++) {
        const sid = known_face_SID[i];
        const encoding = known_face_encodings[i];
        const name = known_face_names[i];

        // Call the AddEncoding function to handle insertion/update
        studentController.AddEncoding(JSON.stringify(encoding), sid, name);
      }

      res.status(200).send("Successfully saved encodings to database");
    } catch (err) {
      console.error(err);
      res.status(500).send("Internal server error");
    }
  },
  UpdateAttendance: async (req, res) => {
    const date = formatDate(req.body.date);
    try {
      DBConnection.query(
        "UPDATE attendance SET status = ?, time = ? WHERE sid = ? AND date = ? AND refCode = ? AND startTime = ?",
        [
          req.body.status,
          req.body.time,
          req.body.sid,
          date,
          req.body.refCode,
          req.body.startTime,
        ],
        (err, result) => {
          if (err) {
            throw err;
          } else {
            return res.status(200).json("Updated");
          }
        }
      );
    } catch (err) {
      console.error("Error adding attendance:");
      return res.status(500).json("Server error");
    }
  },
};

