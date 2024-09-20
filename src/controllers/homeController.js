const connection = require("../config/database");
const sql = require("mssql");
const nodemailer = require("nodemailer");
require("dotenv").config();
const crypto = require('crypto');


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
      console.log("data:", result.recordset[0]);
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
  console.log("Flutter has requested to create an account!");

  if (!req.body) {
    return res.status(400).json({ message: "Request body is missing" });
  }

  const { email, password, username, fullname, phoneNumber, photo } = req.body;
  console.log("Received account creation data from Flutter:", { email, username, fullname, phoneNumber });

  let pool;
  try {
    pool = await sql.connect(connection);
    console.log("Connected to database");

    const currentDate = new Date().toISOString();

    let result = await pool.request()
      .input('username', sql.VarChar(50), username)
      .input('password', sql.VarChar(55), password)
      .input('email', sql.VarChar(155), email)
      .input('fullname', sql.NVarChar(155), fullname)
      .input('phoneNumber', sql.Int, phoneNumber)
      .input('photo', sql.VarChar(50), photo)
      .input('createDate', sql.DateTime, currentDate)
      .input('updateDate', sql.DateTime, currentDate)
      .input('updateBy', sql.VarChar(50), username) // Assuming the creator is the initial updater
      .input('status', sql.NVarChar(20), 'Active') // Default status
      .query(`
        INSERT INTO Users (UserName, Password, Email, FullName, PhoneNumber, Photo, Role, CreateDate, UpdateDate, UpdateBy, Status, IsDelete)
        VALUES (@username, @password, @email, @fullname, @phoneNumber, @photo, 0, @createDate, @updateDate, @updateBy, @status, 0)
      `);

    console.log('User creation result:', result);

    if (result.rowsAffected[0] > 0) {
      res.status(200).json({ message: "Account created successfully" });
      console.log("Account created:", { username, email });
    } else {
      res.status(400).json({ message: "Account creation failed" });
      console.log("Account creation failed");
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
  console.log("Đã nhận dữ liệu truy vấn từ Flutter!");
  console.log(`Username: ${username}`);

  let pool;
  try {
    // Kết nối đến SQL Server
    pool = await sql.connect(connection);
    console.log("Đã kết nối database");

    // Thực hiện truy vấn để lấy tất cả người dùng trừ user có `username` đã cho
    let result = await pool.request()
      .input('username', sql.VarChar, username)
      .query(`
        SELECT * FROM Users WHERE UserName != @username
      `);

    console.log('Fetched users data:', result.recordset);

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
    m.SubTitle, -- Bao gồm trường SubTitle
    m.Voiceover, -- Bao gồm trường Voiceover
    a.Value AS Age, -- Giá trị độ tuổi từ bảng Age
    STRING_AGG(g.GenreName, ', ') AS Genres, -- Thể loại phim kết hợp từ bảng Genre
    c.CinemaName,
    c.Address AS CinemaAddress,
    STRING_AGG(r.Content, ' | ') AS ReviewContents, -- Đánh giá phim kết hợp thành chuỗi
    ROUND(AVG(r.Rating), 2) AS AverageRating, -- Đánh giá trung bình
    COUNT(r.IdRate) AS ReviewCount -- Số lượng đánh giá
FROM 
    Movies m
LEFT JOIN 
    Age a ON m.AgeID = a.AgeID -- Thay đổi join với bảng Age
LEFT JOIN 
    Cinemas c ON m.CinemaID = c.CinemaID
LEFT JOIN 
    MovieGenre mg ON m.MovieID = mg.MovieID
LEFT JOIN 
    Genre g ON mg.IdGenre = g.IdGenre
LEFT JOIN  
    Rate r ON m.MovieID = r.MovieID
WHERE 
    m.StatusMovie = N'Đang chiếu' -- Thêm điều kiện lọc theo trạng thái phim
GROUP BY 
    m.MovieID, m.Title, m.Description, m.Duration, m.ReleaseDate, 
    m.PosterUrl, m.TrailerUrl, m.SubTitle, m.Voiceover, -- Bao gồm các trường SubTitle và Voiceover
    a.Value, 
    c.CinemaName, 
    c.Address;


    `);

    // Gửi dữ liệu theo định dạng JSON tự động với format dễ đọc
    res.setHeader('Content-Type', 'application/json');
    res.send(JSON.stringify(result.recordset, null, 2)); // Indent with 2 spaces for readability
    console.log(result.recordset);

    console.log("Clients have connected");
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
    m.SubTitle, -- Bao gồm trường SubTitle
    m.Voiceover, -- Bao gồm trường Voiceover
    a.Value AS Age, -- Giá trị độ tuổi từ bảng Age
    STRING_AGG(g.GenreName, ', ') AS Genres, -- Thể loại phim kết hợp từ bảng Genre
    c.CinemaName,
    c.Address AS CinemaAddress,
    STRING_AGG(r.Content, ' | ') AS ReviewContents, -- Đánh giá phim kết hợp thành chuỗi
    ROUND(AVG(r.Rating), 2) AS AverageRating, -- Đánh giá trung bình
    COUNT(r.IdRate) AS ReviewCount -- Số lượng đánh giá
FROM 
    Movies m
LEFT JOIN 
    Age a ON m.AgeID = a.AgeID -- Thay đổi join với bảng Age
LEFT JOIN 
    Cinemas c ON m.CinemaID = c.CinemaID
LEFT JOIN 
    MovieGenre mg ON m.MovieID = mg.MovieID
LEFT JOIN 
    Genre g ON mg.IdGenre = g.IdGenre
LEFT JOIN  
    Rate r ON m.MovieID = r.MovieID
WHERE 
    m.StatusMovie = N'Sắp chiếu' -- Thêm điều kiện lọc theo trạng thái phim
GROUP BY 
    m.MovieID, m.Title, m.Description, m.Duration, m.ReleaseDate, 
    m.PosterUrl, m.TrailerUrl, m.SubTitle, m.Voiceover, -- Bao gồm các trường SubTitle và Voiceover
    a.Value, 
    c.CinemaName, 
    c.Address;


    `);

    // Gửi dữ liệu theo định dạng JSON tự động với format dễ đọc
    res.setHeader('Content-Type', 'application/json');
    res.send(JSON.stringify(result.recordset, null, 2)); // Indent with 2 spaces for readability
    console.log(result.recordset);

    console.log("Clients have connected");
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
    console.log("Đã kết nối database");

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
    a.Value AS Age, -- Thay thế LanguageName bằng Age
    m.SubTitle, -- Bao gồm trường SubTitle
    m.Voiceover, -- Bao gồm trường Voiceover
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
LEFT JOIN 
    Age a ON m.AgeID = a.AgeID -- Thay đổi join với bảng Age
WHERE 
    m.MovieID = @movieId
GROUP BY 
    m.MovieID, m.Title, m.Description, m.Duration, m.ReleaseDate, 
    m.PosterUrl, m.TrailerUrl, m.SubTitle, m.Voiceover, -- Bao gồm SubTitle và Voiceover
    a.Value, -- Bao gồm Age
    c.CinemaName, 
    c.Address, 
    f.MovieID;



      `);

    // Kiểm tra xem có dữ liệu phim nào không
    if (result.recordset.length > 0) {
      res.status(200).json({ message: "Movie found", movie: result.recordset[0] });
      console.log("Movie data:", result.recordset[0]);
    } else {
      res.status(404).json({ message: "Movie not found" });
      console.log("Không tìm thấy phim");
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
  console.log("Đã nhận MovieID và UserID từ Flutter!");
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

    // Trả về phản hồi thành công
    res.status(200).json({ message: "Favourite added successfully" });
    console.log("Favourite added successfully");

  } catch (error) {
    console.error("Error adding favourite:", error);
    res.status(500).json({ message: "Internal Server Error", error: error.message });
  } finally {
    // Đóng kết nối
    if (pool) {
      await pool.close(); // Đóng pool
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
  console.log("Đã nhận MovieID và UserID từ Flutter!");
  console.log(`MovieID: ${movieId}, UserID: ${userId}`);

  let pool;
  try {
    // Kết nối đến SQL Server
    pool = await sql.connect(connection);
    console.log("Đã kết nối database");

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


module.exports = {
  getHomepage,
  findByViewID,
  sendEmail, // Xuất hàm sendEmail
  createAccount,
  getConversations,

  getMoviesDangChieu,getMoviesSapChieu,
  findByViewMovieID,addFavourire,removeFavourire,getAllUserData
};