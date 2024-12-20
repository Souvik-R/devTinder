const express = require("express");
const authRouter = express.Router();
const { validateSignUpData } = require("../utils/validation");
const User = require("../models/user");
const bcrypt = require("bcrypt");


authRouter.post("/signup", async (req, res) => {
    try {
        // validation of data
        validateSignUpData(req);
        const { firstName, lastName, emailId, password } = req.body;
        // Encrypt the password
        const hashPassword = await bcrypt.hash(password, 10);
        console.log(hashPassword);
        console.log("@@@@@@@@@@@@@@@@@@@@@@@@@@@");
        const user = new User({
            firstName,
            lastName,
            emailId,
            password: hashPassword
        });
 
        await user.save();
        res.send("User created successfully");
    } catch (err) {
        res.status(400).send("Some error occur when creating an user");
    }
});


// Login Api
authRouter.post("/login", async (req, res) => {
    try {
        const { emailId, password } = req.body;

        const user = await User.findOne({ emailId: emailId });
        if (!user) {
            throw new Error("Invalid credentials!!");
        }
        const isPasswordValid = await user.validatePassword(password);
        if (isPasswordValid) {

            const token = await user.getJWT();

            res.cookie("token", token, { expires: new Date(Date.now() + 900000) });
            res.status(200).send(user);
        } else {
            throw new Error("Invalid credentials!!");
        }
    } catch (err) {
        res.status(400).send("ERROR : " + err.message);
    }
});


authRouter.post("/logout", async (req, res) => {
    res.cookie("token", null, {
        expires: new Date(Date.now()),
    });

    res.send("Logout Successfull!!!!")
});


module.exports = authRouter;