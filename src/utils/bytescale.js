const Bytescale = require('@bytescale/sdk');
const nodeFetch = require('node-fetch');
const streamifier = require('streamifier');

// Initialize upload manager
const uploadManager = new Bytescale.UploadManager({
  fetchApi: nodeFetch,
  apiKey: process.env.BYTESCALE_API_KEY || 'free'
});

const fileApi = new Bytescale.FileApi({
  fetchApi: nodeFetch,
  apiKey: process.env.BYTESCALE_API_KEY || 'free'
});

/**
 * Upload buffer to Bytescale
 * @param {Buffer} buffer - File buffer
 * @param {string} originalFileName - Original file name
 * @param {string} mimeType - MIME type
 * @returns {Promise<Object>} Upload result { fileUrl, filePath }
 */
const uploadToBytescale = async (buffer, originalFileName, mimeType) => {
  try {
    // Create a read stream from the buffer for better handling of large files
    const stream = streamifier.createReadStream(buffer);

    const result = await uploadManager.upload({
      data: stream,
      mime: mimeType,
      originalFileName: originalFileName,
      size: buffer.length, // Required when using stream
      maxConcurrentUploadParts: 2 // Reduced concurrency to prevent socket hangup
    });
    
    console.log('✅ File uploaded to Bytescale:', result.fileUrl);
    return {
      fileUrl: result.fileUrl,
      filePath: result.filePath
    };
  } catch (error) {
    console.error('❌ Bytescale upload error:', error);
    throw new Error(`Bytescale upload failed: ${error.message}`);
  }
};

/**
 * Delete file from Bytescale
 * @param {string} filePath - Path of the file to delete
 * @returns {Promise<void>}
 */
const deleteFromBytescale = async (filePath) => {
  try {
    // If using 'free' key, we can't delete, so just log it
    if ((process.env.BYTESCALE_API_KEY || 'free') === 'free') {
      console.log('⚠️ Skipping Bytescale deletion (free API key):', filePath);
      return;
    }

    const accountId = process.env.BYTESCALE_ACCOUNT_ID || 'W23MTVQ';

    await fileApi.deleteFile({
      accountId: accountId,
      filePath: filePath
    });
    
    console.log('🗑️ File deleted from Bytescale:', filePath);
  } catch (error) {
    console.error('❌ Bytescale deletion error:', error);
  }
};

module.exports = {
  uploadToBytescale,
  deleteFromBytescale
};
