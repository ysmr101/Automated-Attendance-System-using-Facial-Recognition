const express = require("express");
/**
 * Config view engine for app
 */
let configViewEngine = (app)=> {
    app.use(express.static("./src")); 
    app.use(express.static("./src/public"));
    
};

module.exports = configViewEngine;
