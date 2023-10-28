const DBConnection = require("../configs/DBConnection");
const studentController = require("./studentController");
const fs = require("fs");
const path = require("path");
const bcrypt = require("bcryptjs");

function getDateFromWeekNumber(weekString) {
  let [year, week] = weekString.split("-W");
  let date = new Date(year);

  date.setMonth(0, 1);

  let daysToAdd = (Number(week) - 1) * 7;
  date.setDate(date.getDate() + daysToAdd);

  return date;
}
//--------
function students(refCode) {
  return new Promise((resolve, reject) => {
    try {
      const query = `SELECT users.*
        FROM users INNER JOIN enrollment ON users.id = enrollment.sid
        WHERE users.id = enrollment.sid AND enrollment.refCode = ?`;
      DBConnection.query(query, [refCode], function (err, rows) {
        if (err) {
          reject(err);
        }
        if (rows && rows.length > 0) {
          resolve(rows);
        } else {
          resolve([]);
        }
      });
    } catch (err) {
      reject(err);
    }
  });
}

//--------

const createRecordsForNewStudents = async (refCode, listOfstudents) => {
  return new Promise((resolve, reject) => {
    const queryForLectures = "SELECT * FROM lecture WHERE refCode = ?";
    DBConnection.query(queryForLectures, [refCode], async (err, lectures) => {
      if (err) {
        console.error(err);
        return reject("Server error");
      }

      if (!lectures || lectures.length === 0) {
        return resolve("No lectures found");
      }

      const studentsList = listOfstudents;

      try {
        const promises = lectures.map((lecture) => {
          return studentsList.map((student) => {
            const values = [
              student, // Assuming student is the student ID
              lecture.refCode,
              "Absent",
              lecture.date,
              lecture.startTime,
            ];
            const query =
              "INSERT INTO attendance (sid, refCode, status, date, startTime) VALUES (?, ?, ?, ?, ?)";
            return new Promise((innerResolve, innerReject) => {
              DBConnection.query(query, values, (err, result) => {
                if (err) {
                  console.error(err);
                  innerReject(err);
                } else {
                  innerResolve(result);
                }
              });
            });
          });
        });

        await Promise.all(promises.flat());
        resolve("Attendance inserted");
      } catch (err) {
        console.error("Error adding attendance:", err);
        reject("Server error");
      }
    });
  });
};

const createRecords = async (refCode, lectures) => {
  return new Promise(async (resolve, reject) => {
    try {
      const studentsList = await students(refCode);
      const promises = lectures.map((lecture) => {
        return studentsList.map((student) => {
          const values = [
            student.id,
            lecture.course_id,
            "Absent",
            lecture.date,
            lecture.start_time,
          ];
          const query =
            "INSERT INTO attendance (sid, refCode, status, date, startTime) VALUES (?, ?, ?, ?, ?)";
          return new Promise((innerResolve, innerReject) => {
            DBConnection.query(query, values, (err, result) => {
              if (err) {
                console.error(err);
                innerReject(err);
              } else {
                innerResolve(result);
              }
            });
          });
        });
      });
      await Promise.all(promises.flat());
      resolve("Attendance inserted");
    } catch (err) {
      console.error("Error adding attendance:", err);
      reject("Server error");
    }
  });
};

