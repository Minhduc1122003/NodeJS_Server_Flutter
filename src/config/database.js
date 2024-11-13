const sql = require('mssql');

// Cấu hình kết nối
const config = {
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    server: process.env.DB_HOST,
    port: Number(process.env.DB_PORT),
    database: process.env.DB_DATABASE,
    options: {
        encrypt: true, 
        trustServerCertificate: true 
    } 
};

module.exports = config;