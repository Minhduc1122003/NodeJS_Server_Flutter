const connection = require("../config/database");
const sql = require("mssql");
const nodemailer = require("nodemailer");
require("dotenv").config();
const crypto = require('crypto');
const momoConfig = require('../config/momo');
const axios = require('axios');
 
// Hàm xử lý cho route GET /
const getHomepage = async (req, res) => {
  let pool;
  try {
    // Kết nối đến SQL Server
    pool = await sql.connect(connection);
    console.log("Connecting to SQL Server");

    // Thực hiện một truy vấn đơn giản
    let result = await pool.request().query("SELECT * FROM accounts");

    // Gửi dữ liệu theo định dạng JSON tự động với format dễ đọc
    res.setHeader('Content-Type', 'application/json');
    res.send(JSON.stringify(result.recordset, null, 2)); // Indent with 2 spaces for readability

    console.log("Clients have connected");
  } catch (error) {
    console.error("Error fetching accounts:", error);
    res.status(500).json({ message: "Internal Server Error", error: error.message });
  } finally {
    // Đóng kết nối nếu pool đã được khởi tạo
    if (pool) {
      await pool.close(); // Đóng pool
    }
  }
};

// Hàm xử lý cho route POST /findByViewID
const findByViewID = async (req, res) => {
  console.log("Flutter has connected to login!");

  // Kiểm tra xem req.body có định nghĩa không
  if (!req.body) {
    return res.status(400).json({ message: "Request body is missing" });
  } 
 
  const { username, password } = req.body || {};
  console.log("Đã nhận dữ liệu từ Flutter!");
  console.log(`Username: ${username}, Password: ${password}`);

  let pool;
  try {
    // Kết nối đến SQL Server
    pool = await sql.connect(connection);
    console.log("Đã kết nối database");

    // Thực hiện truy vấn để tìm tài khoản
    let result = await pool.request()
      .input('username', sql.VarChar, username)
      .input('password', sql.VarChar, password)
      .query("SELECT * FROM Users WHERE username = @username AND password = @password");

    // Kiểm tra xem có tài khoản nào không
    if (result.recordset.length > 0) {
      res.status(200).json({ message: "Login successful", user: result.recordset[0] });
    } else {
      res.status(401).json({ message: "Invalid username or password" });
      console.log("khong tim thay du lieu");

    }
  } catch (error) {
    console.error("Error fetching accounts:", error);
    res.status(500).json({ message: "Internal Server Error", error: error.message });
  } finally {
    // Đóng kết nối
    if (pool) {
      await pool.close(); // Đóng pool
    }
  }
};

// Hàm xử lý cho route POST /findByViewID
const findByViewIDUser = async (req, res) => {
  console.log("Flutter has connected to login!");

  // Kiểm tra xem req.body có định nghĩa không
  if (!req.body) {
    return res.status(400).json({ message: "Request body is missing" });
  } 
 
  const {UserID} = req.body || {};
  console.log("Đã nhận dữ liệu từ Flutter!");
  console.log(`UserID: ${UserID}`);

  let pool;
  try {
    // Kết nối đến SQL Server
    pool = await sql.connect(connection);
    console.log("Đã kết nối database");

    // Thực hiện truy vấn để tìm tài khoản
    let result = await pool.request()
      .input('UserID', UserID)
      .query("SELECT * FROM Users WHERE UserID = @UserID ");   

    // Kiểm tra xem có tài khoản nào không
    if (result.recordset.length > 0) {
      res.status(200).json({ message: "Select successfully", user: result.recordset[0] });
    } else {
      res.status(401).json({ message: "khong tim thay nguoi dung" });
      console.log("khong tim thay du lieu");  

    }
  } catch (error) {
    console.error("Error fetching accounts:", error);
    res.status(500).json({ message: "Internal Server Error", error: error.message });
  } finally {
    // Đóng kết nối
    if (pool) {
      await pool.close(); // Đóng pool
    }
  }
};
// Hàm gửi email
const sendEmail = async (req, res) => {
  console.log("Sending email!");
  if (!req.body) {
    return res.status(400).json({ message: "Request body is missing" });
  }
  const { title, content, recipient } = req.body || {};
  console.log(`Title: ${title}, Content: ${content}, Recipient: ${recipient}`);
  console.log(`0===D==================>`);
  console.log(`Data from flutter:`);
  console.log(`Title:${title}`);
  console.log(`Content:${content}`);
  console.log(`Recipient:${recipient}`);
  // Cấu hình transporter
  let transporter = nodemailer.createTransport({
    service: 'gmail', // Thay đổi theo nhà cung cấp email bạn sử dụng
    auth: {
      user: process.env.MY_EMAIL, // Thay đổi thành email của bạn
      pass: process.env.MY_PASSEMAIL, // Thay đổi thành mật khẩu email của bạn
    },
  });
  const code = generateCode();
  // Cấu hình email
  let mailOptions = {
    from: process.env.MY_EMAIL, // Địa chỉ email của bạn
    to: recipient, // Địa chỉ email người nhận
    subject: 'Đăng ký tài khoản PANTHERs CINEMA', // Tiêu đề email
    html: `
      <html>
      <head>
        <style>
          body {
            font-family: Arial, sans-serif;
            background-color: #f4f4f4;
            margin: 0;
            padding: 0;
          }
          .container {
            width: 90%;
            max-width: 600px;
            margin: auto;
            background: #ffffff;
            border-radius: 8px;
            box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
            overflow: hidden;
          }
          .header {
            background: #6F3CD7;
            color: #ffffff;
            padding: 20px;
            text-align: center;
          }
          .header h1 {
            margin: 0;
          }
          .content {
            padding: 20px;
          }
          .footer {
            background: #f4f4f4;
            padding: 10px;
            text-align: center;
            font-size: 12px;
            color: #666;
          }
          .button {
            display: inline-block;
            background: #6F3CD7;
            color: #ffffff;
            padding: 10px 20px;
            border-radius: 5px;
            text-decoration: none;
            font-weight: bold;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>PANTHERs CINEMA</h1>
          </div>
          <div class="content">
            <p>Chào mừng bạn đến với PANTHERs CINEMA!</p>
            <p>Để tiếp tục quá trình đăng ký tài khoản, mã code của bạn là:</p>
            <h2 style="text-align: center; color: #6F3CD7;">${code}</h2>
            <p>Vui lòng sử dụng mã này để hoàn tất quá trình đăng ký.</p>
            <p>Nếu bạn gặp bất kỳ vấn đề nào, hãy liên hệ với chúng tôi.</p>
            <p>Chân thành cảm ơn,</p>
            <p>Đội ngũ PANTHERs CINEMA</p>
          </div>
          <div class="footer">
            <p>Bạn nhận được email này vì bạn đã đăng ký trên PANTHERs CINEMA.</p>
            <p>Bạn không cần trả lời email này. Nếu bạn cần trợ giúp, vui lòng liên hệ với chúng tôi qua email hỗ trợ.</p>
          </div>
        </div>
      </body>
      </html>
    `, // Nội dung email với định dạng HTML
  };


  try {
    await transporter.sendMail(mailOptions);
    res.status(200).json({ message: "Email sent successfully", code: code });
    console.log("Email sent successfully");
  } catch (error) {
    console.error("Error sending email:", error);
    res.status(500).json({ message: "Internal Server Error", error: error.message });
  }
};

// hàm tạo tài khoản
const createAccount = async (req, res) => {

  
  if (!req.body) {
    return res.status(400).json({ message: "Request body is missing" });
  }

  const { email, password, username, fullname, phoneNumber } = req.body;
  const phoneNumberStr = String(phoneNumber); // Chuyển đổi phoneNumber thành chuỗi

  let pool;
  try {
    pool = await sql.connect(connection);
    console.log("Connected to database");
    

    const currentDate = new Date().toISOString();

    let result = await pool.request()
  .input('username', sql.VarChar(50), username)
  .input('password', sql.VarChar(255), password) // Password nên là 255 để phù hợp với bảng
  .input('email', sql.VarChar(155), email)
  .input('fullname', sql.NVarChar(155), fullname)
  .input('phoneNumber', sql.VarChar(20), phoneNumberStr) // Chỉnh lại kiểu dữ liệu phù hợp
  .input('photo', sql.VarChar(50), null) 
  .input('role', sql.Int, 0) // Giá trị mặc định cho khách hàng
  .input('createDate', sql.DateTime, currentDate)
  .input('status', sql.NVarChar(20), 'Đang hoạt động') // Default status
  .input('isDelete', sql.Bit, 0) // 0: false (mặc định)

  .query(`
    INSERT INTO Users (UserName, Password, Email, FullName, PhoneNumber, Photo, Role, CreateDate, Status, IsDelete)
    VALUES (@username, @password, @email, @fullname, @phoneNumber, @photo, @role, @createDate, @status, @isDelete)
  `);

 
    if (result.rowsAffected[0] > 0) {
      res.status(200).json({ message: "Account created successfully" });
    } else {
      res.status(400).json({ message: "Account creation failed" });
    }
  } catch (error) {
    console.error("Error creating account:", error);
    res.status(500).json({ message: "Internal Server Error", error: error.message });
  } finally {
    if (pool) {
      await pool.close();
    }
  }
};

