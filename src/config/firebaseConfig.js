const admin = require('firebase-admin');
const path = require('path');

// Đảm bảo bạn cung cấp đúng đường dẫn tới tệp JSON của tài khoản dịch vụ Firebase
const serviceAccount = path.join(__dirname, 'movieticket-77cf5-0ca8a30e8f80.json');

// Khởi tạo Firebase Admin SDK với chứng thực từ tệp JSON
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  storageBucket: 'gs://movieticket-77cf5.appspot.com',  // Đảm bảo tên bucket chính xác
});

const bucket = admin.storage().bucket();

module.exports = { bucket };  // Xuất đối tượng bucket