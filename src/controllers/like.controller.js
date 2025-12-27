import mongoose, {isValidObjectId} from "mongoose"
import {Like} from "../models/like.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"

const toggleVideoLike = asyncHandler(async (req, res) => {
    const {videoId} = req.params
    if (!mongoose.isValidObjectId(videoId)) {
        throw new ApiError(400, "Invalid video ID");
    }
    const existingLikedVideo = await Like.findOne({
        likedBy: req.user._id,
        video: videoId
    })
    if(existingLikedVideo) {
        const deletedlike = await Like.findByIdAndDelete(existingLikedVideo._id)
        return res.status(200).json(new ApiResponse(200, deletedlike, "video unliked successfully"))
    }

    const likedVideo = await Like.create({
        video: videoId,
        likedBy: req.user._id
    })

    if(!likedVideo) {
        throw new ApiError(400, "video is not liked successfully")
    }

    return res
    .status(201)
    .json( new ApiResponse(201, likedVideo, "video liked successfully"))
})

const toggleCommentLike = asyncHandler(async (req, res) => {
    const {commentId} = req.params
    if (!mongoose.isValidObjectId(commentId)) {
        throw new ApiError(400, "Invalid video ID");
    }
    const existingLikedComment = await Like.findOne({
        likedBy: req.user._id,
        comment: commentId
    })
    if(existingLikedComment) {
        const deletedcomment = await Like.findByIdAndDelete(existingLikedComment._id)
        return res.status(200).json(new ApiResponse(200, deletedcomment, "comment unliked successfully"))
    }

    const likedComment = await Like.create({
        comment: commentId,
        likedBy: req.user._id
    })

    if(!likedComment) {
        throw new ApiError(400, "Comment is not liked successfully")
    }

    return res
    .status(201)
    .json( new ApiResponse(201, likedComment, "video liked successfully"))

})

const toggleTweetLike = asyncHandler(async (req, res) => {
    const {tweetId} = req.params
    if (!mongoose.isValidObjectId(tweetId)) {
        throw new ApiError(400, "Invalid tweet ID");
    }
    const existingLikedtweet = await Like.findOne({
        likedBy: req.user._id,
        tweet: tweetId
    })
    if(existingLikedtweet) {
        const deletedtweet = await Like.findByIdAndDelete(existingLikedtweet._id)
        return res.status(200).json(new ApiResponse(200, deletedtweet, "video unliked successfully"))
    }

    const likedtweet = await Like.create({
        tweet: tweetId,
        likedBy: req.user._id
    })

    if(!likedtweet) {
        throw new ApiError(400, "tweet is not liked successfully")
    }

    return res
    .status(201)
    .json( new ApiResponse(201, likedtweet, "tweet liked successfully"))
}
)

const getLikedVideos = asyncHandler(async (req, res) => {
    const likedVideos = await Like.find({
        likedBy: req.user._id
    }).populate("video")

    return res.status(200).json(
        new ApiResponse(200, likedVideos, "Liked videos fetched successfully")
    )
})


export {
    toggleCommentLike,
    toggleTweetLike,
    toggleVideoLike,
    getLikedVideos
}