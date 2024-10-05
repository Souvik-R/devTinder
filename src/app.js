const express = require("express");
const connectDB = require("./config/database");
const app = express();
const User = require("./models/user");
const { validateSignUpData } = require("./utils/validation");
const bcrypt = require("bcrypt");
const cookieParser = require("cookie-parser");
const jwt = require("jsonwebtoken");
const {userAuth} = require("./middlewares/auth");


app.use(express.json());
app.use(cookieParser());

app.post("/signup", async (req, res) => {
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
app.post("/login", async (req, res) => {
    try {
        const { emailId, password } = req.body;

        const user = await User.findOne({ emailId: emailId });
        if (!user) {
            throw new Error("Invalid credentials!!");
        }
        const isPasswordValid = await user.validatePassword(password);
        if (isPasswordValid) {

            const token = await user.getJWT();

            res.cookie("token", token, { expires: new Date(Date.now() + 900000)});
            res.status(200).send("Login successful!!");
        } else {
            throw new Error("Invalid credentials!!");
        }
    } catch (err) {
        res.status(400).send("ERROR : " + err.message);
    }
});

app.get("/profile", userAuth, async (req, res) => {
    try {
        const user = req.user;

        res.send(user);

    } catch (err) {
        res.status(400).send("ERROR : " + err.message);
    }
});


app.post("/sendConnectionRequest", userAuth, async (req, res) => {
    const user = req.user;
    
    res.send(user.firstName + " sent a connect request");
});



connectDB().then(() => {
    console.log("Database connection established.");
    app.listen(3000, (req, res) => {
        console.log("Server is running on port 3000");
    });
}).catch((err) => {
    console.error("Database cannot be connected.")
});

