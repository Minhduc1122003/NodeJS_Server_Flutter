const express = require('express');
const { getHomepage, findByViewID,sendEmail,createAccount,getConversations,getAllMovies, findByViewMovieID,addFavourire,removeFavourire } = require('../controllers/homeController');
const route = express.Router();

// khai báo route
route.get('/', getHomepage);
route.post('/findByViewID', findByViewID); // Thêm route cho findByViewID
route.post('/sendEmail', sendEmail); // Thêm route cho sendEmail
route.post('/createAccount', createAccount); // Thêm route cho sendEmail
route.post('/getConversations', getConversations); // get danh sách nhắn tin
route.get('/getAllMovies', getAllMovies); // get danh sách nhắn tin
route.post('/findByViewMovieID', findByViewMovieID); // tìm kiếm bằng id phim
route.post('/addFavourire', addFavourire); // thêm yêu thích
route.post('/removeFavourire', removeFavourire); // thêm yêu thích


  
module.exports=route;