// hàm get dữ liệu user (admin)
const getAllUserData = async (req, res) => {
  console.log("Flutter has requested to fetch user data!");

  // Kiểm tra xem req.body có tồn tại không
  if (!req.body || !req.body.username) {
    return res.status(400).json({ message: "Request body or username is missing" });
  }

  const username = req.body.username;
  console.log(`Username: ${username}`);

  let pool;
  try {
    // Kết nối đến SQL Server
    pool = await sql.connect(connection);

    // Thực hiện truy vấn để lấy tất cả người dùng trừ user có `username` đã cho
    let result = await pool.request()
      .input('username', sql.VarChar, username)
      .query(`
        SELECT * FROM Users WHERE UserName != @username
      `);


    // Trả kết quả dưới dạng JSON
    res.status(200).json(result.recordset);
  } catch (error) {
    console.error("Error fetching user data:", error);
    res.status(500).json({ message: "Internal Server Error", error: error.message });
  } finally {
    // Đóng kết nối
    if (pool) {
      await pool.close(); // Đóng pool
    }
  }
};


// hàm sinh code random
function generateCode(length = 8) {
  return crypto.randomBytes(length)
    .toString('hex')
    .slice(0, length)
    .toUpperCase(); // Đổi thành chữ hoa nếu cần
}


// Hàm xử lý cho route GET /movies
const getMoviesDangChieu = async (req, res) => {
  let pool;
  try {
    // Kết nối đến SQL Server
    pool = await sql.connect(connection);

    // Thực hiện truy vấn để lấy thông tin phim, đánh giá, thể loại, rạp chiếu, thời lượng và ngày khởi chiếu
    let result = await pool.request().query(`
SELECT 
    m.MovieID,
    m.Title,
    m.Description,
    m.Duration,
    m.ReleaseDate,
    m.PosterUrl,
    m.TrailerUrl,
    m.Age,  -- Chọn thêm trường Age
    m.SubTitle, 
    m.Voiceover,
    ( 
        SELECT STRING_AGG(g.GenreName, ', ') 
        FROM MovieGenre mg
        JOIN Genre g ON mg.IdGenre = g.IdGenre
        WHERE mg.MovieID = m.MovieID
    ) AS Genres, 
    c.CinemaName,
    c.Address AS CinemaAddress,
    STRING_AGG(r.Content, ' | ') AS ReviewContents, 
    ROUND(AVG(r.Rating), 2) AS AverageRating, 
    COUNT(r.IdRate) AS ReviewCount 
FROM 
    Movies m
LEFT JOIN 
    Cinemas c ON m.CinemaID = c.CinemaID
LEFT JOIN  
    Rate r ON m.MovieID = r.MovieID
WHERE 
    m.StatusMovie = N'Đang chiếu' 
GROUP BY 
    m.MovieID, m.Title, m.Description, m.Duration, m.ReleaseDate, 
    m.PosterUrl, m.TrailerUrl, m.Age,  -- Thêm Age vào GROUP BY
    m.SubTitle, m.Voiceover, 
    c.CinemaName, c.Address, m.CinemaID;  -- Đã thêm CinemaID trước đó

    `);

    // Gửi dữ liệu theo định dạng JSON tự động với format dễ đọc
    res.setHeader('Content-Type', 'application/json');
    res.send(JSON.stringify(result.recordset, null, 2)); // Indent with 2 spaces for readability

  } catch (error) {
    console.error("Error fetching movies:", error);
    res.status(500).json({ message: "Internal Server Error", error: error.message }); 
  } finally {
    // Đóng kết nối nếu pool đã được khởi tạo
    if (pool) {
      await pool.close(); // Đóng pool
    }
  }
};

// Hàm xử lý cho route GET /movies
const getMoviesSapChieu = async (req, res) => {
  let pool;
  try {
    // Kết nối đến SQL Server
    pool = await sql.connect(connection);
    console.log("Connecting to SQL Server");

    // Thực hiện truy vấn để lấy thông tin phim, đánh giá, thể loại, rạp chiếu, thời lượng và ngày khởi chiếu
    let result = await pool.request().query(`
 SELECT 
    m.MovieID,
    m.Title,
    m.Description,
    m.Duration,
    m.ReleaseDate,
    m.PosterUrl,
    m.TrailerUrl,
    m.Age,  -- Chọn thêm trường Age
    m.SubTitle, 
    m.Voiceover,
    ( 
        SELECT STRING_AGG(g.GenreName, ', ') 
        FROM MovieGenre mg
        JOIN Genre g ON mg.IdGenre = g.IdGenre
        WHERE mg.MovieID = m.MovieID
    ) AS Genres, 
    c.CinemaName,
    c.Address AS CinemaAddress,
    STRING_AGG(r.Content, ' | ') AS ReviewContents, 
    ROUND(AVG(r.Rating), 2) AS AverageRating, 
    COUNT(r.IdRate) AS ReviewCount 
FROM 
    Movies m
LEFT JOIN 
    Cinemas c ON m.CinemaID = c.CinemaID
LEFT JOIN  
    Rate r ON m.MovieID = r.MovieID
WHERE 
    m.StatusMovie = N'Sắp chiếu' 
GROUP BY 
    m.MovieID, m.Title, m.Description, m.Duration, m.ReleaseDate, 
    m.PosterUrl, m.TrailerUrl, m.Age,  -- Thêm Age vào GROUP BY
    m.SubTitle, m.Voiceover, 
    c.CinemaName, c.Address, m.CinemaID;  -- Đã thêm CinemaID trước đó


    `);

    // Gửi dữ liệu theo định dạng JSON tự động với format dễ đọc
    res.setHeader('Content-Type', 'application/json');
    res.send(JSON.stringify(result.recordset, null, 2)); // Indent with 2 spaces for readability

  } catch (error) {
    console.error("Error fetching movies:", error);
    res.status(500).json({ message: "Internal Server Error", error: error.message });
  } finally {
    // Đóng kết nối nếu pool đã được khởi tạo
    if (pool) {
      await pool.close(); // Đóng pool
    }
  }
};


