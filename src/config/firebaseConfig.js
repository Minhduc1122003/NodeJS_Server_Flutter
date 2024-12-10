const admin = require('firebase-admin');
const path = require('path');

// Đường dẫn tới file serviceAccountKey.json
const serviceAccountPath = path.resolve(__dirname, 'movieticket-77cf5-firebase-adminsdk-aiuuk-3d2fb82b3c.json');

// Kiểm tra xem Firebase Admin SDK đã được khởi tạo chưa
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(require(serviceAccountPath)),
    storageBucket: 'movieticket-77cf5.appspot.com',
  });
} else {
  console.log('Firebase Admin SDK đã được khởi tạo rồi.');
}

const bucket = admin.storage().bucket();

module.exports = bucket;
