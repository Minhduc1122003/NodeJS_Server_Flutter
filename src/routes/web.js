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
getFilmFavourire,
findByViewIDUser,
createMomoPayment, 
momoCallback,
checkTransactionStatus,
getActor,
updateSatusBuyTicketInfo,
findAllBuyTicketByUserId,
getTop5RateMovie,
FindOneBuyTicketById,
insertRate,
getOneRate,
getAllRateInfoByMovieID,
checkInBuyTicket,
updateInfoUser,
changePassword,
changePasswordForEmail,
insertMovie,
insertShowTime,
getThongkeNguoiDungMoi,
getThongkeDoanhThu,
deleteOneBuyTicketById,
updateUserStatus,
insertAttendance,
checkAttendance,
checkOutAttendance,

} = require('../controllers/homeController');
const express = require('express');
const multer = require('multer');
const path = require('path');
const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  fileFilter: (req, file, cb) => {
  console.log(file.mimetype);  // In ra kiểu mime của file 
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type'), false);
  }
}

});

const route = express.Router();
// khai báo route
route.post('/uploadImage', upload.single('file'), uploadImage);

route.get('/', getHomepage);
route.get('/getMoviesDangChieu', getMoviesDangChieu); // get danh sách nhắn tin
route.get('/getMoviesSapChieu', getMoviesSapChieu); // get danh sách nhắn tin
route.get('/getShowtimeListForAdmin', getShowtimeListForAdmin); // get danh sách nhắn tin
route.get('/getUserListForAdmin', getUserListForAdmin); //  get danh sách user
route.get('/getAllListShift', getAllListShift); //  get danh sách user
route.get('/getAllListLocation', getAllListLocation); //  get danh sách user
route.get('/getAllIsCombo', getAllIsCombo); //  get danh sách iscombo
route.get('/getAllIsNotCombo', getAllIsNotCombo); //  get danh sách isnotcombo
route.get('/getFilmFavourire/:userId', getFilmFavourire);
route.get('/getActor', getActor);
route.get('/updateSatusBuyTicketInfo', updateSatusBuyTicketInfo);
route.get('/findAllBuyTicketByUserId', findAllBuyTicketByUserId);
route.get('/getTop5RateMovie', getTop5RateMovie);
route.get('/FindOneBuyTicketById', FindOneBuyTicketById);
route.get('/momo-callback', momoCallback);
route.get("/check-transaction-status", checkTransactionStatus);
route.get('/checkInBuyTicket', checkInBuyTicket);
route.get('/checkInBuyTicket', checkInBuyTicket);
route.get('/deleteOneBuyTicketById', deleteOneBuyTicketById);



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

route.post('/insertRate', insertRate); // 
route.post('/getRate', getOneRate); // 
route.post('/getAllRateInfoByMovieID', getAllRateInfoByMovieID); // 
route.post('/updateInfoUser', updateInfoUser); // 
route.post('/changePassword', changePassword); // 
route.post('/changePasswordForEmail', changePasswordForEmail); // 

route.post('/insertMovie', insertMovie); // 
route.post('/insertShowTime', insertShowTime); // 
route.post('/getThongkeDoanhThu', getThongkeDoanhThu); // 
route.post('/getThongkeNguoiDungMoi', getThongkeNguoiDungMoi);
route.post('/updateUserStatus', updateUserStatus);
route.post('/insertAttendance', insertAttendance);
route.post('/checkAttendance', checkAttendance);
route.post('/checkOutAttendance', checkOutAttendance);
route.post('/updateUserRole', updateUserRole);



module.exports=route;