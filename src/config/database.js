const mongoose = require("mongoose");

const connectDB = async () => {
    await mongoose.connect("mongodb+srv://souvik123:souvik123@cluster0.m72uz.mongodb.net/devTinder");
}

module.exports = connectDB;