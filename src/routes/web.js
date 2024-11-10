const express = require('express');
const multer = require('multer');
const path = require('path');
  // Cấu hình multer để lưu trữ file
  const storage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, 'uploads/'); // Thư mục lưu trữ file
    },
    filename: function (req, file, cb) {
      cb(null, Date.now() + path.extname(file.originalname)); // Đặt tên file theo thời gian hiện tại
    }
  }); 
  const upload = multer({ storage: storage });

const { getHomepage, 
    findByViewID,
    sendEmail,
    createAccount,
    getConversations,
    getMoviesDangChieu,
    getMoviesSapChieu, 
    getUserListForAdmin,
    findByViewMovieID,
    addFavourire,
    removeFavourire,
    getAllUserData,
    getShowtime,
    getChair,
    insertBuyTicket,
    getShowtimeListForAdmin,
    uploadImage,
    createFilm,
    createShifts,
    getAllListShift,
  getAllListLocation,
  createLocation,
  createWorkSchedules,
  getAllWorkSchedulesByID,
  getShiftForAttendance,
  getAllIsCombo,
  getAllIsNotCombo,
  updateShifts,
  removeShifts,
  updateLocationShifts,
  removeLocationShifts,
  checkUsername,
  updateWorkSchedules,
  findByViewIDUser,
  createMomoPayment, 
  momoCallback,
  checkTransactionStatus,

 } = require('../controllers/homeController');
const route = express.Router();
// khai báo route
route.get('/', getHomepage);
route.get('/getMoviesDangChieu', getMoviesDangChieu); // get danh sách nhắn tin
route.get('/getMoviesSapChieu', getMoviesSapChieu); // get danh sách nhắn tin
route.get('/getShowtimeListForAdmin', getShowtimeListForAdmin); // get danh sách nhắn tin
route.get('/getUserListForAdmin', getUserListForAdmin); //  get danh sách user
route.get('/getAllListShift', getAllListShift); //  get danh sách user
route.get('/getAllListLocation', getAllListLocation); //  get danh sách user
route.get('/getAllIsCombo', getAllIsCombo); //  get danh sách iscombo
route.get('/getAllIsNotCombo', getAllIsNotCombo); //  get danh sách isnotcombo


// ------- mdethod post ----------------
route.post('/findByViewID', findByViewID); // Thêm route cho findByViewID
route.post('/sendEmail', sendEmail); // Thêm route cho sendEmail
route.post('/createAccount', createAccount); // Thêm route cho sendEmail
route.post('/getConversations', getConversations); // get danh sách nhắn tin
route.post('/findByViewMovieID', findByViewMovieID); // tìm kiếm bằng id phim
route.post('/addFavourire', addFavourire); // thêm yêu thích
route.post('/removeFavourire', removeFavourire); // thêm yêu thích
route.post('/getAllUserData', getAllUserData); // thêm yêu thích
route.post('/getShowtime', getShowtime); // thêm yêu thích
route.post('/getChair', getChair); // lấy list ghế
route.post('/insertBuyTicket', insertBuyTicket); // lấy list ghế
route.post('/uploadImage', upload.single('image'), uploadImage);
route.post('/createFilm', createFilm); // Thêm film
route.post('/createShifts', createShifts); // Thêm film
route.post('/createLocation', createLocation); // Thêm film
route.post('/createWorkSchedules', createWorkSchedules); // Thêm film
route.post('/getAllWorkSchedulesByID', getAllWorkSchedulesByID); // Thêm film
route.post('/getShiftForAttendance', getShiftForAttendance); // Thêm film
route.post('/updateShifts', updateShifts); // update ca làm.
route.post('/removeShifts', removeShifts); // xóa ca làm.
route.post('/updateLocationShifts', updateLocationShifts); // update ví trí
route.post('/removeLocationShifts', removeLocationShifts); // xóa vị trí
route.post('/checkUsername', checkUsername); // Kiểm tra trùng username hay không
route.post('/updateWorkSchedules', updateWorkSchedules); // Kiểm tra trùng username hay không
route.post('/findByViewIDUser', findByViewIDUser); // 
route.post('/create-momo-payment', createMomoPayment);
route.get('/momo-callback', momoCallback);
route.get("/check-transaction-status", checkTransactionStatus);

module.exports=route;