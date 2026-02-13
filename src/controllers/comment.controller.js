import mongoose, { isValidObjectId } from "mongoose"
import {Comment} from "../models/comment.models.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"

const getVideoComments = asyncHandler(async (req, res) => {
    const {videoId} = req.params
    const {page = 1, limit = 10} = req.query
    if(!isValidObjectId(videoId)) {
        throw new ApiError(400, "invalid videoId for comment");
    }

    const skip = (Number(page)-1)*Number(limit);

    const comments = await Comment.aggregate([
        {
            $match: {
                video: new mongoose.Types.ObjectId(videoId)
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
                            username: 1,
                            fullname: 1,
                            avatar: 1
                        }
                    }
                ]

            }
        },
        {
            $addFields: {
                owner: {$first: "$owner"}
            }
        },
        {
            $project: {
                content: 1,
                owner: 1,
                createdAt: 1
            }
        },
        { $sort: {createdAt: -1}},
        {$skip: skip},
        {$limit: Number(limit)}
    ]);

    const totalcounts = await Comment.countDocuments({video: videoId});

    return res
    .status(200)
    .json(new ApiResponse(200,{
        comments,
        page: Number(page),
        limit: Number(limit),
        totalcounts,
        totalpage: Math.ceil(totalcounts/limit)
    },"Video comments fetched successfully"))

})

const addComment = asyncHandler(async (req, res) => {
    const {videoId} = req.params
    const {content} = req.body
    if(!isValidObjectId(videoId)) {
        throw new ApiError(400, "invalid videoId for addComment");
    }
    if(!content || !content.trim()){
        throw new ApiError(400, "Content cannot be empty")
    }
    
    const comment = await Comment.create({
        content,
        video: videoId,
        owner: req.user._id
    })

    

    return res
    .status(200)
    .json( new ApiResponse(200, comment, "Comment added successfully"))
})

const updateComment = asyncHandler(async (req, res) => {
    const {commentId} = req.params
    const {content} = req.body
    if(!isValidObjectId(commentId)) {
        throw new ApiError(400, "invalid commentId")
    }
    if(!content || !content.trim()) {
        throw new ApiError(400, "content should not be empty")
    }
    
    const newComment = await Comment.findOneAndUpdate(
        {
            _id: commentId,
            owner: req.user._id
        },
        {
            $set: {
                content
            }
        },
        {new: true}
    )

    if(!newComment) {
        throw new ApiError(404, "comment not updated")
    }

    return res
    .status(200)
    .json( new ApiResponse(200, newComment, "comment updated successfully"))

})

const deleteComment = asyncHandler(async (req, res) => {
    const {commentId} = req.params

    if(!isValidObjectId(commentId)) {
        throw new ApiError(400, "invalid commentId")
    }

    const deletedcomment = await Comment.findOneAndDelete({
            _id: commentId,
            owner: req.user._id
    })
    
    if (!deletedcomment) {
        throw new ApiError(403, "comment not found or not authorized");
    }

    return res
    .status(200)
    .json(new ApiResponse(200, deletedcomment, "Comment deleted successfully"))

})

export {
    getVideoComments, 
    addComment, 
    updateComment,
    deleteComment
}