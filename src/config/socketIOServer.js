const sql = require('mssql'); // Import thư viện mssql
const connection = require('./database'); // Đường dẫn đến file cấu hình cơ sở dữ liệu

module.exports = (server) => {
  const io = require('socket.io')(server);

  io.on('connection', (socket) => {
    console.log('New client connected SOCKET.IO');

    socket.on('message', async (data) => {
      let pool;
      try {
        pool = await sql.connect(connection);
    
        // Kiểm tra xem cuộc trò chuyện đã tồn tại chưa
        let conversationId;
        let result = await pool.request()
          .input('User1Id', sql.Int, data.senderId)
          .input('User2Id', sql.Int, data.receiverId)
          .query(`
            SELECT Id FROM Conversations
            WHERE ((User1Id = @User1Id AND User2Id = @User2Id)
               OR (User1Id = @User2Id AND User2Id = @User1Id))
              AND (@User1Id != @User2Id) -- Kiểm tra để không cho phép tạo cuộc trò chuyện giữa cùng một UserId
          `);
    
        if (result.recordset.length > 0) {
          // Cuộc trò chuyện đã tồn tại
          conversationId = result.recordset[0].Id;
        } else {
          // Cuộc trò chuyện chưa tồn tại, tạo mới
          result = await pool.request()
            .input('User1Id', sql.Int, data.senderId)
            .input('User2Id', sql.Int, data.receiverId)
            .query(`
              INSERT INTO Conversations (User1Id, User2Id, StartedAt)
              VALUES (@User1Id, @User2Id, GETDATE())
              SELECT SCOPE_IDENTITY() AS ConversationId
            `);
    
          conversationId = result.recordset[0].ConversationId;
        }
    
        // Lưu tin nhắn vào cơ sở dữ liệu
        await pool.request()
          .input('ConversationId', sql.Int, conversationId)
          .input('SenderId', sql.Int, data.senderId)
          .input('ReceiverId', sql.Int, data.receiverId)
          .input('Message', sql.NVarChar(255), data.message)
          .query(`
            INSERT INTO Messages (ConversationId, SenderId, ReceiverId, Message, SentAt)
            VALUES (@ConversationId, @SenderId, @ReceiverId, @Message, GETDATE())
          `);
    
        // Phát tin nhắn tới client khác
        io.emit('message', data);
      } catch (err) {
        console.error('Failed to save message:', err);
      } finally {
        if (pool) {
          await pool.close(); // Đóng pool
        }
      }
    });
    

     // Lắng nghe sự kiện reconnect (Nếu bạn muốn)
     socket.on('reconnect', (attempt) => {
      console.log('Client reconnected on attempt', attempt);
    });

    socket.on('reconnect_error', (error) => {
      console.log('Reconnect error:', error);
    });

    socket.on('reconnect_attempt', (attempt) => {
      console.log('Reconnect attempt #', attempt);
    });

    socket.on('disconnect', () => {
      console.log('Client disconnected');
    });

    socket.on('getMessageChat', async (data) => {
      const { id } = data; // Id của cuộc trò chuyện
      console.log('User wants to getMessageChat on SOCKET.IO');
      let pool;
      try {
        pool = await sql.connect(connection);
    
        // Truy vấn để lấy tất cả tin nhắn của cuộc trò chuyện với ConversationId cụ thể
        const result = await pool.request()
          .input('ConversationId', sql.Int, id)
          .query(`
            SELECT * FROM Messages
            WHERE ConversationId = @ConversationId
            ORDER BY SentAt ASC
          `);
        
        console.log('Server response:', result.recordset);
    
        // Gửi dữ liệu tin nhắn về client
        socket.emit('messageChatData', result.recordset);
      } catch (err) {
        console.error('Error fetching messages:', err);
        socket.emit('messageChatError', { error: 'Error fetching messages' });
      } finally {
        if (pool) {
          await pool.close(); // Đóng pool
        }
      }
    });
  });

};
