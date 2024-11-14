const mongoose = require("mongoose");


const connectionRequestSchema = new mongoose.Schema(
    {
        fromUserId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
        toUserId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
        status: {
            type: String,
            enum: ["ignored", "interested", "accepted", "rejected"],
            message: `{VALUE} is incorrect status type`
        },
    },
    { timestamps: true }
);

// Compound Index
connectionRequestSchema.index({ fromUserId: 1, toUserId: 1 });

// schema.pre("save") function
connectionRequestSchema.pre("save", function(){
    const connectionRequest = this;
    // check if the fromUserId is same as toUserId
    if(connectionRequest.fromUserId.equals(connectionRequest.toUserId)){
        throw new Error("Cannot send connection request to yourself");
    }
})

const ConnectionRequestModel = new mongoose.model(
    "ConnectionRequest",
    connectionRequestSchema
);

module.exports = ConnectionRequestModel;