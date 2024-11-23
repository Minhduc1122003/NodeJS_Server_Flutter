const sql = require('mssql');
const { Connection, Request } = require('tedious');

// Cấu hình kết nối

// local:
const config = {
    server: process.env.HOST_NAME,
    authentication: {
        type: 'default',
        options: {
            userName: process.env.DB_USER,
            password: process.env.DB_PASSWORD
        }
    },
    options: {
        database: process.env.DB_DATABASE,
        encrypt: false,
        trustServerCertificate: true
    }
};

const connection = new Connection(config);

connection.on('connect', (err) => {
    if (err) {
        console.error("Connection failed: ", err.message);
    } else {
        console.log("Connected to SQL Server!");
    }
});



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
connection.connect();

module.exports = config;