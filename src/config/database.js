const sql = require('mssql');


// Cấu hình kết nối
const config = {
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    server: process.env.HOST_NAME, 
    database: process.env.DB_DATABASE,
    options: {
        encrypt:false, // Sử dụng nếu bạn đang kết nối đến Azure SQL Database
        trustServerCertificate: true // Sử dụng nếu bạn đang phát triển local
    }
};

module.exports = config;