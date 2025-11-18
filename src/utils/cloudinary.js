// Here we are transferring file from our server where file is temporarily stored and move to cloudinary server through multer and deleting temporary file 
import { v2 as cloudinary} from "cloudinary";
import fs from "fs" // help in reading writing file asynchronously aur synchronously


cloudinary.config({ 
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME, 
  api_key: process.env.CLOUDINARY_API_KEY, 
  api_secret: process.env.CLOUDINARY_API_SECRET
});

const uploadOnCloudinary = async (localFilePath) => {
    try {
        if (!localFilePath) return null
        const response = await cloudinary.uploader.upload(localFilePath, {
            resource_type: "auto"
        })
        // file has been successfully uploaded on cloudinary
        //console.log("file is uploaded on cloudinary ", response.url);
        fs.unlinkSync(localFilePath)
        //console.log("response", response)
        return response
    } catch (error) {
        //fs.unlinkSync(localFilePath) // remove the locally saved file as the upload operation got failed
        return null
    }
}

export {uploadOnCloudinary}
