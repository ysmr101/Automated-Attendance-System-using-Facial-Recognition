const express = require("express");
const passport = require("passport");
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const attendanceDeviceCtrl = require("../controllers/attendanceDeviceCtrl");
const verifyRoles = require('../middleware/verifyRoles');
const ROLES_LIST = require('../configs/roles_list');
//need some work

const router = express.Router();


let initDeviceRoutes = (app) => {
    
router.post("/getCurrentClass", verifyRoles(ROLES_LIST.Device), attendanceDeviceCtrl.getCurrentClass);
router.post("/getStudentEncodings", verifyRoles(ROLES_LIST.Device), attendanceDeviceCtrl.getStudentEncodings);
router.post("/saveStudentEncodings", verifyRoles(ROLES_LIST.Device), attendanceDeviceCtrl.saveStudentEncodings);
router.post("/AttendStudent", verifyRoles(ROLES_LIST.Device), attendanceDeviceCtrl.UpdateAttendance);




app.use("/", router);
};

module.exports = initDeviceRoutes;