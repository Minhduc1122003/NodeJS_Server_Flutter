const express = require('express');
const { getHomepage, findByViewID,sendEmail,createAccount,getConversations,getAllMovies } = require('../controllers/homeController');
const route = express.Router();

// khai báo route
route.get('/', getHomepage);
route.post('/findByViewID', findByViewID); // Thêm route cho findByViewID
route.post('/sendEmail', sendEmail); // Thêm route cho sendEmail
route.post('/createAccount', createAccount); // Thêm route cho sendEmail
route.post('/getConversations', getConversations); // get danh sách nhắn tin
route.get('/getAllMovies', getAllMovies); // get danh sách nhắn tin


  
module.exports=route;