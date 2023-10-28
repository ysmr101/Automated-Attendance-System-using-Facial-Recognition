const loginService = require("../services/loginService");
const jwt = require("jsonwebtoken");
require("dotenv").config();

const handleLogin = async (req, res) => {
  try {
    const { id, password } = req.body;

    if (!id || !password)
      return res.status(400).json({ message: "id and password are required." });

      if (!/^\d{1,10}$/.test(id)) {
        return res
          .status(400)
          .json(
            "Invalid id"
          );
      }
    const user = await loginService.findUserById(id);
    if (!user)
      return res
        .status(401)
        .json({ error: `This user id "${id}" doesn't exist` }); //Unauthorized
    // evaluate password

    const match = await loginService.comparePassword(password, user);
    if (match) {
      // create JWTs
      const accessToken = jwt.sign(
        {
          UserInfo: {
            id: user.id,
            role: user.type,
          },
        },
        process.env.ACCESS_TOKEN_SECRET,
        { expiresIn: "30s" }
      );
      const refreshToken = jwt.sign(
        { id: user.id },
        process.env.REFRESH_TOKEN_SECRET,
        { expiresIn: "1d" }
      );

      // Saving refreshToken with current user
      await loginService.updateRefreshToken(user.id, refreshToken);
      res.cookie("jwt", refreshToken, {
        sameSite: 'Lax',  
        httpOnly: true,
        secure: false,    
        maxAge: 24 * 60 * 60 * 1000,
      });

      res.json({ role: user.type, accessToken });
    } else {
      return res.status(401).json({ error: `incorrect password` });
    }
  } catch (error) {
    console.log('fdf')
    console.error("Server Error:", error.message);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

const handleDeviceLogin = async (req, res) => {
  try {
    
    const { DeviceId, password } = req.body;

    if (!/^\d{1,10}$/.test(DeviceId)) {
      return res
        .status(400)
        .json(
          {error: "Invalid id"}
        );
    }
    if (!DeviceId || !password)
      return res.status(400).json({ message: "id and password are required." });
    const Device = await loginService.findDeviceById(DeviceId);
    if (!Device)
      return res
        .status(401)
        .json({ error: `This Device id "${DeviceId}" doesn't exist` }); //Unauthorized
    // evaluate password

    const match = await loginService.comparePassword(password, Device);
    if (match) {
      // create JWTs
      console.log(Device.id)
      const accessToken = jwt.sign(
        {
         "UserInfo": {
            "id": Device.id,
            "role": "Device",
          },
        },
        process.env.ACCESS_TOKEN_SECRET,
        { expiresIn: "30s" }
      );
      const refreshToken = jwt.sign(
        { id: Device.id },
        process.env.REFRESH_TOKEN_SECRET,
        { expiresIn: "1d" }
      );

      // Saving refreshToken with current user
      await loginService.updateDeviceRefreshToken(Device.id, refreshToken);
      res.cookie("jwt", refreshToken, {
        httpOnly: false,
        sameSite: "None",
        secure: false,
        maxAge: 24 * 60 * 60 * 1000,
      });

      res.json({ role: "Device", accessToken });
    } else {
      return res.status(401).json({ error: `incorrect password` });
    }
  } catch (error) {
    console.error("Server Error:", error.message);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

module.exports = { handleLogin, handleDeviceLogin };
