const sql = require('mssql');
const { Connection, Request } = require('tedious');

// Cấu hình kết nối

// local:
//local:
// const config = {
//     user: process.env.DB_USER,
//     password: process.env.DB_PASSWORD,
//     server: process.env.HOST_NAME,
//     database: process.env.DB_DATABASE,
//     options: {
//         encrypt: false,
//         trustServerCertificate: true
//     },
//     pool: {
//         max: 10,       // Tối đa 10 kết nối
//         min: 0,        // Tối thiểu 0 kết nối
//         idleTimeoutMillis: 30000, // Thời gian chờ idle (ms)
//     },
//     requestTimeout: 30000, // Thời gian chờ yêu cầu (ms)
//     connectionTimeout: 15000 // Thời gian chờ kết nối (ms)
// };




    // public


    const config = {
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        server: process.env.DB_HOST,
        port: parseInt(process.env.DB_PORT),
        database: process.env.DB_DATABASE,
        options: {
          encrypt: true,
          trustServerCertificate: true,
        },
        pool: {
            max: 200, // Tăng số lượng kết nối tối đa
            min: 5,  // Đặt số lượng kết nối tối thiểu
            idleTimeoutMillis: 200000, // Tăng thời gian chờ trước khi hủy kết nối
        }, 
        requestTimeout: 60000, // Tăng thời gian chờ truy vấn
        connectionTimeout: 30000, // Tăng thời gian chờ kết nối
        
      };
      
      
module.exports = config;