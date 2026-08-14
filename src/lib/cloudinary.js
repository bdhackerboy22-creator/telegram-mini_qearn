import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
});

/**
 * Upload image to Cloudinary
 * @param {string} fileStr Base64 encoded string or image buffer
 * @param {string} folder Destination folder in Cloudinary
 * @returns {Promise<string>} Secure URL of the uploaded image
 */
export async function uploadToCloudinary(fileStr, folder = "telegram_questions") {
  // If Cloudinary is not configured in .env, fallback gracefully to returning fileStr
  if (!process.env.CLOUDINARY_CLOUD_NAME || !process.env.CLOUDINARY_API_KEY) {
    console.warn("Cloudinary not configured in .env.local. Storing directly.");
    return fileStr;
  }

  try {
    const uploadResponse = await cloudinary.uploader.upload(fileStr, {
      folder,
      resource_type: "image",
      transformation: [
        { quality: "auto:good" }, // Automatic optimization without visible quality loss
        { fetch_format: "auto" },
      ],
    });

    return uploadResponse.secure_url;
  } catch (error) {
    console.error("Cloudinary upload failed:", error);
    // Fallback to original string if upload fails
    return fileStr;
  }
}
