const express = require("express");
const studentController = require("../controllers/studentController");
const facultyController = require("../controllers/facultyController");
const adminController = require("../controllers/adminController");
const ROLES_LIST = require('../configs/roles_list');
const userController = require("../controllers/userController");
const multer = require('multer')
const upload = multer()
const verifyRoles = require('../middleware/verifyRoles');
const path = require("path");
const rateLimit = require("express-rate-limit");

const uploadLimiter = rateLimit({
  windowMs: 14 * 1000, // 14sec
  max: 1, // limit each IP to 2 uploads per windowMs
  message: "Too many uploads created from this IP, please try again after 15 sec"
});


const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(__dirname, "..", "StudentsPic")); // Use path.join with __dirname
  },
  filename: function (req, file, cb) {
    cb(
      null,
      file.fieldname + "-" + Date.now() + path.extname(file.originalname)
    );
  },
});

const fileFilter = (req, file, cb) => {
  // Allowed extensions
  const filetypes = /jpeg|jpg|png|gif|heic|heif/i;
  
  // Check ext
  const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
  
  // Check mime
  const mimetype = filetypes.test(file.mimetype);

  if (mimetype && extname) {
    return cb(null, true);
  } else {
    return cb(new Error("Error: Images only!"));
  }
};

const uploadPic = multer({
  storage: storage,
  fileFilter: fileFilter
});

let router = express.Router();

let initWebRoutes = (app) => {

  //user post
  router.post("/EditData" ,verifyRoles(ROLES_LIST.student, ROLES_LIST.faculty, ROLES_LIST.admin), userController.EditData);
  router.post("/ChangeUserPassword" ,verifyRoles(ROLES_LIST.student, ROLES_LIST.faculty, ROLES_LIST.admin), userController.changePassword);


  //user get
  router.get("/getUserData", verifyRoles(ROLES_LIST.student, ROLES_LIST.faculty, ROLES_LIST.admin), userController.getUserData);
  

  //student post
  router.post("/addPicture", verifyRoles(ROLES_LIST.student, ROLES_LIST.faculty, ROLES_LIST.admin), uploadLimiter, uploadPic.single('profile_pic'), studentController.addPicture);

  //student get
  router.get("/getStudentPicture", verifyRoles(ROLES_LIST.student, ROLES_LIST.faculty, ROLES_LIST.admin), studentController.getStudentPicture);
  router.get("/getStudentSections", verifyRoles(ROLES_LIST.student, ROLES_LIST.faculty, ROLES_LIST.admin), studentController.studentSections);
  router.get("/getStudentAttendance", verifyRoles(ROLES_LIST.student, ROLES_LIST.faculty, ROLES_LIST.admin), studentController.getAttendance);

  


  //faculty post
  router.post("/handleUpdateRecord",verifyRoles(ROLES_LIST.faculty, ROLES_LIST.admin), facultyController.handleUpdateRecord);
  router.post("/setPreferredTimes",verifyRoles(ROLES_LIST.faculty, ROLES_LIST.admin), facultyController.handledPreferredTimes);
  
  //faculty get
  router.get("/getFacultySections", verifyRoles( ROLES_LIST.faculty, ROLES_LIST.admin), facultyController.getFacultySections);
  router.get("/getFacultyLectureList", verifyRoles( ROLES_LIST.faculty, ROLES_LIST.admin), facultyController.getFacultyLectureList);
  router.get("/getRecords", verifyRoles( ROLES_LIST.faculty, ROLES_LIST.admin), facultyController.getRecords);
  router.get("/getStudentAttendanceInfo", verifyRoles( ROLES_LIST.faculty, ROLES_LIST.admin), facultyController.getStudentAttendanceInfo);
  router.get("/getFacultyTimes", verifyRoles( ROLES_LIST.faculty, ROLES_LIST.admin), facultyController.getFacultyTimes);
  router.get("/getFDAStudents", verifyRoles( ROLES_LIST.faculty, ROLES_LIST.admin), facultyController.getFDAStudents);
  //.......//
 
  //admin post
  
  router.post("/addSection",verifyRoles(ROLES_LIST.admin), adminController.addSection);
  router.post("/deleteLecture",verifyRoles( ROLES_LIST.faculty, ROLES_LIST.admin), adminController.deleteLecture);
  router.post("/addLectures",verifyRoles(ROLES_LIST.admin) , upload.none(), adminController.addLectures);
  router.post("/removeStudentFromSection", verifyRoles( ROLES_LIST.faculty, ROLES_LIST.admin), adminController.removeStudentFromSection);
  router.post("/addStudents", verifyRoles( ROLES_LIST.faculty, ROLES_LIST.admin), adminController.addStudents);
  router.post("/deleteSection", verifyRoles( ROLES_LIST.faculty, ROLES_LIST.admin), adminController.deleteSection);
  router.post("/addDeviceInfo", verifyRoles( ROLES_LIST.faculty, ROLES_LIST.admin), adminController.addDeviceInfo);
  router.post("/assignFaculty",verifyRoles(ROLES_LIST.faculty, ROLES_LIST.admin), facultyController.assignFaculty);

  //admin get
  router.get("/getStudentAttendanceStatus", verifyRoles(ROLES_LIST.admin, ROLES_LIST.faculty), adminController.getStudentStatus);
  router.get("/getSections", verifyRoles(ROLES_LIST.admin, ROLES_LIST.Device), adminController.getSections);
  router.get("/getLectures", verifyRoles(ROLES_LIST.admin), adminController.getLectures);
  router.get("/getStudents", verifyRoles(ROLES_LIST.admin), adminController.sectionStudents);





  app.use("/", router);
};

module.exports = initWebRoutes;