const findByViewMovieID = async (req, res) => {
  console.log("findByViewMovieID");

  // Kiểm tra xem req.body có định nghĩa không
  if (!req.body) {
    return res.status(400).json({ message: "Request body is missing" });
  }

  const movieId = parseInt(req.body.movieId, 10);
  const userId = parseInt(req.body.userId, 10);
  console.log("Đã nhận MovieID và UserID từ Flutter!");
  console.log(`MovieID: ${movieId}, UserID: ${userId}`);

  let pool;
  try {
    // Kết nối đến SQL Server
    pool = await sql.connect(connection);

    // Thực hiện truy vấn để tìm thông tin phim dựa trên MovieID và kiểm tra xem có trong Favourite không
    let result = await pool.request()
      .input('movieId', sql.Int, movieId)
      .input('userId', sql.Int, userId)
      .query(`
SELECT 
    m.MovieID,
    m.Title,
    m.Description,
    m.Duration,
    m.ReleaseDate,
    m.PosterUrl,
    m.TrailerUrl,
    m.Age, -- Truy cập trực tiếp trường Age từ bảng Movies
    m.SubTitle, -- Bao gồm SubTitle
    m.Voiceover, -- Bao gồm Voiceover
    m.Price, -- Bao gồm Price
    -- Sử dụng subquery để xử lý việc kết hợp thể loại
    (SELECT STRING_AGG(g.GenreName, ', ') 
     FROM MovieGenre mg 
     JOIN Genre g ON mg.IdGenre = g.IdGenre 
     WHERE mg.MovieID = m.MovieID
    ) AS Genres,
    c.CinemaName,
    c.Address AS CinemaAddress,
    STRING_AGG(r.Content, ' | ') AS ReviewContents, -- Kết hợp các đánh giá thành chuỗi
    ROUND(AVG(r.Rating), 2) AS AverageRating, -- Đánh giá trung bình
    COUNT(r.IdRate) AS ReviewCount, -- Số lượng đánh giá
    -- Đếm số lượng đánh giá trong từng khoảng giá trị
    SUM(CASE WHEN r.Rating BETWEEN 9 AND 10 THEN 1 ELSE 0 END) AS Rating_9_10,
    SUM(CASE WHEN r.Rating BETWEEN 7 AND 8 THEN 1 ELSE 0 END) AS Rating_7_8,
    SUM(CASE WHEN r.Rating BETWEEN 5 AND 6 THEN 1 ELSE 0 END) AS Rating_5_6,
    SUM(CASE WHEN r.Rating BETWEEN 3 AND 4 THEN 1 ELSE 0 END) AS Rating_3_4,
    SUM(CASE WHEN r.Rating BETWEEN 1 AND 2 THEN 1 ELSE 0 END) AS Rating_1_2,
    CASE 
      WHEN f.MovieID IS NOT NULL THEN CAST(1 AS BIT) 
      ELSE CAST(0 AS BIT) 
    END AS IsFavourite
FROM 
    Movies m
LEFT JOIN 
    MovieGenre mg ON m.MovieID = mg.MovieID
LEFT JOIN 
    Genre g ON mg.IdGenre = g.IdGenre
LEFT JOIN 
    Cinemas c ON m.CinemaID = c.CinemaID
LEFT JOIN 
    Rate r ON m.MovieID = r.MovieID
LEFT JOIN 
    Users u ON r.UserId = u.UserId
LEFT JOIN 
    Favourite f ON m.MovieID = f.MovieID AND f.UserId = @userId
WHERE 
    m.MovieID = @movieId
GROUP BY 
    m.MovieID, m.Title, m.Description, m.Duration, m.ReleaseDate, 
    m.PosterUrl, m.TrailerUrl, m.Age, -- Bao gồm Age trực tiếp từ Movies
    m.SubTitle, m.Voiceover, -- Bao gồm SubTitle và Voiceover
    m.Price, -- Bao gồm Price
    c.CinemaName, 
    c.Address, 
    f.MovieID;



      `);

    // Kiểm tra xem có dữ liệu phim nào không
    if (result.recordset.length > 0) {
      res.status(200).json({ message: "Movie found", movie: result.recordset[0] });
    } else {
      res.status(404).json({ message: "Movie not found" });
    }
  } catch (error) {
    console.error("Error fetching movie:", error);
    res.status(500).json({ message: "Internal Server Error", error: error.message });
  } finally {
    // Đóng kết nối
    if (pool) {
      await pool.close(); // Đóng pool
    }
  }
};

const addFavourire = async (req, res) => {
  console.log("sendFavourire");

  // Kiểm tra xem req.body có định nghĩa không
  if (!req.body) {
    return res.status(400).json({ message: "Request body is missing" });
  }

  const movieId = parseInt(req.body.movieId, 10);
  const userId = parseInt(req.body.userId, 10);
  console.log(`MovieID: ${movieId}, UserID: ${userId}`);

  let pool;
  try {
    // Kết nối đến SQL Server
    pool = await sql.connect(connection);
    console.log("Đã kết nối database");

    // Thực hiện truy vấn để chèn dữ liệu vào bảng Favourite
    await pool.request()
      .input('movieId', sql.Int, movieId)
      .input('userId', sql.Int, userId)
      .query(`
        INSERT INTO Favourite (MovieID, UserId) 
        VALUES (@movieId, @userId);
      `);

    res.status(200).json({ message: "Favourite added successfully" });
    console.log("Favourite added successfully");

  } catch (error) {
    console.error("Error adding favourite:", error);
    res.status(500).json({ message: "Internal Server Error", error: error.message });
  } finally {
    if (pool) {
      await pool.close();
    }
  }
};


const removeFavourire = async (req, res) => {
  console.log("removeFavourire");

  // Kiểm tra xem req.body có định nghĩa không
  if (!req.body) {
    return res.status(400).json({ message: "Request body is missing" });
  }

  const movieId = parseInt(req.body.movieId, 10);
  const userId = parseInt(req.body.userId, 10);
  console.log(`MovieID: ${movieId}, UserID: ${userId}`);

  let pool;
  try {
    // Kết nối đến SQL Server
    pool = await sql.connect(connection);

    // Thực hiện truy vấn để xóa dữ liệu từ bảng Favourite
    const result = await pool.request()
      .input('movieId', sql.Int, movieId)
      .input('userId', sql.Int, userId)
      .query(`
        DELETE FROM Favourite
        WHERE MovieID = @movieId AND UserId = @userId;
      `);

    // Kiểm tra số lượng hàng bị ảnh hưởng
    if (result.rowsAffected[0] > 0) {
      // Trả về phản hồi thành công nếu ít nhất 1 hàng bị xóa
      res.status(200).json({ message: "Favourite removed successfully" });
      console.log("Favourite removed successfully");
    } else {
      // Trả về phản hồi nếu không tìm thấy dữ liệu để xóa
      res.status(404).json({ message: "Favourite not found" });
      console.log("Favourite not found");
    }

  } catch (error) {
    console.error("Error removing favourite:", error);
    res.status(500).json({ message: "Internal Server Error", error: error.message });
  } finally {
    // Đóng kết nối
    if (pool) {
      await pool.close(); // Đóng pool
    }
  }
};

// Hàm xử lý cho route GET /movies

const getShowtime = async (req, res) => {
  let pool;
  try {
    const movieId = parseInt(req.body.movieId, 10);
    const date = req.body.date; // Định dạng YYYY-MM-DD
    const time = req.body.time; // Định dạng HH:MM

    console.log("Đã nhận MovieID, Date và Time từ Flutter!");
    console.log("Date:", date);
    console.log("Time:", time);

    // Kết nối đến SQL Server
    pool = await sql.connect(connection);

    const result = await pool.request()
      .input('InputDate', date)
      .input('InputTime', time) 
      .input('MovieID', movieId)
      .query(`
        SELECT 
    S.ShowtimeID AS ShowTimeID,
    M.Title AS MovieTitle,
    M.Duration AS MovieDuration,
    S.CinemaRoomID,
    S.ShowtimeDate, 
    S.StartTime,
    DATEADD(MINUTE, M.Duration, CAST(CONVERT(datetime, S.ShowtimeDate) + CAST(S.StartTime AS datetime) AS datetime)) AS EndTime
FROM 
    Showtime S
JOIN 
    Movies M ON S.MovieID = M.MovieID
WHERE 
    S.ShowtimeDate = @InputDate
    AND S.StartTime >= @InputTime
    AND M.MovieID = @MovieID
ORDER BY 
    S.StartTime;
      `);

    // Gửi dữ liệu theo định dạng JSON
    res.setHeader('Content-Type', 'application/json');
    res.json(result.recordset);

  } catch (error) {
    console.error("Lỗi khi truy vấn lịch chiếu:", error);
    res.status(500).json({ message: "Lỗi Server", error: error.message });
  } finally {
    if (pool) {
      await pool.close();
    }
  }
};


const getChair = async (req, res) => {
  console.log("getChair from server");

  // Kiểm tra xem req.body có định nghĩa không
  if (!req.body) {
    return res.status(400).json({ message: "Request body is missing" });
  }

  const showTimeID = parseInt(req.body.showTimeID);
  const cinemaRoomID = parseInt(req.body.cinemaRoomID); // Nhận CinemaRoomID
  console.log(`showTimeID: ${showTimeID}, cinemaRoomID: ${cinemaRoomID}`);

  let pool;
  try {
    // Kết nối đến SQL Server
    pool = await sql.connect(connection);

    // Thực hiện truy vấn để lấy danh sách ghế
    const result = await pool.request()
      .input('showTimeID', sql.Int, showTimeID)
      .input('cinemaRoomID', sql.Int, cinemaRoomID) // Thêm CinemaRoomID vào truy vấn
      .query(`
        SELECT 
           s.SeatID,
		  s.CinemaRoomID,
          s.ChairCode,
		  s.DefectiveChair,
    CAST(COALESCE(sr.Status, 0) AS BIT) AS ReservationStatus
        FROM 
          Seats s
        LEFT JOIN 
          SeatReservation sr ON s.SeatID = sr.SeatID AND sr.ShowtimeID = @showTimeID
        WHERE 
          s.CinemaRoomID = @cinemaRoomID -- Lọc theo CinemaRoomID
        ORDER BY  
          s.SeatID;
      `); 

    // Trả về phản hồi thành công với danh sách ghế
    res.status(200).json(result.recordset);
    console.log("Danh sách ghế đã được trả về thành công");

  } catch (error) {
    console.error("Error fetching chairs:", error);
    res.status(500).json({ message: "Internal Server Error", error: error.message });
  } finally {
    // Đóng kết nối
    if (pool) {
      await pool.close(); // Đóng pool
    }
  }
};


