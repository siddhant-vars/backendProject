import mongoose from "mongoose"
import {Video} from "../models/video.model.js"
import {Subscription} from "../models/subscription.model.js"
import {Like} from "../models/like.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"

const getChannelStats = asyncHandler(async (req, res) => {
    const channelId = req.user._id

    const totalvideos = await Video.aggregate([
        {
            $match: {
                owner: new mongoose.Types.ObjectId(channelId)
            }
        },
        {
            $group: {
                _id: null,
                totalvideos: { $sum: 1},
                totalviews: { $sum: "$views" }
            }
        }
    ])

    const totalSubscribers = await Subscription.countDocuments({channel: channelId})

    const totallikes = await Like.aggregate([
        {
            $lookup: {
                from: "videos",
                localField: "video",
                foreignField: "_id",
                as: "video"
            }
        },
        { $unwind: "$video"},
        {
            $match: {
                "video.owner": new mongoose.Types.ObjectId(channelId) 
            }
        },
        {
            $count: "totallikes"
        }
    ])

    return res
    .status(200)
    .json( new ApiResponse(200, {
        totalVideos: totalvideos[0]?.totalvideos || 0,
        totalSubscribers: totalSubscribers[0]?.totalSubscribers || 0,
        totallikes: totallikes[0]?.totallikes || 0
    }, "dashboard fetch successfully"))
})

const getChannelVideos = asyncHandler(async (req, res) => {
    const channelId = req.user._id
    const allvideos = await Video.find({
        owner: channelId
    }).sort({createdAt: -1})

    if(!allvideos) {
        throw new ApiError(400, "videos not fetched")
    }

    return res
    .status(200)
    .json( new ApiResponse(200, allvideos, "videos fetched successfully"))
})

export {
    getChannelStats, 
    getChannelVideos
    }