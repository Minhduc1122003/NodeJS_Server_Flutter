require("dotenv").config();
const express = require("express");
const webRoutes = require("./routes/web");
const cors = require('cors');
const http = require('http');
const socketServer = require('./config/socketIOServer'); // Import file Socket.io

const app = express();

// Cấu hình CORS trước khi khai báo các route
app.use(cors());

// Cấu hình để phân tích dữ liệu JSON
app.use(express.json());
 
// Khai báo cổng và hostname từ biến môi trường
const port = process.env.PORT || 8081; 
const hostname = process.env.HOST_NAME || 'localhost';
const server = http.createServer(app);

// Khai báo các route
app.use("/", webRoutes);

// Khởi động Socket.io
socketServer(server);

// Khởi động server
server.listen(port, hostname, () => {
  console.log(`Server is running on http://${hostname}:${port}`);
});