const insertBuyTicket = async (req, res) => {
  let pool;
  try {
    // Lấy dữ liệu từ request body
    const { BuyTicketId, UserId, MovieID, ShowtimeID, SeatIDs, ComboIDs} = req.body;


    // Kết nối đến SQL Server
    pool = await sql.connect(connection); 
    console.log("Connecting to SQL Server");

    // Prepare and execute the stored procedure with dynamic values
    const result = await pool.request()
      .input('BuyTicketId', BuyTicketId)
      .input('UserId', UserId)
      .input('MovieID', MovieID)
      .input('ShowtimeID', ShowtimeID)
      .input('SeatIDs', SeatIDs)
      .input('ComboIDs', ComboIDs)
  
      .query(`EXEC InsertBuyTicket @BuyTicketId, @UserId, @MovieID, @ShowtimeID, @SeatIDs, @ComboIDs`);
    // Gửi kết quả trả về
    res.setHeader('Content-Type', 'application/json');
    res.json(result.recordset);

  } catch (error) {
    console.error("Lỗi khi truy vấn:", error);
    res.status(500).json({ message: "Lỗi Server", error: error.message });
  } finally {
    if (pool) {
      await pool.close();
    }
  }
};



const getShowtimeListForAdmin = async (req, res) => {
  let pool;
  try {


    // Kết nối đến SQL Server
    pool = await sql.connect(connection);
    console.log("Connecting to SQL Server Table getShowtimeListForAdmin");
    const result = await pool.request()
      .query(`
       SELECT 
    M.Title AS MovieName,
    S.ShowtimeDate,
    S.StartTime,
    M.Duration AS MovieDuration,
    CR.CinemaRoomID AS RoomNumber,
    C.CinemaName
FROM 
    Showtime S
    INNER JOIN Movies M ON S.MovieID = M.MovieID
    INNER JOIN CinemaRoom CR ON S.CinemaRoomID = CR.CinemaRoomID
    INNER JOIN Cinemas C ON CR.CinemaID = C.CinemaID
ORDER BY 
    S.ShowtimeDate, S.StartTime
      `);

    // Gửi dữ liệu theo định dạng JSON
    res.setHeader('Content-Type', 'application/json');
    res.json(result.recordset);
  } catch (error) {
    console.error("Lỗi khi truy vấn lịch chiếu:", error);
    res.status(500).json({ message: "Lỗi Server", error: error.message });
  } finally {
    if (pool) {
      await pool.close();
    }
  }
};

const uploadImage = async (req, res) => { 
  console.log('đã nhận ảnh tử user');
  
  try {
    const file = req.file;
    if (!file) {
      return res.status(400).send('No file uploaded.');
    }
    res.status(200).send('File uploaded successfully.');
  } catch (error) {
    res.status(500).send('Error uploading file.');
  }  
};    
    




// ----------------- SOCKET IO -----------------------
const getConversations = async (req, res) => {
  const { userId } = req.body; // Lấy userId từ body của request

  // Kiểm tra giá trị userId
  if (typeof userId !== 'number') {
    return res.status(400).send('Invalid user ID');
  }

  let pool; 
  try {
    pool = await sql.connect(connection);

    // Truy vấn dữ liệu từ bảng Conversations và lấy thông tin tin nhắn mới nhất và hình ảnh của người còn lại
    const result = await pool.request()
      .input('UserId', sql.Int, userId)
      .query(`
  SELECT 
    c.Id, 
    c.User1Id, 
    c.User2Id, 
    c.StartedAt, 
    MAX(m.SentAt) AS LastMessageTime,
    (SELECT TOP 1 m.Message
     FROM Messages m
     WHERE (m.SenderId = c.User1Id AND m.ReceiverId = c.User2Id)
        OR (m.SenderId = c.User2Id AND m.ReceiverId = c.User1Id)
     ORDER BY m.SentAt DESC) AS LastMessage,
    CASE 
      WHEN @UserId = c.User1Id THEN c.User2Id
      ELSE c.User1Id
    END AS OtherUserId,
    CASE 
      WHEN @UserId = c.User1Id THEN (SELECT Photo FROM Users WHERE UserId = c.User2Id)
      ELSE (SELECT Photo FROM Users WHERE UserId = c.User1Id)
    END AS OtherUserPhoto,
    CASE 
      WHEN @UserId = c.User1Id THEN (SELECT FullName FROM Users WHERE UserId = c.User2Id)
      ELSE (SELECT FullName FROM Users WHERE UserId = c.User1Id)
    END AS OtherUserName,
    @UserId AS RequesterId  -- Thêm cột RequesterId để chứa ID người gửi yêu cầu
  FROM Conversations c
  LEFT JOIN Messages m 
    ON (m.SenderId = c.User1Id AND m.ReceiverId = c.User2Id)
    OR (m.SenderId = c.User2Id AND m.ReceiverId = c.User1Id)
  WHERE c.User1Id = @UserId OR c.User2Id = @UserId
  GROUP BY c.Id, c.User1Id, c.User2Id, c.StartedAt
  ORDER BY LastMessageTime DESC
`);

    // Trả kết quả cho client
    res.json(result.recordset);
  } catch (err) {
    console.error('Failed to get conversations:', err);
    res.status(500).send('Server Error');
  } finally {
    if (pool) {
      await pool.close(); // Đóng pool
    }
  }
};



const createFilm = async (req, res) => {
  let pool;
  try {
    // Get values from the request body
    const buyTicketId = parseInt(req.body.buyTicketId, 10); // INT
    const userId = parseInt(req.body.userId, 10); // INT
    const movieId = parseInt(req.body.movieId, 10); // INT
    const quantity = parseInt(req.body.quantity, 10); // INT
    const totalPrice = parseFloat(req.body.totalPrice); // FLOAT
    const showtimeId = parseInt(req.body.showtimeId, 10); // INT
    const seatIDs = req.body.seatIDs; // Giả sử seatIDs là mảng
    const seatIDsString = Array.isArray(seatIDs) ? seatIDs.join(',') : seatIDs; // Chuyển thành chuỗi
    
    // Kết nối đến SQL Server
    pool = await sql.connect(connection);
    console.log("Connecting to SQL Server Table Showtime");

    // Prepare and execute the stored procedure with dynamic values
    const result = await pool.request()
    .input('BuyTicketId', buyTicketId)
    .input('UserId', userId)
    .input('MovieID', movieId)
      .input('Quantity', quantity)
      .input('TotalPrice', totalPrice)
      .input('ShowtimeID', showtimeId)
      .input('SeatIDs', sql.NVarChar(sql.MAX), seatIDsString) // Sử dụng seatIDsString
      .query(`EXEC InsertBuyTicket @BuyTicketId, @UserId, @MovieID, @Quantity, @TotalPrice, @ShowtimeID, @SeatIDs;`);

    // Gửi dữ liệu theo định dạng JSON
    res.setHeader('Content-Type', 'application/json');
    res.json(result.recordset);

  } catch (error) {
    console.error("Lỗi khi truy vấn lịch chiếu:", error);
    res.status(500).json({ message: "Lỗi Server", error: error.message });
  } finally {
    if (pool) {
      await pool.close();
    }
  }
};


const getUserListForAdmin = async (req, res) => {
  let pool;
  try {

    console.log("Đã nhận getUserListForAdmin Flutter!");

    // Kết nối đến SQL Server
    pool = await sql.connect(connection);
    console.log("Connecting to SQL Server Table getUserListForAdmin");
    const result = await pool.request()
      .query(`
      select * from Users where Role = 1  
      `);

    // Gửi dữ liệu theo định dạng JSON
    res.setHeader('Content-Type', 'application/json');
    res.json(result.recordset);
  } catch (error) {
    console.error("Lỗi khi truy vấn lịch chiếu:", error);
    res.status(500).json({ message: "Lỗi Server", error: error.message });
  } finally {
    if (pool) {
      await pool.close();
    }
  }
};

