const express = require("express");
const userRouter = express.Router();
const { userAuth } = require("../middlewares/auth");
const ConnectionRequest = require("../models/connectionRequest");

userRouter.get("/user/request", userAuth, async (req, res) => {
    try {
        const loggedInUser = req.user;

        const connectionRequests = await ConnectionRequest.find({
            toUserId: loggedInUser._id,
            status: "interested"
        })
        .populate("fromUserId", "firstName lastName photoUrl age gender about skills")
        // }).populate("fromUserId", ["firstName", "lastName"]);

        res.json({
            message: "Data fetched successfully",
            data: connectionRequests
        })
    } catch (err){
        res.status(500).json({ message: err.message });
    }
});

userRouter.get("/user/connections", userAuth, async (req, res) => {
    try {
        const loggedInUser = req.user;

        const connectionRequests = await ConnectionRequest.find({
            $or: [
                { fromUserId: loggedInUser._id, status: "accepted" },
                { toUserId: loggedInUser._id, status: "accepted" }
            ]
        })
        .populate("fromUserId", "firstName lastName photoUrl age gender about skills")        
        .populate("toUserId", "firstName lastName photoUrl age gender about skills");

        const data = connectionRequests.map(row => {
            if (row.fromUserId._id.toString() === loggedInUser._id.toString()) {
                return row.toUserId;
            }
            return row.fromUserId;
        });

        res.json({ data });

    } catch (err){
        res.status(500).json({ message: err.message });
    }
});


module.exports = userRouter;