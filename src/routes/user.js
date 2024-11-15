const express = require("express");
const userRouter = express.Router();
const { userAuth } = require("../middlewares/auth");
const ConnectionRequest = require("../models/connectionRequest");
const User = require("../models/user");

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

userRouter.get("/feed", userAuth, async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        let limit = parseInt(req.query.limit) || 10;
        limit = limit > 50 ? 50 : limit;
        const skip = (page - 1) * limit;

        const loggedInUser = req.user;
        const connectionRequests = await ConnectionRequest.find({
            $or: [
                {fromUserId: loggedInUser._id},
                {toUserId: loggedInUser._id}
            ]
        }).select("fromUserId toUserId");

        const hiddenUserFromFeed = new Set();
        connectionRequests.forEach((req)=>{
            hiddenUserFromFeed.add(req.fromUserId.toString());
            hiddenUserFromFeed.add(req.toUserId.toString());
        });

        console.log(hiddenUserFromFeed);

        const users = await User.find({
            $and: [
                { _id: { $nin: Array.from(hiddenUserFromFeed) } },
                { _id: { $ne: loggedInUser._id } },
            ]
        }).select("firstName lastName photoUrl age gender about skills").skip(skip).limit(limit);

        res.send(users);

    } catch (err) {
        res.status(500).json({ message: err.message });
    }
})

module.exports = userRouter;