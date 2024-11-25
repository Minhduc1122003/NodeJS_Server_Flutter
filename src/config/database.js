const sql = require('mssql');

// Cấu hình kết nối

// local:
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


    // public


// const config = {  
//     user: process.env.DB_USER,
//     password: process.env.DB_PASSWORD,
//     server: process.env.DB_HOST,
//     port: Number(process.env.DB_PORT),
//     database: process.env.DB_DATABASE,
//     options: {
//         encrypt: true, 
//         trustServerCertificate: true 
//     } 
// };

module.exports = config;