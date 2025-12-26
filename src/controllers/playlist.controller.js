import mongoose, {isValidObjectId} from "mongoose"
import {Playlist} from "../models/playlist.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"
import { Video } from "../models/video.models.js"

const createPlaylist = asyncHandler(async (req, res) => {
    const {name, description} = req.body

    if (!name || !description) {
        throw new ApiError(400, "name or description required")
    }

    const { videoIds } = req.body
    
    if(!mongoose.isValidObjectId(videoIds)) {
        throw new ApiError(400, "invalid video id ")
    }

    const validvideo = await Video.find({
        _id: {$in: videoIds},
        owner: req.user._id
    }).select("id")

    if(validvideo.length == 0) {
        throw new ApiError(401, "user has not created any videos")
    }

    const validvideoIds = validvideo.map(v => v._id)

    const playlist = await Playlist.create({
        name,
        description,
        videos: validvideoIds,
        owner: req.user._id
    })

    if(!playlist) {
        throw new ApiError(500, "Something went wrong while registering playlist on mongoDb")
    }

    return res
    .status(201)
    .json(
        new ApiResponse(201, playlist, "playlist created successfully")
    )

})

const getUserPlaylists = asyncHandler(async (req, res) => {
    const {userId} = req.params
    if(!mongoose.isValidObjectId(userId)) {
        throw new ApiError(400, "invalid object id")
    }

    const userPlaylist = await Playlist.aggregate([
        {
            $match: {
                owner: new mongoose.Types.ObjectId(userId)
            }
        },
        {
            $lookup: {
                from : "users",
                localField: "owner",
                foreignField: "_id",
                as: "userPlaylist",
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
                owner: {$first: "$userPlaylist"}
            }
        },
        {
            $project: {
                userPlaylist: 0
            }
        }
    ])

    if(userPlaylist.length === 0) {
        throw new ApiError(404,"playlist of user doesn't exist")
    }

    return res
    .status(200)
    .json( new ApiResponse(200,userPlaylist,"playlist for particular user fetched successfully"))
    //TODO: get user playlists
})

const getPlaylistById = asyncHandler(async (req, res) => {
    const {playlistId} = req.params
    //TODO: get playlist by id
    if(!isValidObjectId(id)) {
        throw new ApiError(400, "invalidid for getting playlist")
    }

    const playlist = Playlist.findById(playlistId)

    return res
    .status(201)
    .json( new ApiResponse(201, playlist, "playlist got successfully"))
})

const addVideoToPlaylist = asyncHandler(async (req, res) => {
    const {playlistId, videoId} = req.params
    
    if(!isValidObjectId(playlistId)) {
        throw new ApiError(400, "invalid playlistID for adding video")
    }

    if(!isValidObjectId(videoId)) {
        throw new ApiError(400, "invalid videoId for adding")
    }

    const updatedPlaylist = await Playlist.findByIdAndUpdate(
        playlistId,
        {
            $addToSet: { videos: videoId}
        },
        {new: true}
    )

    if (!updatedPlaylist) {
        throw new ApiError(404, "Playlist not found");
    }

    return res
    .status(200)
    .json( new ApiResponse(200, updatedPlaylist, "video added to playlist successfully"))

})

const removeVideoFromPlaylist = asyncHandler(async (req, res) => {
    const {playlistId, videoId} = req.params
    if(!isValidObjectId(playlistId)) {
        throw new ApiError(400, "invalid playlistID for removing")
    }

    if(!isValidObjectId(videoId)) {
        throw new ApiError(400, "invalid videoId for removing")
    }

    const updatedPlaylist = await Playlist.findByIdAndUpdate(
        playlistId,
        {
            $pull: { videos: videoId}
        },
        {new: true}
    )

    if (!updatedPlaylist) {
        throw new ApiError(404, "Playlist not found");
    }

    return res
    .status(200)
    .json( new ApiResponse(200, updatedPlaylist, "video removed from playlist successfully"))

})

const deletePlaylist = asyncHandler(async (req, res) => {
    const {playlistId} = req.params

    if(!isValidObjectId(playlistId)) {
        throw new ApiError(400, "invalid playlistID for deleting");
    }

    const playlist = await Playlist.findOneAndDelete({
        _id: playlistId,
        owner: req.user._id
    })

    if (!playlist) {
        throw new ApiError(403, "playlist not found or not authorized");
    }

    return res
    .status(200)
    .json( new ApiResponse(200, playlist, "playlist deleted successfully!"))
    
    
})

const updatePlaylist = asyncHandler(async (req, res) => {
    const {playlistId} = req.params
    const {name, description} = req.body
    if(!isValidObjectId(playlistId)) {
        throw new ApiError(400, "invalid playlistId for updating playlist")
    }

    if(!name || !description) {
        throw new ApiError(400, "name or description are required")
    }

    const updatedPlaylist = await Playlist.findOneAndUpdate(
        {
            _id: playlistId,
            owner: req.user._id,
        },
        {
            $set: {
                name,
                description
            }
        },
        {new : true}
    )

    if(!updatedPlaylist) {
        throw new ApiError(404, "playlist not updated")
    }

    return res
    .status(200)
    .json( new ApiResponse(200, updatedPlaylist, "name or description updated successfully"))

})

export default {
    createPlaylist,
    getUserPlaylists,
    getPlaylistById,
    addVideoToPlaylist,
    removeVideoFromPlaylist,
    deletePlaylist,

}