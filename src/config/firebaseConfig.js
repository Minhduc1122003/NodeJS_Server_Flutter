const admin = require('firebase-admin');
const path = require('path');

// Đường dẫn tới file serviceAccountKey.json
const serviceAccountPath = path.resolve(__dirname, 'movieticket-77cf5-firebase-adminsdk-aiuuk-150c268890.json');

// Khởi tạo Firebase Admin SDK
admin.initializeApp({
  credential: admin.credential.cert(require(serviceAccountPath)),
  storageBucket: 'movieticket-77cf5.appspot.com',
});

const bucket = admin.storage().bucket();

module.exports = bucket;
