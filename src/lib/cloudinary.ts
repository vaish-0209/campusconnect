import { v2 as cloudinary } from 'cloudinary';

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export default cloudinary;

/**
 * Upload a file to Cloudinary
 * @param file - File buffer or base64 string
 * @param folder - Cloudinary folder path (e.g., 'resumes', 'profile_photos', 'company_logos')
 * @param publicId - Optional custom public ID for the file
 * @returns Cloudinary upload result with secure_url
 */
export async function uploadToCloudinary(
  file: Buffer | string,
  folder: string,
  publicId?: string
) {
  return new Promise((resolve, reject) => {
    const uploadOptions: any = {
      folder: `college_placement/${folder}`,
      resource_type: 'auto',
    };

    if (publicId) {
      uploadOptions.public_id = publicId;
    }

    const uploadStream = cloudinary.uploader.upload_stream(
      uploadOptions,
      (error, result) => {
        if (error) reject(error);
        else resolve(result);
      }
    );

    if (Buffer.isBuffer(file)) {
      uploadStream.end(file);
    } else {
      // Base64 string
      cloudinary.uploader.upload(file, uploadOptions, (error, result) => {
        if (error) reject(error);
        else resolve(result);
      });
    }
  });
}

/**
 * Delete a file from Cloudinary
 * @param publicId - The public ID of the file to delete
 * @param resourceType - Type of resource ('image', 'raw', 'video')
 */
export async function deleteFromCloudinary(
  publicId: string,
  resourceType: 'image' | 'raw' | 'video' = 'image'
) {
  try {
    const result = await cloudinary.uploader.destroy(publicId, {
      resource_type: resourceType,
    });
    return result;
  } catch (error) {
    console.error('Error deleting from Cloudinary:', error);
    throw error;
  }
}
