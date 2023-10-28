const DBConnection = require("../configs/DBConnection");

module.exports = {
  getFacultySections: async (req, res) => {
    let query = `SELECT section.* FROM section
                  INNER JOIN teach ON section.refCode = teach.refCode
                  WHERE teach.eid = ?`;

    DBConnection.query(query, [req.id], (err, result) => {
      if (err) {
        console.error(err);
        return res.status(401).send("error");
      }

      return res.status(200).json(result);
    });
  },
  getRecords: async (req, res) => {
    let query = `
  SELECT attendance.*, users.name 
  FROM attendance 
  INNER JOIN users on users.id = attendance.sid
  WHERE  attendance.date = ? AND attendance.refCode = ? AND startTime = ?;
`;
    DBConnection.query(
      query,
      [req.query.date, req.query.refCode, req.query.startTime],
      (err, result) => {
        if (err) {
          console.error(err);
          return res.status(401).send("error");
        }
        
        return res.status(200).json(result);
      }
    );
  },

  //get the lectures check date
  getFacultyLectureList: async (req, res) => {

    try {
    let currentDate = new Date().toISOString().slice(0, 10); 
    
    let query = `
        SELECT lecture.* FROM lecture
        INNER JOIN teach ON lecture.refCode = teach.refCode
        WHERE lecture.refCode = ? AND lecture.date <= ?;
    `;

    DBConnection.query(query, [req.query.refCode, currentDate], (err, result) => {
        if (err) {
            console.error(err);
            return res.status(401).send("error");
        }
        return res.status(200).json(result);
    });
  }catch(err){
    return res.status(401).send("error");
  }
},

  handleUpdateRecord: async (req, res) => {
    const arr = req.body.params.records;
    const failedUpdates = []; // Array to hold records that failed to update

    let pending = arr.length; // Count of pending async queries

    if (pending === 0) {
      return res.status(400).json("No records to update");
    }

    arr.forEach((record) => {
      DBConnection.query(
        "UPDATE attendance SET status = ? WHERE sid = ? AND date = ? AND startTime = ? AND refCode = ?",
        [
          record.status,
          record.sid,
          req.body.params.date,
          req.body.params.startTime,
          req.body.params.refCode,
        ],
        (err, result) => {
          pending--; // Decrement pending count

          if (err) {
            console.error(err);
            failedUpdates.push(record);
          }

          // All queries are done (either fulfilled or failed)
          if (pending === 0) {
            if (failedUpdates.length === 0) {
              console.log("Attendance updated successfully for all records.");
              return res
                .status(200)
                .json("Attendance updated successfully for all records.");
            } else {
              console.log("Some records failed to update.");
              return res.status(206).json({
                message: "Some records failed to update",
                failedUpdates,
              });
            }
          }
        }
      );
    });
  },
  assignFaculty: async (req, res) => {
    // Function to check if facultyId exists in the relevant table
    async function checkExistFaculty(facultyId) {
      return new Promise((resolve, reject) => {
        DBConnection.query(
          "SELECT * FROM facultymember WHERE user_id = ?",
          [facultyId],
          (err, rows) => {
            if (err) return reject(err);
            if (rows && rows.length > 0) return resolve(true);
            else return resolve(false);
          }
        );
      });
    }
   async function checkExistTeach(refCode) {
      return new Promise((resolve, reject) => {
        try {
          DBConnection.query(
            "SELECT teach.* FROM teach WHERE refCode = ?",
            [refCode],  // Parameters should be in an array
            function (err, rows) {
              if (err) {
                return reject(err);
              }
    
              if (rows && rows.length > 0) {
                return resolve(true);
              } else {
                return resolve(false);
              }
            }
          );
        } catch (err) {
          return reject(err);
        }
      });
    }
    try {
      // Check if faculty exists
      const facultyExists = await checkExistFaculty(req.body.facultyId);
      if (!facultyExists) {
        return res.status(400).json("Faculty ID does not exist");
      }
  
      // Check if teach row exists
      const existTeach = await checkExistTeach(req.body.refCode);
      if (!existTeach) {
        // Insert new teach row
        let sqlInsert = "INSERT INTO teach (eid, refCode) VALUES (?, ?)";
        DBConnection.query(
          sqlInsert,
          [req.body.facultyId, req.body.refCode],
          (err, result) => {
            if (err) throw err;
            console.log("Faculty Assigned");
            return res.status(200).json("Faculty Assigned");
          }
        );
      } else {
        // Update existing teach row
        let sqlUpdate = "UPDATE teach SET eid = ? WHERE refCode = ?";
        DBConnection.query(
          sqlUpdate,
          [req.body.facultyId, req.body.refCode],
          (err, result) => {
            if (err) throw err;
            console.log("Faculty Re-assigned");
            return res.status(200).json("Faculty Re-assigned");
          }
        );
      }
    } catch (err) {
      console.error("Error Assigning Faculty:", err);
      return res.status(500).json("Server error");
    }
  },
  
  handledPreferredTimes: async (req, res) => {
    let { lateTime, absentTime } = req.body;
   
    if (!Number.isInteger(lateTime) || !Number.isInteger(absentTime) || lateTime >= 100 || absentTime >= 100) {
      return res.status(400).json({ success: false, message: "Both Late Time and Absent Time should be integers less than 100." });
    }
    
    if(lateTime > absentTime){
      lateTime = absentTime
    }
    DBConnection.query(
      "UPDATE facultymember SET late = ?, absent = ? WHERE user_id = ?",
      [lateTime, absentTime, req.id],
      (err, results) => {
        if (err) {
          console.error("Database Error:", err);
          return res.status(500).json({ success: false, message: "Internal Server Error" });
        }
        
        if (results.affectedRows === 0) {
          return res.status(404).json({ success: false, message: "Record not found" });
        }
  
        return res.status(200).json({ success: true, message: "Times updated successfully" });
      }
    );
  },
  getFacultyTimes: async (req, res) => {
   
    DBConnection.query(
      "SELECT absent, late FROM facultymember WHERE user_id = ?",
      [req.id],
      (err, results) => {
        if (err) {
          console.error("Database Error:", err);
          return res.status(500).json({ success: false, message: "Internal Server Error" });
        }
        
        if (results.length === 0) {
          return res.status(404).json({ success: false, message: "Record not found" });
        }
        
        return res.status(200).json({ success: true, date: results[0] });
      }
    );
  },
  getFDAStudents: async (req, res) => { 


    let query = `SELECT 
    a.sid,
    u.name AS studentName,
    SUM(CASE WHEN a.status = 'Absent' AND a.date < CURDATE() THEN 1 ELSE 0 END) AS AbsenceCount,
    COUNT(*) AS records
    FROM 
    attendance a
    JOIN 
    users u ON a.sid = u.id
    WHERE 
    a.refCode = ?
    GROUP BY 
    a.sid, u.name`;
    
    
        DBConnection.query(query,[req.query.refCode], (err, result) => {
          if (err) {
            console.error(err);
            return res.status(401).send('error')
          }
          console.log(result)
          return res.status(200).json(result)
        });
  },
  getStudentAttendanceInfo: (req, res) => {
    const { sid, refCode } = req.query;
    let currentDate = new Date().toISOString().slice(0, 10);
    DBConnection.query(
      "SELECT `status`, COUNT(*) as `count` FROM `attendance` WHERE `sid` = ? AND `refCode` = ? AND date <= ? GROUP BY `status`",
      [sid, refCode, currentDate],
      (err, results) => {
        if (err) {
          console.error("Database Error:", err);
          return res.status(500).json({ success: false, message: "Internal Server Error" });
        }
  
        if (results.length === 0) {

          return res.status(404).json({ success: false, message: "No attendance records found for this student" });
        }
  
        const attendanceInfo = {};
        for (let row of results) {
          attendanceInfo[row.status] = row.count;
        }
      
  
        return res.status(200).json(attendanceInfo);
      }
    );
  }
  
};
