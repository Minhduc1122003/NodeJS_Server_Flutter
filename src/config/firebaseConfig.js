const admin = require('firebase-admin');
const path = require('path');

// Đường dẫn tới file serviceAccountKey.json
const serviceAccountPath = path.join(__dirname, 'movieticket-77cf5-firebase-adminsdk-aiuuk-fb4487a36a.json');

// Khởi tạo Firebase Admin SDK
admin.initializeApp({
  credential: admin.credential.cert(require(serviceAccountPath)),
  storageBucket: 'movieticket-77cf5.appspot.com' // Bucket của bạn
});

const bucket = admin.storage().bucket();

module.exports = bucket;
