const express = require("express");
const connectDB = require("./config/database");
const app = express();
const User = require("./models/user");

app.use(express.json());

app.post("/signup", async (req, res) => {
    console.log(req.body);
    const user = new User(req.body);

    try {
        await user.save();
        res.send("User created successfully");
    } catch (err) {
        res.status(400).send("Some error occur when creating an user");
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