const createShifts = async (req, res) => {
  let pool;
  try {
    console.log("Đã nhận createShifts Flutter!");

    // Kiểm tra nếu body của request không tồn tại
    if (!req.body) {
      return res.status(400).json({ message: "Request body is missing" });
    }

    // Lấy dữ liệu từ request body
    const { ShiftName, StartTime, EndTime, IsCrossDay, Status } = req.body;

    // Kiểm tra các trường bắt buộc
    if (!ShiftName || !StartTime || !EndTime || IsCrossDay === undefined || !Status) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    // Định dạng lại StartTime và EndTime
    const startTimeFormatted = _formatTime(StartTime);
    const endTimeFormatted = _formatTime(EndTime);

    // In ra để kiểm tra định dạng thời gian
    console.log("Thời gian bắt đầu (formatted):", startTimeFormatted);
    console.log("Thời gian kết thúc (formatted):", endTimeFormatted);

    // Kiểm tra định dạng thời gian
    if (!isValidTimeFormat(startTimeFormatted) || !isValidTimeFormat(endTimeFormatted)) {
      return res.status(400).json({ message: "Invalid time format for StartTime or EndTime" });
    }

    pool = await sql.connect(connection);
    console.log("Connecting to SQL Server Table Shifts");

    const result = await pool.request()
      .input('ShiftName', ShiftName)
      .input('StartTime', startTimeFormatted)
      .input('EndTime', endTimeFormatted)
      .input('IsCrossDay', IsCrossDay)
      .input('Status', Status) 
      .query(`
        INSERT INTO Shifts (ShiftName, StartTime, EndTime, IsCrossDay, Status)
        VALUES (@ShiftName, @StartTime, @EndTime, @IsCrossDay, @Status)
      `);

    res.status(201).json({ message: "Shift created successfully", shiftId: result.rowsAffected[0] });
  } catch (error) {
    console.error("Lỗi khi tạo ca làm:", error);
    res.status(500).json({ message: "Lỗi Server", error: error.message });
  } finally {
    if (pool) {
      await pool.close();
    }
  }
};

const _formatTime = (time) => {
  // Nếu thời gian có định dạng 'HH:mm', thêm ':00' vào cuối
  if (time && time.length === 5) {
    return `${time}:00`; // Chuyển thành 'HH:mm:ss'
  }
  return time; // Trả về thời gian không thay đổi nếu không khớp
}; 

const isValidTimeFormat = (time) => {
  // Kiểm tra xem thời gian có định dạng hợp lệ 'HH:mm:ss'
  const regex = /^(2[0-3]|[01]?[0-9]):([0-5]?[0-9]):([0-5]?[0-9])$/;
  return regex.test(time);
};

const createLocation = async (req, res) => {
  let pool;
  try {
    console.log("Đã nhận createLocation từ Flutter!");

    // Kiểm tra nếu body của request không tồn tại
    if (!req.body) {
      return res.status(400).json({ message: "Request body is missing" });
    }

    // Lấy dữ liệu từ request body
    const { LocationName, Latitude, Longitude, Radius, ShiftId } = req.body;

    // Kiểm tra các trường bắt buộc
    if (!LocationName || !Latitude || !Longitude || Radius === undefined || !ShiftId) {
      return res.status(400).json({ message: "Missing required fields" });
    }
 
    // In ra để kiểm tra dữ liệu
     
    console.log("Dữ liệu vị trí:", { LocationName, Latitude, Longitude, Radius, ShiftId });
 
    pool = await sql.connect(connection);
    console.log("Connecting to SQL Server Table Locations");

    const result = await pool.request()
      .input('LocationName', LocationName)
      .input('Latitude',Latitude) // Convert to float
      .input('Longitude', Longitude) // Convert to float
      .input('Radius', Radius)
      .input('ShiftId', ShiftId)
      .query(`
        INSERT INTO Locations (LocationName, Latitude, Longitude, Radius, ShiftId)
        VALUES (@LocationName, @Latitude, @Longitude, @Radius, @ShiftId)
      `);

    res.status(201).json({ message: "Location created successfully", locationId: result.rowsAffected[0] });
  } catch (error) {
    console.error("Lỗi khi tạo vị trí:", error);
    res.status(500).json({ message: "Lỗi Server", error: error.message });
  } finally {
    if (pool) {
      await pool.close();
    }
  }
};

const createWorkSchedules = async (req, res) => {
  let pool;
  try {
    console.log("Đã nhận createWorkSchedules từ Flutter!");

    if (!req.body) {
      return res.status(400).json({ message: "Request body is missing" });
    }

    const { UserId, ShiftId, StartDate, EndDate, DaysOfWeek } = req.body;

    if (!UserId || !ShiftId || !StartDate || !EndDate || !DaysOfWeek) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    // Chuyển đổi định dạng ngày từ dd/MM/yyyy sang yyyy-MM-dd
    const parseDate = (dateStr) => {
      const [day, month, year] = dateStr.split('/');
      return `${year}-${month}-${day}`;
    };

    const formattedStartDate = parseDate(StartDate);
    const formattedEndDate = parseDate(EndDate);
 // Loại bỏ dấu [] ở DaysOfWeek
 const formattedDaysOfWeek = DaysOfWeek.replace(/[\[\]]/g, '');

 console.log("Dữ liệu lịch làm việc:", { UserId, ShiftId, StartDate: formattedStartDate, EndDate: formattedEndDate, DaysOfWeek: formattedDaysOfWeek });

 pool = await sql.connect(connection);
 console.log("Connecting to SQL Server Table WorkSchedules");

 const result = await pool.request()
   .input('UserId', sql.Int, UserId)
   .input('ShiftId', sql.Int, ShiftId)
   .input('StartDate', sql.Date, formattedStartDate)
   .input('EndDate', sql.Date, formattedEndDate)
   .input('DaysOfWeek', sql.NVarChar(70), formattedDaysOfWeek)
      .query(`
        INSERT INTO WorkSchedules (UserId, ShiftId, StartDate, EndDate, DaysOfWeek)
        VALUES (@UserId, @ShiftId, @StartDate, @EndDate, @DaysOfWeek)
      `);

    res.status(201).json({ message: "Work schedule created successfully", scheduleId: result.rowsAffected[0] });
  } catch (error) {
    console.error("Lỗi khi tạo lịch làm việc:", error);
    res.status(500).json({ message: "Lỗi Server", error: error.message });
  } finally {
    if (pool) {
      await pool.close();
    }
  }
};


const getAllListShift = async (req, res) => {
  let pool;
  try {

    console.log("Đã nhận getAllListShift Flutter!");

    // Kết nối đến SQL Server
    pool = await sql.connect(connection);
    console.log("Connecting to SQL Server Table getUserListForAdmin");
    const result = await pool.request()
      .query(`
      SELECT * FROM Shifts 
      `);

    // Gửi dữ liệu theo định dạng JSON
    res.setHeader('Content-Type', 'application/json');
    res.json(result.recordset);
  } catch (error) {
    console.error("Lỗi khi truy vấn lịch chiếu:", error);
    res.status(500).json({ message: "Lỗi Server", error: error.message });
  } finally {
    if (pool) {
      await pool.close();
    }
  }
};

const getAllListLocation = async (req, res) => {
  let pool;
  try {

    console.log("Đã nhận getAllListLocation Flutter!");

    // Kết nối đến SQL Server
    pool = await sql.connect(connection);
    console.log("Connecting to SQL Server Table getUserListForAdmin");
    const result = await pool.request()
      .query(`

SELECT 
    l.LocationId,
    l.LocationName,
    l.Latitude,
    l.Longitude,
    l.Radius,
    l.ShiftId,
    s.ShiftName,
    s.StartTime,
    s.EndTime,
    s.IsCrossDay,
    s.CreateDate,
    s.Status
FROM 
    Locations l
JOIN 
    Shifts s ON l.ShiftId = s.ShiftId;
      `);

    // Gửi dữ liệu theo định dạng JSON
    res.setHeader('Content-Type', 'application/json');
    res.json(result.recordset);
  } catch (error) {
    console.error("Lỗi khi truy vấn lịch chiếu:", error);
    res.status(500).json({ message: "Lỗi Server", error: error.message });
  } finally {
    if (pool) {
      await pool.close();
    }
  }
};

const getAllWorkSchedulesByID = async (req, res) => {
  let pool;

  // Lấy các tham số từ body và chuyển đổi thành kiểu số nguyên
  const userId = parseInt(req.body.userId, 10); // INT
  const startDate = req.body.startDate; // Giữ nguyên kiểu chuỗi
  const endDate = req.body.endDate; // Giữ nguyên kiểu chuỗi

  try {
    console.log("Đã nhận getAllWorkSchedulesByID Flutter!");

    // Kết nối đến SQL Server
    pool = await sql.connect(connection);
   

    const result = await pool.request()
      .input('userId', sql.Int, userId) // Sử dụng giá trị số nguyên cho userId
      .input('startDate', sql.Date, startDate) // Sử dụng giá trị chuỗi cho startDate
      .input('endDate', sql.Date, endDate) // Sử dụng giá trị chuỗi cho endDate
      .query(`
        SELECT *
        FROM WorkSchedules
        WHERE UserId = @userId
          AND StartDate >= @startDate
          AND EndDate <= @endDate;
      `);

    // Gửi dữ liệu theo định dạng JSON
    res.setHeader('Content-Type', 'application/json');
    res.json(result.recordset);

  } catch (error) {
    console.error("Lỗi khi truy vấn lịch làm việc:", error);
    res.status(500).json({ message: "Lỗi Server", error: error.message });
  } finally {
    if (pool) {
      await pool.close();
    }
  }
};

