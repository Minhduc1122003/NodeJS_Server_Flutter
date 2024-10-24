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
      .input('photo', null)
      .input('createDate', sql.DateTime, currentDate)
      .input('updateDate', sql.DateTime, currentDate)
      .input('updateBy', 0) // Assuming the creator is the initial updater
      .input('status', 'Đang hoạt động') // Default status
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
    console.log("Connecting to SQL Server Table Showtime");

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
    console.log("Kết quả truy vấn:", result.recordset);

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
  console.log("Đã nhận showTimeID và CinemaRoomID từ Flutter!");
  console.log(`showTimeID: ${showTimeID}, cinemaRoomID: ${cinemaRoomID}`);

  let pool;
  try {
    // Kết nối đến SQL Server
    pool = await sql.connect(connection);
    console.log("Đã kết nối database");

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
    console.log(result); 
    console.log("(:)====||===================================>");
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
    // Get values from the request body
    const buyTicketId = parseInt(req.body.buyTicketId, 10); // INT
    const userId = parseInt(req.body.userId, 10); // INT
    const movieId = parseInt(req.body.movieId, 10); // INT
    const quantity = parseInt(req.body.quantity, 10); // INT
    const totalPrice = parseFloat(req.body.totalPrice); // FLOAT
    const showtimeId = parseInt(req.body.showtimeId, 10); // INT
    const seatIDs = req.body.seatIDs; // Giả sử seatIDs là mảng
    const seatIDsString = Array.isArray(seatIDs) ? seatIDs.join(',') : seatIDs; // Chuyển thành chuỗi
    
    console.log("buyTicketId:", buyTicketId);
    console.log("UserId:", userId);
    console.log("MovieId:", movieId);
    console.log("Quantity:", quantity);
    console.log("TotalPrice:", totalPrice);
    console.log("ShowtimeId:", showtimeId);
    console.log("SeatIDs:", seatIDs);

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
    console.log("Kết quả truy vấn:", result.recordset);

  } catch (error) {
    console.error("Lỗi khi truy vấn lịch chiếu:", error);
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

    console.log("Đã nhận getShowtimeListForAdmin Flutter!");

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
    console.log("Kết quả truy vấn getShowtimeListForAdmin:", result.recordset);
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
    
    console.log("buyTicketId:", buyTicketId);
    console.log("UserId:", userId);
    console.log("MovieId:", movieId);
    console.log("Quantity:", quantity);
    console.log("TotalPrice:", totalPrice);
    console.log("ShowtimeId:", showtimeId);
    console.log("SeatIDs:", seatIDs);

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
    console.log("Kết quả truy vấn:", result.recordset);

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
    console.log("Kết quả truy vấn getUserListForAdmin:", result.recordset);
  } catch (error) {
    console.error("Lỗi khi truy vấn lịch chiếu:", error);
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
};