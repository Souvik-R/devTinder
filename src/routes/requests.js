const express = require("express");
const requestRouter = express.Router();
const { userAuth } = require("../middlewares/auth");
const ConnectionRequest = require("../models/connectionRequest");
const User = require("../models/user");

requestRouter.post("/request/send/:status/:toUserId", userAuth, async (req, res) => {
    try {
        const fromUserId = req.user._id;
        const toUserId = req.params.toUserId;
        const status = req.params.status;
        const fromUserName = req.user.firstName;

        const allowedStatus = ["ignored", "interested"];
        if(!allowedStatus.includes(status)){
            return res.status(400).json({message: "Invalid status type: " + status});
        }

        const existingConnectionRequest = await ConnectionRequest.findOne({
            $or: [
                {fromUserId, toUserId},
                {fromUserId: toUserId, toUserId: fromUserId}
            ]
        });

        if(existingConnectionRequest){
            return res.status(400).json({message: "Connection request already exist"});
        };

        const toUser = await User.findById(toUserId);
        if (!toUser) {
            return res.status(404).json({ message: "Recipient user not found" });
        }

        const connectionRequest = new ConnectionRequest({
            fromUserId,
            toUserId,
            status
        });

        const data = await connectionRequest.save();

        res.json({
            message: status === "interested"
            ? `${fromUserName} has shown interest in connecting with ${toUser.firstName}.`
            : `${fromUserName} has ignored ${toUser.firstName}.`,
            data
        });

    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

requestRouter.post("/request/review/:status/:requestId", userAuth, async (req, res) => {
    try {
        const loggedInUser = req.user
        const { status, requestId } = req.params;

        const allowedStatus = ["accepted", "rejected"];

        if (!allowedStatus.includes(status)) {
            return res.status(400).json({ message: "Status not found" });
        }

        const connectRequest = await ConnectionRequest.findOne({
            _id: requestId,
            toUserId: loggedInUser._id,
            status: "interested",
        });

        if (!connectRequest) {
            return res.status(404).json({
                message: "Connection request not found"
            });
        }

        connectRequest.status = status;

        const data = connectRequest.save();

        res.json({ message: "Connection request " + status, data })

    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

module.exports = requestRouter;