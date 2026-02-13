import mongoose, {isValidObjectId} from "mongoose"
import {User} from "../models/user.models.js"
import { Subscription } from "../models/subscription.models.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"


const toggleSubscription = asyncHandler(async (req, res) => {
    const {channelId} = req.params
    // TODO: toggle subscription
    if (!mongoose.isValidObjectId(channelId)) {
        throw new ApiError(400, "Invalid Channel Id")
    }
    
    const channel = await User.findById(channelId)
    if(!channel) {
        throw new ApiError(404, "Channel doesn't exist for this id")
    }

    if (req.user._id.toString() === channelId) {
        throw new ApiError(400, "You cannot subscribe to yourself")
    }


    const existingUser = await Subscription.findOne({
        subscriber: req.user._id,
        channel: channelId
    })
    if(existingUser) {
        const deletingexistingUser = await Subscription.findByIdAndDelete(existingUser._id)
        return res.status(200).json( new ApiResponse(200,deletingexistingUser, "Unsubscribed successfully"))
    }

    const subscribingUser = await Subscription.create({
        subscriber: req.user._id,
        channel: channelId
    })

    if(!subscribingUser) {
        throw new ApiError(400, "problem on registering subscription in database")
    }

    return res
    .status(200)
    .json( new ApiResponse(200, subscribingUser, "subscribed successfully") )

})



// controller to return subscriber list of a channel
const getUserChannelSubscribers = asyncHandler(async (req, res) => {
    const {channelId} = req.params

    if (!mongoose.isValidObjectId(channelId)) {
        throw new ApiError(400, "Invalid Channel Id")
    }

    const channelSubscribers = await Subscription.aggregate([
        {
            $match: {
                channel: mongoose.Types.ObjectId(channelId)
            }
        },
        {
            $lookup: {
                from: "users",
                localField: "subscriber",
                foreignField: "_id",
                as: "SubscribersDetails"
            }
        },
        {
            $unwind: "$SubscribersDetails"
        }
    ])
    if(channelSubscribers.length === 0) {
        throw new ApiError(404, "No subscribers found for this channel")
    }

    return res
    .status(200)
    .json( new ApiResponse(200, channelSubscribers, "subscribers list fetched successfully"))
})

// controller to return channel list to which user has subscribed
const getSubscribedChannels = asyncHandler(async (req, res) => {
    const { subscriberId } = req.params
    if (!mongoose.isValidObjectId(subscriberId)) {
        throw new ApiError(400, "Invalid subscriber Id")
    }

    const channelList = await Subscription.aggregate([
        {
            $match: {
                subscriber: mongoose.Types.ObjectId(subscriberId)
            }
        },
        {
            $lookup: {
                from: "users",
                localField: "channel",
                foreignField: "_id",
                as : "channeldetails"
            }
        },
        {
            $unwind: "$channeldetails"
        }
    ])
    if(channelList.length === 0) {
        throw new ApiError(404, "No channels found for this subscriber")
    }

    return res
    .status(200)
    .json( new ApiResponse(200, channelList, "channels list fetched successfully"))
})

export {
    toggleSubscription,
    getUserChannelSubscribers,
    getSubscribedChannels
}