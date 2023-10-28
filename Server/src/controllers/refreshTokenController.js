const loginService = require("../services/loginService");

const jwt = require('jsonwebtoken');
require('dotenv').config();

const handleRefreshToken = async (req, res) => {
    
    const cookies = req.cookies;
    if (!cookies?.jwt) return res.sendStatus(401);
    const refreshToken = cookies.jwt;

    
    const user = await loginService.findRefreshToken(refreshToken);
    
    if (!user) return res.sendStatus(403); //Forbidden 
    // evaluate jwt 
    jwt.verify(
        refreshToken,
        process.env.REFRESH_TOKEN_SECRET,
        (err, decoded) => {
            if (err || user.id !== decoded.id) return res.sendStatus(403);
            
            const accessToken = jwt.sign(
                {
                    "UserInfo": {
                        "id": user.id,
                        "role": user.type
                    }
                },
                process.env.ACCESS_TOKEN_SECRET,
                { expiresIn: '30s' }
            );
            res.status(200).json({ role: user.type,  accessToken });
        }
    );
}

const handleDeviceRefreshToken = async (req, res) => {
    
    const cookies = req.cookies;
    if (!cookies?.jwt) return res.sendStatus(401);
    const refreshToken = cookies.jwt;

    
    const Device = await loginService.findDeviceRefreshToken(refreshToken);
    
    if (!Device) return res.sendStatus(403); //Forbidden 
    // evaluate jwt 
    jwt.verify(
        refreshToken,
        process.env.REFRESH_TOKEN_SECRET,
        (err, decoded) => {
            if (err || Device.id !== decoded.id) return res.sendStatus(403);
            
            const accessToken = jwt.sign(
                {
                    "UserInfo": {
                        "id": Device.id,
                        "role": 'Device'
                    }
                },
                process.env.ACCESS_TOKEN_SECRET,
                { expiresIn: '30s' }
            );
            res.status(200).json({ role: 'Device',  accessToken });
        }
    );
}

module.exports = { handleRefreshToken, handleDeviceRefreshToken }