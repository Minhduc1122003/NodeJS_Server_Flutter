
/* store -------------------------------------------------*/

-- Ngân-Store phim sắp chiếu
USE [APP_MOVIE_TICKET]
GO
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE PROCEDURE [dbo].[getMoviesSapChieu] 
AS
BEGIN
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

END


-- Ngan-store findByViewMovieID

USE [APP_MOVIE_TICKET]
GO
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE PROCEDURE [dbo].[findByViewMovieID] (
@movieId int = null, @userId int = null
)
AS
BEGIN
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


END

-- duc Store: 
CREATE PROCEDURE InsertBuyTicket
    @UserId INT,
    @MovieID INT,
    @Quantity INT,
    @TotalPrice FLOAT,
    @ShowtimeID INT,
    @SeatIDs NVARCHAR(MAX) -- List of SeatIDs as a comma-separated string
AS
BEGIN
    SET NOCOUNT ON;

    DECLARE @BuyTicketId INT;

    -- Insert into BuyTicket
    INSERT INTO BuyTicket (UserId, MovieID)
    VALUES (@UserId, @MovieID);

    -- Get the generated BuyTicketId
    SET @BuyTicketId = SCOPE_IDENTITY();

    -- Insert into BuyTicketInfo
    INSERT INTO BuyTicketInfo (BuyTicketId, Quantity, CreateDate, TotalPrice, ShowtimeID)
    VALUES (@BuyTicketId, @Quantity, GETDATE(), @TotalPrice, @ShowtimeID);

    -- Insert into TicketSeat and SeatReservation
    DECLARE @SeatID INT;
    DECLARE @pos INT;

    -- Split the comma-separated list of SeatIDs
    WHILE LEN(@SeatIDs) > 0
    BEGIN
        SET @pos = CHARINDEX(',', @SeatIDs);
        IF @pos = 0
        BEGIN
            SET @SeatID = CAST(@SeatIDs AS INT);
            SET @SeatIDs = ''; -- Remove the processed SeatID
        END
        ELSE
        BEGIN
            SET @SeatID = CAST(LEFT(@SeatIDs, @pos - 1) AS INT);
            SET @SeatIDs = STUFF(@SeatIDs, 1, @pos, ''); -- Remove the processed SeatID
        END

        -- Insert into TicketSeat
        INSERT INTO TicketSeat (BuyTicketId, SeatID)
        VALUES (@BuyTicketId, @SeatID);

        -- Insert into SeatReservation
        INSERT INTO SeatReservation (ShowtimeID, SeatID, Status)
        VALUES (@ShowtimeID, @SeatID, 1); -- Assuming Status is 1 for reserved
    END
END
GO



-- Ngan Store: 
USE [APP_MOVIE_TICKET]
GO
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE PROCEDURE [dbo].[addFavourite]
    @movieId int = null, 
    @userId int = null
AS
BEGIN
    INSERT INTO Favourite (MovieID, UserId) 
    VALUES (@movieId, @userId);
END
GO







-- Phuc Store:
GO
USE [APP_MOVIE_TICKET]
GO
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE PROCEDURE [dbo].[getMoviesDangChieu] 
AS
BEGIN
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
END
GO




--Hyn Store: findDetailsByBuyTicketId
USE [APP_MOVIE_TICKET]
GO
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE PROCEDURE [dbo].[findDetailsByBuyTicketId] 
@BuyTicketId INT
AS
BEGIN
SELECT 
    bt.BuyTicketId, 
    bt.UserId, 
    bt.MovieID, 
    mv.Title,
    bti.Quantity, 
    bti.CreateDate, 
    bti.TotalPrice,
    STRING_AGG(ss.ChairCode, ', ') AS Seats,  -- Gộp các ChairCode thành một chuỗi
    st.ShowtimeDate,                          -- Ngày chiếu từ bảng Showtime
    st.StartTime AS StartTime,                -- Lấy thời gian chiếu từ bảng Showtime
    mv.Price AS TicketPrice,                  -- Đơn giá của vé từ bảng Movies
    mv.SubTitle,                              -- Thêm thông tin phụ đề
    mv.Voiceover,                             -- Thêm thông tin lòng tiếng
    cr.CinemaRoomID,                          -- Thêm thông tin phòng chiếu
    c.CinemaName                              -- Thêm thông tin tên rạp
FROM 
    BuyTicket bt
JOIN 
    BuyTicketInfo bti ON bt.BuyTicketId = bti.BuyTicketId
JOIN 
    TicketSeat ts ON bt.BuyTicketId = ts.BuyTicketId
JOIN 
    Seats ss ON ts.SeatID = ss.SeatID  -- Lấy tên ghế từ bảng Seats
JOIN 
    Showtime st ON bti.ShowtimeID = st.ShowtimeID  -- Kết nối với bảng Showtime
JOIN 
    CinemaRoom cr ON st.CinemaRoomID = cr.CinemaRoomID  -- Kết nối với bảng CinemaRoom
JOIN 
    Cinemas c ON cr.CinemaID = c.CinemaID  -- Kết nối với bảng Cinemas
JOIN 
    Movies mv ON st.MovieID = mv.MovieID -- Kết nối với bảng Movie
	WHERE bt.BuyTicketId = @BuyTicketId 
GROUP BY 
    bt.BuyTicketId, 
    bt.UserId, 
    bt.MovieID, 
    bti.Quantity, 
    bti.CreateDate, 
    bti.TotalPrice,
    st.ShowtimeDate,  
    st.StartTime, 
    mv.Title,
    mv.Price,         
    mv.SubTitle,      
    mv.Voiceover,
    cr.CinemaRoomID,  -- Thêm vào GROUP BY
    c.CinemaName;     -- Thêm vào GROUP BY

END
GO

