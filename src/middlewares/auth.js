const jwt = require("jsonwebtoken");
const User = require("../models/user");

const userAuth = async (req, res, next) => {
    try {
        const { token } = req.cookies;

        if (!token) {
            throw new Error("Token is not valid");
        }

        const decoderObj = await jwt.verify(token, "Dev@Tinder@790");

        const { _id } = decoderObj;

        const user = await User.findById(_id);
        if (!user) {
            throw new Error("Usr not found");
        }

        req.user = user;
        next();
    } catch (err) {
        res.status(401).send("Error: " + err.message);
    };
}


module.exports = { userAuth };