function checkExistSection(refCode) {
  return new Promise((resolve, reject) => {
    try {
      DBConnection.query(
        " SELECT * FROM section WHERE refCode = ?  ",
        refCode,
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
}

module.exports = {
  getSections: async (req, res) => {
    try {
      DBConnection.query(
        "SELECT refCode, courseName, sectionNum FROM section",
        function (err, rows) {
          if (err) {
            throw err;
          }

          return res.status(200).json(rows);
        }
      );
    } catch (err) {
      res.status(401).json("Server error");
    }
  },
  addSection: async (req, res) => {
    if (
      !req.body.sectionRefCode ||
      !req.body.courseName ||
      !req.body.sectionNumber
    ) {
      return res.status(400).json("Empty argument");
    }

    // Check refCode to be numeric and between 3 to 10 digits
    if (!/^\d{3,10}$/.test(req.body.sectionRefCode)) {
      return res
        .status(400)
        .json(
          "Invalid sectionRefCode. Must be a numeric value between 3 to 10 digits."
        );
    }
    if (!/^\d{1,5}$/.test(req.body.sectionNumber)) {
      return res
        .status(400)
        .json(
          "Invalid Section number. Must be a numeric value between 1 to 10 digits."
        );
    }

    // Check courseName and sectionNumber to be string
    if (typeof req.body.courseName !== "string") {
      return res
        .status(400)
        .json(
          "Invalid argument types. courseName and sectionNumber should be strings."
        );
    }
    exist = await checkExistSection(req.body.sectionRefCode);

    if (!exist) {
      try {
        // Insert the section into the database
        let sqlUpdate =
          "INSERT INTO section (refCode, courseName, sectionNum) VALUES (?, ?, ?)";
        DBConnection.query(
          sqlUpdate,
          [
            req.body.sectionRefCode,
            req.body.courseName,
            req.body.sectionNumber,
          ],
          (err, result) => {
            if (err) throw err;
            console.log("Section inserted");
            return res.status(200).json("Section inserted");
          }
        );
      } catch (err) {
        console.error("Error adding section:");
        return res.status(500).json("Server error");
      }
    } else {
      return res.status(400).json("Section Exist");
    }
  },
  getLectures: async (req, res) => {
    const refCode = req.query.refCode;
    let currentDate = new Date().toISOString().slice(0, 10);

    let query = `SELECT * FROM lecture WHERE refCode = ? AND date <= ?`;
    lectures = [];
    DBConnection.query(query, [refCode, currentDate], (err, result) => {
      if (err) {
        console.error(err);
        return res.status(500).json("error can not get data");
      } else {
        return res.status(200).json(result);
      }
    });
  },
  addDeviceInfo: async (req, res) => {
    try {
      const { classRoomNumber, password } = req.body;
      if (!/^\d{1,10}$/.test(classRoomNumber)) {
        return res.status(400).json("Invalid classRoom number");
      }
      const salt = bcrypt.genSaltSync(10);
      const hash = bcrypt.hashSync(password, salt);

      const sql = "INSERT INTO classroomdevice (id ,password) VALUES (?, ?)";
      DBConnection.query(sql, [classRoomNumber, hash], (err, result) => {
        if (err) {
          console.error(err);
          res.status(500).json("Duplicate id or server error");
        } else {
          res.status(200).json("success");
        }
      });
    } catch (err) {
      res.status(500).json("error");
      console.log(err);
    }
  },
  getStudentStatus: async (req, res) => {
    const sid = req.query.sid; 


    const sql = `
        SELECT
            u.name as studentName,
            s.courseName,
            s.sectionNum as section,
            a.status,
            l.date,
            l.startTime as lectureStartTime,
            a.time as attendanceTime
        FROM
            attendance a
        JOIN lecture l ON a.date = l.date AND a.refCode = l.refCode AND a.StartTime = l.startTime
        JOIN section s ON l.refCode = s.refCode
        JOIN users u ON a.sid = u.id 
        WHERE
            a.sid = ?
    `;

    DBConnection.query(sql, [sid], (err, rows) => {
      if (err) {
        return res.status(500).json({ error: "Database query failed" });
      }

      const groupedData = rows.reduce((acc, row) => {
        if (!acc[row.courseName]) {
          acc[row.courseName] = {
            studentName: row.studentName,
            courseName: row.courseName,
            section: row.section,
            attendance: [],
            lateTimes: [], 
          };
        }

        acc[row.courseName].attendance.push({
          status: row.status,
          date: row.date,
          time: row.attendanceTime,
        });

        if(row.attendanceTime) { // Check if attendanceTime is not null
            // Calculate time difference for every attendance entry
            const lectureTime = new Date(`1970-01-01T${row.lectureStartTime}Z`);
            const attendanceTime = new Date(`1970-01-01T${row.attendanceTime}Z`);
            const differenceInMinutes =
              (attendanceTime - lectureTime) / (1000 * 60);
            acc[row.courseName].lateTimes.push(differenceInMinutes);
        }

        return acc;
      }, {});

      const studentAttendance = Object.values(groupedData).map((course) => {
        const averageLateTime =
          course.lateTimes.reduce((a, b) => a + b, 0) /
            course.lateTimes.length || 0;
        return {
          studentName: course.studentName,
          courseName: course.courseName,
          section: course.section,
          averageLateTime: Math.round(averageLateTime), // Rounded to nearest integer
          attendance: course.attendance,
        };
      });

      res.json(studentAttendance);
    });
  },
  addLectures: async (req, res) => {
    try {
      let firstWeek = getDateFromWeekNumber(req.body.firstWeek);
      let numWeeks = req.body.numWeeks;
      let days = ["sunday", "monday", "tuesday", "wednesday", "thursday"];

      let lectures = [];

      // Create lectures
      for (let i = 0; i < numWeeks; i++) {
        for (let day of days) {
          if (`${day}Check` in req.body) {
            let startTime = req.body[`${day}Start`];
            let endTime = req.body[`${day}End`];
            let classRoom = req.body[`${day}Room`];

            let firstWeekDay = firstWeek.getDay();
            let lectureDay = days.indexOf(day);

            let daysDifference = lectureDay - firstWeekDay;
            if (daysDifference < 0) {
              daysDifference += 7;
            }

            let lectureDate = new Date(firstWeek.getTime());
            lectureDate.setDate(lectureDate.getDate() + daysDifference + i * 7);

            let lecture = {
              date: lectureDate,
              course_id: req.body.refCode,
              start_time: startTime,
              end_time: endTime,
              numOfp: 0,
              classRoom: classRoom,
              day: day,
            };

            lectures.push(lecture);
          }
        }
      }

      let query = `INSERT INTO lecture (date , refCode, startTime, endTime, numOfPresence, classNumber, day) VALUES (?, ?, ?, ?, ?, ?, ?)`;

      let queries = lectures.map((lecture) => {
        return new Promise((resolve, reject) => {
          let values = [
            lecture.date,
            lecture.course_id,
            lecture.start_time,
            lecture.end_time,
            lecture.numOfp,
            lecture.classRoom,
            lecture.day,
          ];

          DBConnection.query(query, values, (err, result) => {
            if (err) {
              reject(err);
            } else {
              resolve(result);
            }
          });
        });
      });

      Promise.all(queries)
        .then(async (results) => {
          try {
            // await createRecords then send response
            await createRecords(req.body.refCode, lectures); // remove 'res'
            return res.status(200).json("Lectures and Records Added");
          } catch (err) {
            console.error(err);
            return res.status(500).json("Error adding records");
          }
        })
        .catch((err) => {
          console.error(err);
          if (err.code === "ER_DUP_ENTRY") {
            res.status(400).json("Duplicate Lectures"); // Changed from 401 to 400, which is the standard code for a bad request.
          } else {
            res.status(500).json("Internal Server Error");
          }
        });
    } catch (err) {
      console.error(err);
      res.status(500).json("error");
    }
  },

  sectionStudents: async (req, res) => {
    const refCode = req.query.refCode;
    const query = `SELECT users.id, users.name 
        FROM users 
        INNER JOIN enrollment ON users.id = enrollment.sid
        WHERE enrollment.refCode = ?;`;
    DBConnection.query(query, [refCode], (err, result) => {
      if (err) {
        console.error(err);
        res.status(500).json("error");
      } else {
        res.status(200).json(result);
      }
    });
  },
  //Add the encoding of the student in the section.json file ?????
  addStudents: async (req, res) => {
    try {
      const { studentIds, refCode } = req.body;
      if (!studentIds) {
        return res.status(400).json({ message: "No student IDs provided" });
      }

      const listOfstudents = studentIds.split(",");
      const allPromises = listOfstudents.map((SID) => {
        return new Promise((resolve, reject) => {
          const checkStudentQuery = `SELECT * FROM student WHERE user_id = ?`;
          DBConnection.query(checkStudentQuery, [SID], async (err, result) => {
            if (err) {
              console.error(err);
              return reject(err);
            }

            if (!result || !result.length) {
              console.log(`Student with SID: ${SID} does not exist.`);
              return resolve(null);
            }

            const checkEnrollmentQuery = `SELECT * FROM enrollment WHERE sid = ? AND refCode = ?`;
            DBConnection.query(
              checkEnrollmentQuery,
              [SID, refCode],
              (err, result) => {
                if (err) {
                  console.error(err);
                  return reject(err);
                }

                if (result && result.length) {
                  console.log(
                    `Already enrolled: SID ${SID}, refCode ${refCode}`
                  );
                  return resolve(null);
                }

                const insertQuery = `INSERT INTO enrollment (sid, refCode) VALUES (?, ?)`;
                DBConnection.query(
                  insertQuery,
                  [SID, refCode],
                  (err, result) => {
                    if (err) {
                      console.error(err);
                      return reject(err);
                    }
                    resolve(result);
                  }
                );
              }
            );
          });
        });
      });

      await Promise.all(allPromises);

      try {
        await createRecordsForNewStudents(refCode, listOfstudents);
      } catch (err) {
        console.error("Error creating attendance records:", err);
        return res
          .status(500)
          .json({ errors: "Error creating attendance records" });
      }

      res.status(200).json("Success");
    } catch (err) {
      console.error("Server error:", err);
      res.status(500).json({ message: "Internal server error" });
    }
  },
  deleteLecture: async (req, res) => {
    const { refCode, date, startTime } = req.body.lecture;
    let rawDate = new Date(date);

    let sql =
      "DELETE FROM lecture WHERE refCode = ? AND date = ? AND startTime = ?";
    let values = [refCode, rawDate, startTime];

    DBConnection.query(sql, values, function (err, result) {
      if (err) {
        console.error("Error deleting record: " + err.message);
        return res.status(500).send("Error deleting Lecture");
      } else {
        console.log(result.affectedRows + " record(s) deleted");
        return res.status(200).json("Lecture deleted");
      }
    });
  },
  removeStudentFromSection: async (req, res) => {
    const { student, refCode } = req.body;

    const sql = "DELETE FROM enrollment WHERE refCode = ? AND sid = ?";
    let values = [refCode, student.id];

    DBConnection.query(sql, values, function (err, result) {
      if (err) {
        console.error("Error deleting record: " + err.message);
        return res.status(500).send("Error deleting record");
      } else {
        console.log(result.affectedRows + " record(s) deleted");
        return res.status(201).send("Student removed");
      }
    });
  },
  deleteSection: async (req, res) => {
    let sql = "DELETE FROM section WHERE refCode = ?";

    DBConnection.query(sql, req.body.refCode, function (err, result) {
      if (err) {
        console.error("Error deleting record: " + err.message);
        return res.status(500).send("Error deleting Section");
      } else {
        console.log(result.affectedRows + "Section record(s) deleted");
        return res.status(200).send("Section deleted");
      }
    });
  },
};
