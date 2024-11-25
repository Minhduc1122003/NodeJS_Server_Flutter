const sql = require('mssql');
const { Connection, Request } = require('tedious');

// Cấu hình kết nối

// local:
const config = {
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    server: process.env.HOST_NAME,
    database: process.env.DB_DATABASE,
    options: {
        encrypt: false,
        trustServerCertificate: true
    },
    pool: {
        max: 10,       // Tối đa 10 kết nối
        min: 0,        // Tối thiểu 0 kết nối
        idleTimeoutMillis: 30000, // Thời gian chờ idle (ms)
    },
    requestTimeout: 30000, // Thời gian chờ yêu cầu (ms)
    connectionTimeout: 15000 // Thời gian chờ kết nối (ms)
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