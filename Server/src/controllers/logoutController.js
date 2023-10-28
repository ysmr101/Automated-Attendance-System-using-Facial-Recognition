const loginService = require("../services/loginService");

const fsPromises = require('fs').promises;
const path = require('path');

const handleLogout = async (req, res) => {
    // On client, also delete the accessToken

    const cookies = req.cookies;
    if (!cookies?.jwt) return res.sendStatus(204); //No content
    const refreshToken = cookies.jwt;

    // Is refreshToken in db?
    const user = await loginService.findRefreshToken(refreshToken);
    if (!user) {
        res.clearCookie('jwt', { httpOnly: true, sameSite: 'None', secure: true });
        return res.sendStatus(204);
    }

    // Delete refreshToken in db
    await loginService.updateRefreshToken(user.id, null);

    res.clearCookie('jwt', { httpOnly: true, sameSite: 'None', secure: true });
    res.sendStatus(204);
}

module.exports = { handleLogout }