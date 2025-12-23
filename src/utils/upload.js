const cloudinary = require('../config/cloudinary');
const streamifier = require('streamifier');

/**
 * Upload image buffer to Cloudinary
 * @param {Buffer} fileBuffer - Image file buffer
 * @param {string} folder - Cloudinary folder path
 * @param {string} publicId - Optional public ID for the file
 * @returns {Promise<Object>} Cloudinary upload result
 */
const uploadToCloudinary = (fileBuffer, folder = 'generek/avatars', publicId = null) => {
  return new Promise((resolve, reject) => {
    const uploadOptions = {
      folder: folder,
      resource_type: 'auto',
      // Image transformations
      transformation: [
        {
          width: 500,
          height: 500,
          crop: 'fill',
          gravity: 'auto'
        },
        {
          quality: 'auto',
          fetch_format: 'auto'
        }
      ]
    };

    // Add public_id if provided
    if (publicId) {
      uploadOptions.public_id = publicId;
      uploadOptions.overwrite = true;
    }

    const uploadStream = cloudinary.uploader.upload_stream(
      uploadOptions,
      (error, result) => {
        if (error) {
          console.error('Cloudinary upload error:', error);
          reject(error);
        } else {
          console.log('✅ Image uploaded to Cloudinary:', result.secure_url);
          resolve(result);
        }
      }
    );

    streamifier.createReadStream(fileBuffer).pipe(uploadStream);
  });
};

/**
 * Delete image from Cloudinary
 * @param {string} publicId - Public ID of the image to delete
 * @returns {Promise<Object>} Cloudinary deletion result
 */
const deleteFromCloudinary = async (publicId) => {
  try {
    const result = await cloudinary.uploader.destroy(publicId);
    console.log('🗑️ Image deleted from Cloudinary:', publicId);
    return result;
  } catch (error) {
    console.error('Error deleting from Cloudinary:', error);
    throw error;
  }
};

module.exports = {
  uploadToCloudinary,
  deleteFromCloudinary
};
