const express = require('express');
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
    createFilm,
 } = require('../controllers/homeController');
const route = express.Router();

// khai báo route
route.get('/', getHomepage);
route.get('/getMoviesDangChieu', getMoviesDangChieu); // get danh sách nhắn tin
route.get('/getMoviesSapChieu', getMoviesSapChieu); // get danh sách nhắn tin
route.get('/getShowtimeListForAdmin', getShowtimeListForAdmin); // get danh sách nhắn tin
route.get('/getUserListForAdmin', getUserListForAdmin); //  get danh sách user

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



module.exports=route;