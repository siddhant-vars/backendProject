import mongoose, {isValidObjectId} from "mongoose"
import {Video} from "../models/video.models.js"
import {User} from "../models/user.models.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"
import {uploadOnCloudinary} from "../utils/cloudinary.js"

const getAllVideos = asyncHandler(async (req, res) => {
    let { page = 1, limit = 10, query = "", sortBy = "createdAt", sortType = "desc", userId } = req.query;

    page = parseInt(page);
    limit = parseInt(limit);

    // Build match stage
    const match = {};

    // Search by text (title + description)
    if (query) {
        match.$or = [
            { title: { $regex: query, $options: "i" } },
            { description: { $regex: query, $options: "i" } }
        ];
    }

    // Filter by owner
    if (userId && mongoose.isValidObjectId(userId)) {
        match.owner = new mongoose.Types.ObjectId(userId);
    }

    // Only published videos
    match.isPublished = true;

    // Sorting object
    const sort = {};
    sort[sortBy] = sortType === "asc" ? 1 : -1;

    const aggregate = Video.aggregate([
        { $match: match },
        { $sort: sort }
    ]);

    const videos = await Video.aggregatePaginate(aggregate, {
        page,
        limit
    });

    return res
        .status(200)
        .json(new ApiResponse(200, videos, "Videos fetched successfully"));
});

const publishAVideo = asyncHandler(async (req, res) => {
    const { title, description} = req.body
    // TODO: get video, upload to cloudinary, create video
    // 1. Get video details from frontend (title, description, files)
    // 2. Validate title & description - check not empty
    // 3. Validate files - check videoFile and thumbnail exist
    // 4. Upload videoFile to Cloudinary
    // 5. Upload thumbnail to Cloudinary
    // 6. Get video duration (from Cloudinary response or ffprobe if needed)
    // 7. Create video object in DB
    // 8. Check if video entry is created successfully
    // 9. Return success response with video data
    const videoLocalPath = req.files?.videoFile[0]?.path;
    const thumbnailLocalPath = req.files?.thumbnail[0]?.path;
    if(!title || !description){
        throw new ApiError(400,"title or description is required")
    }
    if(!videoLocalPath){
        throw new ApiError(400, "video file is necessary")
    }
    if(!thumbnailLocalPath){
        throw new ApiError(400, "thumbnail is necessary")
    }
    const videoFile = await uploadOnCloudinary(videoLocalPath)
    const thumbnail = await uploadOnCloudinary(thumbnailLocalPath)

    const video = await Video.create({
        videoFile: videoFile.secure_url,
        thumbnail: thumbnail.secure_url,
        title,
        description,
        owner: req.user._id,
        duration: videoFile.duration
        
    })

    const createdVideo = await Video.findById(video._id);
    if(!createdVideo) {
        throw new ApiError(500, "Something wrong happen while uploading video on db")
    }
    return res
    .status(201)
    .json(
        new ApiResponse(200, createdVideo," Video uploaded successfully")
    )
})

const getVideoById = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    //TODO: get video by id

    if (!mongoose.isValidObjectId(videoId)) {
        throw new ApiError(400, "Invalid video ID");
    }

    const video = await Video.findById(videoId)
    return res
    .status(201)
    .json( new ApiResponse(200, video,"video for id fetched successfully"))
})

const updateVideo = asyncHandler( async (req, res) => {
    const { videoId } = req.params

    if (!mongoose.isValidObjectId(videoId)) {
        throw new ApiError(400, "Invalid video ID");
    }

    const { title, description } = req.body
    if(!title || !description){
        throw new ApiError(400, "title and description are required for update")
    }
    const thumbnailLocalPath = req.file?.path;
    if(!thumbnailLocalPath){
        throw new ApiError(400, "thumbnail is required ")
    }
    const thumbnail = await uploadOnCloudinary(thumbnailLocalPath)
    if(!thumbnail){
        throw new ApiError(400, "error on uploading thumnail on cloudinary")
    }

    const oldvideo = await Video.findById(videoId)
    if(!oldvideo){
        throw new ApiError(400, "oldVideo doesn't exist ")
    }

    if (oldvideo.owner.toString() !== req.user._id.toString()) {
        throw new ApiError(403, "You cannot update another user's video");
    }

    const video = await Video.findByIdAndUpdate(
        videoId,
        {
            $set: {
                title,
                description,
                thumbnail: thumbnail?.url
            }
        },
        { new: true }
    )

    return res
    .status(201)
    .json(new ApiResponse(200, video, "video updated successfully"))
})

const deleteVideo = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    //TODO: delete video

    if (!mongoose.isValidObjectId(videoId)) {
        throw new ApiError(400, "Invalid video ID");
    }

    const oldvideo = await Video.findById(videoId)
    if(!oldvideo){
        throw new ApiError(400, "oldVideo doesn't exist ")
    }

    if (oldvideo.owner.toString() !== req.user._id.toString()) {
        throw new ApiError(403, "You cannot update another user's video");
    }    

    const video = await Video.findByIdAndDelete(videoId)
    return res
    .status(201)
    .json( new ApiResponse(200, video,"Video deleted successfully"))
})

const togglePublishStatus = asyncHandler(async (req, res) => {
    const { videoId } = req.params;

    // 1. Validate video ID
    if (!mongoose.isValidObjectId(videoId)) {
        throw new ApiError(400, "Invalid video ID");
    }

    // 2. Find the video
    const video = await Video.findById(videoId);
    if (!video) {
        throw new ApiError(404, "Video not found");
    }

    // 3. (Recommended) Check if logged-in user owns the video
    // requires verifyJWT in route
    if (video.owner.toString() !== req.user._id.toString()) {
        throw new ApiError(403, "You cannot update another user's video");
    }

    // 4. Toggle publish status
    video.isPublished = !video.isPublished;

    await video.save();

    return res
        .status(200)
        .json(
            new ApiResponse(
                200,
                video,
                `Video is now ${video.isPublished ? "Published" : "Unpublished"}`
            )
        );
});


export {
    getAllVideos,
    publishAVideo,
    getVideoById,
    updateVideo,
    deleteVideo,
    togglePublishStatus
}