const getShiftForAttendance = async (req, res) => {
  let pool;

  // Lấy các tham số từ body và chuyển đổi thành kiểu số nguyên
  const userId = parseInt(req.body.userId, 10); // INT
  const startDate = req.body.startDate; // Giữ nguyên kiểu chuỗi
  const endDate = req.body.endDate; // Giữ nguyên kiểu chuỗi
  const daysOfWeek = req.body.daysOfWeek; // Ký tự cần tìm trong DaysOfWeek

  try {
    console.log("Đã nhận getShiftForAttendance Flutter!");

    // Kết nối đến SQL Server
    pool = await sql.connect(connection);
    console.log("Connecting to SQL Server Table WorkSchedules");

    console.log("UserId:", userId);
    console.log("StartDate:", startDate);
    console.log("EndDate:", endDate);
    console.log("DaysOfWeek:", daysOfWeek);

    const result = await pool.request()
      .input('userId', sql.Int, userId) // Sử dụng giá trị số nguyên cho userId
      .input('startDate', sql.Date, startDate) // Sử dụng giá trị chuỗi cho startDate
      .input('endDate', sql.Date, endDate) // Sử dụng giá trị chuỗi cho endDate
      .input('daysOfWeek', sql.NVarChar, daysOfWeek) // Thêm input cho DaysOfWeek
      .query(`
        SELECT ws.*, s.ShiftName, s.StartTime, s.EndTime, l.LocationName, l.Latitude, l.Longitude, l.Radius
        FROM WorkSchedules ws
        JOIN Shifts s ON ws.ShiftId = s.ShiftId
        LEFT JOIN Locations l ON s.ShiftId = l.ShiftId
        WHERE ws.UserId = @userId
          AND ws.StartDate >= @startDate
          AND ws.EndDate <= @endDate
          AND ws.DaysOfWeek LIKE '%' + @daysOfWeek + '%'; -- Điều kiện cho DaysOfWeek
      `);

    // Gửi dữ liệu theo định dạng JSON
    res.setHeader('Content-Type', 'application/json');
    res.json(result.recordset);

  } catch (error) {
    console.error("Lỗi khi truy vấn lịch làm việc:", error);
    res.status(500).json({ message: "Lỗi Server", error: error.message });
  } finally {
    if (pool) {
      await pool.close();
    }
  }
};


const getAllIsCombo = async (req, res) => {
  console.log("Request received to fetch combo data!");

  let pool;
  try {
    // Kết nối đến SQL Server
    pool = await sql.connect(connection);
    console.log("Connected to database successfully");

    // Thực hiện truy vấn để lấy tất cả combo
    let result = await pool.request()
      .query(`       
 SELECT 
          ComboID,
          Title,
          Subtitle,
          Image,
          Quantity,
          Status,
          IsCombo,
          Price
        FROM ComBo
		WHERE IsCombo = 1
       
      `);


    res.status(200).json({
      success: true,
      data: result.recordset,
      message: "Combo data fetched successfully"
    });

  } catch (error) {
    console.error("Error fetching combo data:", error);
    res.status(500).json({ 
      success: false,
      message: "Internal Server Error", 
      error: error.message 
    });
  } finally {
    // Đóng kết nối
    if (pool) {
      await pool.close();
      console.log("Database connection closed");
    }
  }
};

const getAllIsNotCombo = async (req, res) => {
  console.log("Request received to fetch combo data!");

  let pool;
  try {
    // Kết nối đến SQL Server
    pool = await sql.connect(connection);
    console.log("Connected to database successfully");

    // Thực hiện truy vấn để lấy tất cả combo
    let result = await pool.request()
      .query(`       
 SELECT 
          ComboID,
          Title,
          Subtitle,
          Image,
          Quantity,
          Status,
          IsCombo,
          Price
        FROM ComBo
		WHERE IsCombo = 0     
      `);


    res.status(200).json({
      success: true,
      data: result.recordset,
      message: "Combo data fetched successfully"
    });

  } catch (error) {
    console.error("Error fetching combo data:", error);
    res.status(500).json({ 
      success: false,
      message: "Internal Server Error", 
      error: error.message 
    });
  } finally {
    // Đóng kết nối
    if (pool) {
      await pool.close();
      console.log("Database connection closed");
    }
  }
};



const updateShifts = async (req, res) => {
  let pool;
  try {
    console.log("Đã nhận updateShifts Flutter!");

    // Kiểm tra nếu body của request không tồn tại
    if (!req.body) {
      return res.status(400).json({ message: "Request body is missing" });
    }

    // Lấy dữ liệu từ request body
    const { ShiftId ,ShiftName, StartTime, EndTime, IsCrossDay, Status } = req.body;

    // Kiểm tra các trường bắt buộc
    if (!ShiftId || !ShiftName || !StartTime || !EndTime || IsCrossDay === undefined || !Status) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    // Định dạng lại StartTime và EndTime
    const startTimeFormatted = _formatTime(StartTime);
    const endTimeFormatted = _formatTime(EndTime);

    // In ra để kiểm tra định dạng thời gian
    console.log("Thời gian bắt đầu (formatted):", startTimeFormatted);
    console.log("Thời gian kết thúc (formatted):", endTimeFormatted);

    // Kiểm tra định dạng thời gian
    if (!isValidTimeFormat(startTimeFormatted) || !isValidTimeFormat(endTimeFormatted)) {
      return res.status(400).json({ message: "Invalid time format for StartTime or EndTime" });
    }

    pool = await sql.connect(connection);
    console.log("Connecting to SQL Server Table Shifts");

    const result = await pool.request()
    .input('ShiftId', ShiftId)
    .input('ShiftName', ShiftName)
    .input('StartTime', startTimeFormatted)
    .input('EndTime', endTimeFormatted)
    .input('IsCrossDay', IsCrossDay)
    .input('Status', Status) 
    .query(`
        UPDATE Shifts 
        SET ShiftName = @ShiftName,
            StartTime = @StartTime,
            EndTime = @EndTime,
            IsCrossDay = @IsCrossDay,
            Status = @Status
        WHERE ShiftId = @ShiftId
      `);

    res.status(201).json({ message: "Shift update successfully", shiftId: result.rowsAffected[0] });
  } catch (error) {
    console.error("Lỗi khi sửa ca làm:", error);
    res.status(500).json({ message: "Lỗi Server", error: error.message });
  } finally {
    if (pool) {
      await pool.close();
    }
  }
};

const removeShifts = async (req, res) => {
  let pool;
  try {
    console.log("Đã nhận removeShifts Flutter!");

    // Kiểm tra nếu body của request không tồn tại
    if (!req.body) {
      return res.status(400).json({ message: "Request body is missing" });
    }

    // Lấy dữ liệu từ request body
    const { ShiftId } = req.body;

    pool = await sql.connect(connection);
    console.log("Connecting to SQL Server Table Shifts");

    // Xóa các bản ghi trong bảng Attendance trước
    const deleteAttendance = await pool.request()
      .input('ShiftId', sql.Int, ShiftId)
      .query(`DELETE FROM Attendance WHERE ShiftId = @ShiftId`);
    console.log("Đã xóa các bản ghi liên quan trong bảng Attendance:", deleteAttendance.rowsAffected);

    // Xóa các bản ghi trong bảng WorkSchedules trước
    const deleteWorkSchedules = await pool.request()
      .input('ShiftId', sql.Int, ShiftId)
      .query(`DELETE FROM WorkSchedules WHERE ShiftId = @ShiftId`);
    console.log("Đã xóa các bản ghi liên quan trong bảng WorkSchedules:", deleteWorkSchedules.rowsAffected);

    // Xóa các bản ghi trong bảng Locations nếu cần
    const checkLocation = await pool.request()
      .input('ShiftId', sql.Int, ShiftId)
      .query(`
        SELECT COUNT(*) as count 
        FROM Locations 
        WHERE ShiftId = @ShiftId
      `);

    if (checkLocation.recordset[0].count > 0) {
      const deleteLocations = await pool.request()
        .input('ShiftId', sql.Int, ShiftId)
        .query(`DELETE FROM Locations WHERE ShiftId = @ShiftId`);
      console.log("Đã xóa các bản ghi liên quan trong bảng Locations:", deleteLocations.rowsAffected);
    }

    // Sau đó xóa từ bảng Shifts
    const deleteShift = await pool.request()
      .input('ShiftId', sql.Int, ShiftId)
      .query(`DELETE FROM Shifts WHERE ShiftId = @ShiftId`);

    if (deleteShift.rowsAffected[0] > 0) {
      res.status(200).json({ 
        message: "Shift deleted successfully",
        shiftId: ShiftId
      });
      console.log("Ca làm đã được xóa thành công:", deleteShift);
    } else {
      res.status(404).json({ message: "Shift not found" });
    }

  } catch (error) {
    console.error("Lỗi khi xóa ca làm:", error);
    res.status(500).json({ message: "Lỗi Server", error: error.message });
  } finally {
    if (pool) {
      await pool.close();
    }
  }
};




