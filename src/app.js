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
app.patch("/user", async (req, res) => {
    const userId = req.body.userId;
    const data = req.body;
    try{
        const updateUser = await User.findByIdAndUpdate(userId, data, {
            returnDocument: "before",
            runValidators: true,
        });
        console.log(updateUser);
        res.send("User updated successfully");
    } catch (error){
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

