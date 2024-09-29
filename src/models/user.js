const mongoose = require("mongoose");
const validator = require("validator");

const userSchema = new mongoose.Schema({
    firstName: {
        type: String,
        required: true,
        minLength: 4,
        maxLength: 50,
        trim: true
    },
    lastName: {
        type: String,
    },
    emailId: {
        type: String,
        lowercase: true,
        required: true,
        unique: true,
        trim: true,
        validate(value){
            if(!validator.isEmail(value)){
                throw new Error("Invalid Email");
            }
        }
    },
    password: {
        type: String,
        required: true
    },
    age: {
        type: Number,
        min: 18,
    },
    gender: {
        type: String,
        validate(value){
            if(!["male", "female", "others"].includes(value)){
                throw new Error("Gender data is not valid")
            }
        }
    },
    photoUrl: {
        type: String,
        default: "https://www.vecteezy.com/free-vector/default-profile-picture",
        validate(value){
            if(!validator.isURL(value)){
                throw new Error("Invalid URL");
            }
        }
    },
    about: {
        type: String,
        default: "This is a default about of the user"
    },
    skills: {
        type: [String]
    }
},{
    timestamps: true,
});


module.exports = mongoose.model("User", userSchema);