const updateLocationShifts = async (req, res) => {
  let pool;
  try {
    console.log("Đã nhận updateLocationShifts từ Flutter!");

    // Kiểm tra nếu body của request không tồn tại
    if (!req.body) {
      return res.status(400).json({ message: "Request body is missing" });
    }

    // Lấy dữ liệu từ request body
    const { LocationId ,LocationName, Latitude, Longitude, Radius, ShiftId } = req.body;

    // Kiểm tra các trường bắt buộc
    if (!LocationId || !LocationName || !Latitude || !Longitude || Radius === undefined || !ShiftId) {
      return res.status(400).json({ message: "Missing required fields" });
    }
 
    // In ra để kiểm tra dữ liệu
     
    console.log("Dữ liệu vị trí:", {LocationId, LocationName, Latitude, Longitude, Radius, ShiftId });
 
    pool = await sql.connect(connection);
    console.log("Connecting to SQL Server Table Locations");

    const result = await pool.request()
      .input('LocationId', LocationId)
      .input('LocationName', LocationName)
      .input('Latitude',Latitude) // Convert to float
      .input('Longitude', Longitude) // Convert to float
      .input('Radius', Radius)
      .input('ShiftId', ShiftId)
      .query(`
        UPDATE Locations 
        SET LocationName = @LocationName,
            Latitude = @Latitude,
            Longitude = @Longitude,
            Radius = @Radius,
            ShiftId = @ShiftId
        WHERE LocationId = @LocationId
      `);

    res.status(201).json({ message: "Location updated successfully", locationId: result.rowsAffected[0] });
  } catch (error) {
    console.error("Lỗi khi sửa vị trí:", error);
    res.status(500).json({ message: "Lỗi Server", error: error.message });
  } finally {
    if (pool) {
      await pool.close();
    }
  }
};

const removeLocationShifts = async (req, res) => {
  let pool;
  try {
    console.log("Đã nhận removeLocationShifts từ Flutter!");

    // Kiểm tra nếu body của request không tồn tại
    if (!req.body) {
      return res.status(400).json({ message: "Request body is missing" });
    }

    // Lấy LocationId từ request body
    const { LocationId } = req.body;

    // Kiểm tra LocationId có được cung cấp không
    if (!LocationId) {
      return res.status(400).json({ message: "LocationId is required" });
    }

    pool = await sql.connect(connection);
    console.log("Connecting to SQL Server Table Locations");

    // Kiểm tra LocationId có tồn tại không
    const checkLocation = await pool.request()
      .input('LocationId', sql.Int, LocationId)
      .query(`
        SELECT COUNT(*) as count 
        FROM Locations 
        WHERE LocationId = @LocationId
      `);

    if (checkLocation.recordset[0].count === 0) {
      return res.status(404).json({ message: "Location not found" });
    }

    // Lấy ShiftId từ Location để xóa các bản ghi liên quan trong WorkSchedules
    const getShiftId = await pool.request()
      .input('LocationId', sql.Int, LocationId)
      .query(`
        SELECT ShiftId 
        FROM Locations 
        WHERE LocationId = @LocationId
      `);

    const { ShiftId } = getShiftId.recordset[0];

    // Xóa các bản ghi trong WorkSchedules liên quan đến ShiftId
    await pool.request()
      .input('ShiftId', sql.Int, ShiftId)
      .query(`
        DELETE FROM WorkSchedules 
        WHERE ShiftId = @ShiftId
      `);

    console.log(`Đã xóa các lịch làm việc liên quan đến ShiftId: ${ShiftId}`);

    // Xóa location từ bảng Locations
    const deleteLocation = await pool.request()
      .input('LocationId', sql.Int, LocationId)
      .query(`DELETE FROM Locations WHERE LocationId = @LocationId`);

    if (deleteLocation.rowsAffected[0] > 0) {
      res.status(200).json({ 
        message: "Location deleted successfully", 
        locationId: LocationId,
        affectedRows: deleteLocation.rowsAffected[0]
      });
    } else {
      res.status(400).json({ message: "Failed to delete location" });
    }

  } catch (error) {
    console.error("Lỗi khi xóa địa điểm:", error);
    res.status(500).json({ 
      message: "Lỗi Server", 
      error: error.message 
    });
  } finally {
    if (pool) {
      await pool.close();
    }
  }
};

const checkUsername = async (req, res) => {
  let pool;
  try {
    console.log("Đã nhận checkUsername Flutter!");

    // Kiểm tra nếu body của request không tồn tại
    if (!req.body) {
      return res.status(400).json({ message: "Request body is missing" });
    }

    // Lấy dữ liệu từ request body
    const { UserName } = req.body;

    // Kiểm tra các trường bắt buộc
    if (!UserName) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    pool = await sql.connect(connection);
    console.log("Connecting to SQL Server Table Users");

    // Thực hiện truy vấn
    const result = await pool.request()
      .input('UserName', sql.VarChar, UserName)
      .query(`
        SELECT UserName 
        FROM Users 
        WHERE UserName = @UserName
      `);

    // Kiểm tra kết quả trả về từ truy vấn
    if (result.recordset.length > 0) {
      // Nếu UserName tồn tại
      res.status(200).json({ message: "UserName found", userName: result.recordset[0].UserName });
    } else {
      // Nếu UserName không tồn tại
      res.status(404).json({ message: "UserName not found" });
      console.log("Không tìm thấy username:", UserName);
    }
  } catch (error) {
    console.error("Lỗi khi tìm username:", error);
    res.status(500).json({ message: "Lỗi Server", error: error.message });
  } finally {
    if (pool) {
      await pool.close();
    }
  }
};

const updateWorkSchedules = async (req, res) => {
  let pool;
  try {
    console.log("Đã nhận updateWorkSchedules từ Flutter!");
  
    if (!req.body) {
      return res.status(400).json({ message: "Request body is missing" });
    }

    const { ScheduleId, StartDate, EndDate, DaysOfWeek } = req.body;

    if (!ScheduleId || !StartDate || !EndDate || !DaysOfWeek) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    const parseDate = (dateStr) => {
      const [day, month, year] = dateStr.split('/');
      return `${year}-${month}-${day}`;
    };

    const formattedStartDate = parseDate(StartDate);
    const formattedEndDate = parseDate(EndDate);

    const formattedDaysOfWeek = DaysOfWeek.replace(/[\[\]]/g, '');

    console.log("Dữ liệu lịch làm việc:", { ScheduleId, StartDate: formattedStartDate, EndDate: formattedEndDate, DaysOfWeek: formattedDaysOfWeek });

    pool = await sql.connect(connection);
    console.log("Connecting to SQL Server Table WorkSchedules");

    const result = await pool.request()
      .input('ScheduleId', sql.Int, ScheduleId)
      .input('StartDate', sql.Date, formattedStartDate)
      .input('EndDate', sql.Date, formattedEndDate)
      .input('DaysOfWeek', sql.NVarChar(70), formattedDaysOfWeek)
      .query(`
        UPDATE WorkSchedules
        SET StartDate = @StartDate,
            EndDate = @EndDate,
            DaysOfWeek = @DaysOfWeek
        WHERE ScheduleId = @ScheduleId
      `);

    if (result.rowsAffected[0] > 0) {
      res.status(200).json({ message: "Work schedule updated successfully" });
      console.log("Lịch làm việc đã được sửa thành công:", result);
    } else {
      res.status(404).json({ message: "Work schedule not found or no changes made" });
    }
  } catch (error) {
    console.error("Lỗi khi sửa lịch làm việc:", error);
    res.status(500).json({ message: "Lỗi Server", error: error.message });
  } finally {
    if (pool) {
      await pool.close();
    }
  }
};

const getFilmFavourire = async (req, res) => {
  console.log("sendFavourire");

  // Lấy userId từ req.params
  const userId = parseInt(req.params.userId);
  if (isNaN(userId)) {
    return res.status(400).json({ message: "Invalid or missing userId in params" });
  }

  console.log("Đã nhận UserID từ Flutter!");
  console.log(`UserID: ${userId}`);

  let pool;
  try {
    // Kết nối đến SQL Server
    pool = await sql.connect(connection);
    console.log("Đã kết nối database");

    // Thực hiện truy vấn để lấy dữ liệu từ bảng Favourite
    let result = await pool.request() 
      .input('userId', sql.Int, userId)
      .query(`
        SELECT u.UserId, m.MovieID, m.Title, m.PosterUrl 
        FROM Favourite f 
        JOIN Users u ON u.UserId = f.UserId
        JOIN Movies m ON m.MovieID = f.MovieID
        WHERE f.UserId = @userId
      `);

    // Trả về kết quả truy vấn
    res.status(200).json({
      data: result.recordset,
    });

    console.log("Data fetched successfully");
  } catch (error) {
    console.error("Error fetching data:", error);
    res.status(500).json({ message: "Internal Server Error", error: error.message });
  } finally {
    if (pool) {
      await pool.close();
    }
  }
};




