const express = require("express");
const connectDB = require("./config/database");
const app = express();
const User = require("./models/user");
const { validateSignUpData } = require("./utils/validation");
const bcrypt = require("bcrypt");

app.use(express.json());

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
        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (isPasswordValid) {
            res.status(200).send("Login successful!!");
        } else {
            throw new Error("Invalid credentials!!");
        }
    } catch (err) {
        res.status(400).send("ERROR : " + err.message);
    }
});

// Get use by email
app.post("/user", async (req, res) => {
    const emailId = req.body.emailId;
    try {
        const user = await User.findOne({ emailId: emailId });
        if (user) {
            res.send(user);
        } else {
            res.status(404).send("User not found");
        }
    } catch (error) {
        res.status(500).send("Error");
    }
});

// Get the data from database
app.get("/feed", async (req, res) => {
    try {
        const user = await User.find({});
        res.send(user);
    } catch (error) {
        res.status(400).send("Some error occur when fetching data");
    }
});

// Delete user
app.delete("/user", async (req, res) => {
    const userId = req.body.userId;
    try {
        const deleteUser = await User.findByIdAndDelete({ _id: userId });
        res.send("User deleted successfully");
    } catch (error) {
        res.status("400").send("Something went wrong");
    }
});


// Update the user
app.patch("/user/:userId", async (req, res) => {
    const userId = req.params?.userId;
    const data = req.body;
    try {
        const ALLOWED_UPDATES = ["photoUrl", "about", "gender", "age", "skills"];

        const isUpdateAllowed = Object.keys(data).every((k) => { ALLOWED_UPDATES.includes(k) });
        if (!isUpdateAllowed) {
            throw new Error("Update not allowed");
        }
        if (data?.skill.length > 10) {
            throw new Error("Skills cannot be more than 10");
        }
        const updateUser = await User.findByIdAndUpdate(userId, data, {
            returnDocument: "before",
            runValidators: true,
        });
        console.log(updateUser);
        res.send("User updated successfully");
    } catch (error) {
        res.status("400").send("Something went wrong");
    }
});

connectDB().then(() => {
    console.log("Database connection established.");
    app.listen(3000, (req, res) => {
        console.log("Server is running on port 3000");
    });
}).catch((err) => {
    console.error("Database cannot be connected.")
});

