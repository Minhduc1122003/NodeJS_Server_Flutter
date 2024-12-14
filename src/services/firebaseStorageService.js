const { bucket } = require('./firebaseConfig');
const { v4: uuidv4 } = require('uuid');
const path = require('path');

class FirebaseStorageService {
  /**
   * Upload a file to Firebase Storage
   * @param {Object} file - Multer file object
   * @returns {Promise<string>} - Public URL of the uploaded file
   */
  async uploadFile(file) {
    if (!file) {
      throw new Error('No file uploaded');
    }

    // Generate a unique filename
    const fileName = `${uuidv4()}-${file.originalname}`;
    
    // Create a blob in the bucket
    const blob = bucket.file(fileName);
    
    // Create a write stream
    const blobStream = blob.createWriteStream({
      metadata: {
        contentType: file.mimetype
      }
    });

    return new Promise((resolve, reject) => {
      blobStream.on('error', (err) => {
        reject(err);
      });

      blobStream.on('finish', () => {
        // Make the file public
        blob.makePublic()
          .then(() => {
            // Construct the public URL
            const publicUrl = `https://storage.googleapis.com/${bucket.name}/${fileName}`;
            resolve(publicUrl);
          })
          .catch(reject);
      });

      // End the stream with the file buffer
      blobStream.end(file.buffer);
    });
  }
}

module.exports = new FirebaseStorageService();