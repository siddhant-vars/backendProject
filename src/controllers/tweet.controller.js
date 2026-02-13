import mongoose, { isValidObjectId } from "mongoose"
import {Tweet} from "../models/tweet.model.js"
import {User} from "../models/user.models.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"
import { timeStamp } from "console"

const createTweet = asyncHandler(async (req, res) => {
    //TODO: create tweet
    const {content} = req.body;
    if(!content.trim()) {
        throw new ApiError(400, "tweet cannot be empty!")
    }
    const tweet = await Tweet.create({
        content,
        owner: req.user._id
    })
    
    return res
    .status(201)
    .json( new ApiResponse(201, tweet, "tweet has been created successfully"))

},{timeStamp: true})

const getUserTweets = asyncHandler(async (req, res) => {
    // TODO: get user tweets
    const { userId } = req.params

    const tweet = await Tweet.aggregate([
        {
            $match: {
                owner: new mongoose.Types.ObjectId(userId)
            }
        },
        {
            $lookup: {
                from: "users",
                localField: "owner",
                foreignField: "_id",
                as: "owner",
                pipeline: [
                    {
                        $project: {
                            fullname: 1,
                            username: 1,
                            avatar: 1
                        }
                    }
                ]
            }
        },

        {
            $addFields: {
                owner: { $first: "$owner"}
            }
        }
    ])
    if(tweet.length === 0) {
        throw new ApiError(404,"tweet doesn't exist")
    }

    return res
    .status(200)
    .json( new ApiResponse(200,tweet,"tweet for particular user fetched successfully"))
})

const updateTweet = asyncHandler(async (req, res) => {
    //TODO: update tweet
    const { tweetId } = req.params
    const { content } = req.body

    if(!mongoose.isValidObjectId(tweetId)) {
        throw new ApiError(400, "tweetId is not a valid Id")
    }

    if (!content?.trim()) {
    throw new ApiError(400, "content is required")
    }


    const oldtweet = await Tweet.findById(tweetId)
    if (!oldtweet) {
    throw new ApiError(404, "Tweet not found")
    }

    if(oldtweet.owner.toString() !== req.user._id.toString()) {
        throw new ApiError(400, "you can not update another user tweet")
    }


    const tweet = await Tweet.findByIdAndUpdate(
        tweetId,
        {
            $set: {
                content
            }
        },
        { new: true }
    )
    return res
    .status(200)
    .json( new ApiResponse( 200, tweet, "tweet updated successfully"))
})

const deleteTweet = asyncHandler(async (req, res) => {
    //TODO: delete tweet
    const { tweetId } = req.params

    if(!mongoose.isValidObjectId(tweetId)) {
        throw new ApiError(400, "tweetId is not a valid Id")
    }

    const oldtweet = await Tweet.findById(tweetId)
    if (!oldtweet) {
    throw new ApiError(404, "Tweet not found")
    }

    if(oldtweet.owner.toString() !== req.user._id.toString()) {
        throw new ApiError(400, "you can not update another user tweet")
    }

    const tweet = await Tweet.findByIdAndDelete(tweetId)

    return res
    .status(200)
    .json( new ApiResponse(200, tweet, "tweet deleted successfully"))

})

export { 
    createTweet,
    getUserTweets,
    updateTweet,
    deleteTweet
}