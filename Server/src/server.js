const express = require('express');
const app = express();
const path = require('path');
const cors = require('cors');
const corsOptions = require('./configs/corsOptions');
const { logger } = require('./middleware/logEvents');
const errorHandler = require('./middleware/errorHandler');
const verifyJWT = require('./middleware/verifyJWT');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const credentials = require('./middleware/credentials');
const initWebRoutes= require("./routes/WebRouter");
const initDeviceRoutes= require("./routes/DeviceRouter");
const protectedRoutes = express.Router();
const PORT = 3500;


app.use(express.static(path.join(__dirname, 'public/build')));


app.use(logger);


app.use(credentials);


app.use(cors(corsOptions));


app.use(bodyParser.json({limit: '35mb'}));

app.use(
  bodyParser.urlencoded({
    extended: true,
    limit: '35mb',
    parameterLimit: 50000,
  }),
);

app.use(cookieParser());

// Public routes
app.use('/login', require('./routes/login'));
app.use('/refresh', require('./routes/refresh'));
app.use('/logout', require('./routes/logout'));
app.use('/', require('./routes/register'));
app.use('/forgotPassword', require('./routes/forgetPassword'));

// Protected routes setup
protectedRoutes.use(verifyJWT);
initWebRoutes(protectedRoutes);
initDeviceRoutes(protectedRoutes);

app.use('/api', protectedRoutes);

// Catch-all route for SPA
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'public/build/index.html'));
});

// Error handlers
app.use(errorHandler);

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));