const createMomoPayment = async (req, res) => {
  try {
      const { amount, orderId, orderInfo } = req.body;

      // Create signature
      const rawSignature = `accessKey=${momoConfig.MOMO_ACCESS_KEY}&amount=${amount}&extraData=&ipnUrl=${momoConfig.IPN_URL}&orderId=${orderId}&orderInfo=${orderInfo}&partnerCode=${momoConfig.MOMO_PARTNER_CODE}&redirectUrl=${momoConfig.REDIRECT_URL}&requestId=${orderId}&requestType=${momoConfig.REQUEST_TYPE}`;
      
      const signature = crypto
          .createHmac('sha256', momoConfig.MOMO_SECRET_KEY)
          .update(rawSignature)
          .digest('hex');

      // Create payload for MoMo
      const requestBody = {
          partnerCode: momoConfig.MOMO_PARTNER_CODE,
          accessKey: momoConfig.MOMO_ACCESS_KEY,
          partnerName: "Test",
          storeId: "MomoTestStore",
          requestId: orderId,
          amount: amount,
          orderId: orderId,
          orderInfo: orderInfo,
          redirectUrl: momoConfig.REDIRECT_URL,
          ipnUrl: momoConfig.IPN_URL,
          requestType: momoConfig.REQUEST_TYPE,
          extraData: "",
          signature: signature
      };

      // Call MoMo API
      const response = await axios.post(momoConfig.MOMO_ENDPOINT, requestBody);

      // Return payUrl to client
      res.status(200).json({
          payUrl: response.data.payUrl
      });

  } catch (error) {
      console.error("Error creating MoMo payment:", error);
      res.status(500).json({ message: "Server Error", error: error.message });
  }
};
const paymentStatus = {}; // Khởi tạo object lưu trạng thái thanh toán

const momoCallback = async (req, res) => {
  console.log("MoMo callback received!");

  try {
    // Lấy các tham số từ query string (đối với yêu cầu GET)
    const { orderId, resultCode } = req.query;

    // Kiểm tra trạng thái thanh toán
    if (resultCode === '0') {
      paymentStatus[orderId] = "success"; // Lưu trạng thái thành công
      return res.status(200).json({ message: "Payment successful" });
    } else {
      paymentStatus[orderId] = "failed"; // Lưu trạng thái thất bại
      return res.status(400).json({ message: "Payment failed" });
    }

  } catch (error) {
    console.error("Error handling MoMo callback:", error);
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};


const checkTransactionStatus = async (req, res) => {
  try {
    const { orderId } = req.query;

    if (!orderId) {
      return res.status(400).json({
        success: false,
        message: "OrderId is required"
      });
    }

    // Tạo requestId mới cho mỗi lần check
    const requestId = `${orderId}_${Date.now()}`;

    // Tạo chuỗi signature theo format của MoMo
    const rawSignature = `accessKey=${momoConfig.MOMO_ACCESS_KEY}&orderId=${orderId}&partnerCode=${momoConfig.MOMO_PARTNER_CODE}&requestId=${requestId}`;

    // Tạo signature với HMAC SHA256
    const signature = crypto
      .createHmac('sha256', momoConfig.MOMO_SECRET_KEY)
      .update(rawSignature)
      .digest('hex');

    // Tạo payload cho API check status của MoMo
    const requestBody = {
      partnerCode: momoConfig.MOMO_PARTNER_CODE,
      accessKey: momoConfig.MOMO_ACCESS_KEY,
      requestId: requestId,
      orderId: orderId,
      signature: signature
    };

    // Gọi API check status của MoMo
    const response = await axios.post(
      momoConfig.MOMO_STATUS_ENDPOINT, // Đổi đường dẫn ở đây
      requestBody
    );

    // Xử lý response từ MoMo
    const transactionStatus = response.data;

    // Map các mã trạng thái từ MoMo
    let status;
    switch (transactionStatus.resultCode) {
      case 0: // Giao dịch thành công
        status = "success";
        break;
      case 1006: // Giao dịch thất bại
        status = "failed";
        break;
      case 1003: // Giao dịch đang xử lý
      case 1004: // Giao dịch bị từ chối
        status = "pending";
        break;
      default:
        status = "unknown";
    }

    // Lưu trạng thái vào paymentStatus object
    paymentStatus[orderId] = status;

    // Tạo response
    const responseData = {
      success: true,
      orderId: orderId,
      amount: transactionStatus.amount,
      transactionId: transactionStatus.transId || null,
      status: status,
      message: transactionStatus.message,
      payType: transactionStatus.payType || null,
      responseTime: transactionStatus.responseTime
    };

    return res.status(200).json(responseData);

  } catch (error) {
    console.error("Error checking MoMo transaction status:", error);
    
    if (error.response && error.response.data) {
      return res.status(400).json({
        success: false,
        message: "MoMo API Error",
        error: error.response.data
      });
    }

    return res.status(500).json({
      success: false,
      message: "Server Error",
      error: error.message
    });
  }
};

const getActor = async (req, res) => {
  console.log("Request received to fetch actor and movie data!");

  let pool;
  try {
    // Kết nối đến SQL Server
    pool = await sql.connect(connection);
    console.log("Connected to database successfully");

    // Thực hiện truy vấn để lấy thông tin diễn viên và movie ID
    let result = await pool.request()
      .query(`       
        SELECT 
          A.Name,
          A.Image,
          M.MovieID  -- Lấy MovieID từ bảng Movies
        FROM 
          Actors A
        JOIN 
          MovieActors MA ON A.ActorID = MA.ActorID
        JOIN 
          Movies M ON MA.MovieID = M.MovieID;
      `);

    console.log('Fetched actor and movie data:', result.recordset);

    res.status(200).json({
      success: true,
      data: result.recordset,
      message: "Actor and movie data fetched successfully"
    });

  } catch (error) {
    console.error("Error fetching actor and movie data:", error);
    res.status(500).json({ 
      success: false,
      message: "Internal Server Error", 
      error: error.message 
    });
  } finally {
    // Đóng kết nối
    if (pool) {
      await pool.close();
      console.log("Database connection closed");
    }
  }
};

const updateSatusBuyTicketInfo = async (req, res) => {
  let pool;
  try {
    console.log("Đã nhận updateSatusBuyTicketInfo Flutter!");

    // Lấy BuyTicketId từ query string
    const { BuyTicketId } = req.query;

    // Kiểm tra nếu BuyTicketId không tồn tại
    if (!BuyTicketId) {
      return res.status(400).json({ message: "BuyTicketId is missing in query" });
    }

    pool = await sql.connect(connection);
    console.log("Connecting to SQL Server Table BuyTicketInfo");

    const result = await pool.request()
      .input('BuyTicketId', sql.VarChar, BuyTicketId) // Đảm bảo kiểu dữ liệu tương ứng
      .query(`
        UPDATE BuyTicketInfo 
        SET Status = 'Đã thanh toán'
        WHERE BuyTicketId = @BuyTicketId
      `);

    res.status(200).json({ message: "successfully" });
  } catch (error) {
    console.error("Lỗi khi sửa trạng thái:", error);
    res.status(500).json({ message: "Lỗi Server", error: error.message });
  } finally {
    if (pool) {
      await pool.close();
    }
  }
};



module.exports = {
  getHomepage,
  findByViewID,
  sendEmail, // Xuất hàm sendEmail
  createAccount,
  getConversations,
  getMoviesDangChieu,
  getMoviesSapChieu,
  findByViewMovieID,
  addFavourire,
  removeFavourire,
  getAllUserData,
  getShowtime,
  getChair,
  insertBuyTicket,
  getShowtimeListForAdmin,
  uploadImage,
  createFilm,
  getUserListForAdmin,
  createShifts,
  getAllListShift,
  getAllListLocation,
  createLocation,
  createWorkSchedules,
  getAllWorkSchedulesByID,
  getShiftForAttendance,
  getAllIsCombo,
  getAllIsNotCombo,
  updateShifts,
  removeShifts,
  updateLocationShifts,
  removeLocationShifts,
  checkUsername, 
  updateWorkSchedules, 
  findByViewIDUser,
  getFilmFavourire, 
  createMomoPayment, 
  momoCallback,
  checkTransactionStatus,
  getActor,
  updateSatusBuyTicketInfo,
};