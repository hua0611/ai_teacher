const path = require('path');
const fs = require('fs');
const express = require('express');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const cors = require('cors');

const app = express();
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

// 中間件設置
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// JWT 驗證中間件
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ success: false, message: '未提供驗證令牌' });
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ success: false, message: '令牌無效' });
    }
    req.user = user;
    next();
  });
};

// 路由處理
app.post('/api/auth/login', async (req, res) => {
  const { username, password } = req.body;
  
  try {
    const users = JSON.parse(fs.readFileSync(usersFile, 'utf8'));
    const user = users.find(u => u.username === username);

    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({ success: false, message: '帳號或密碼錯誤' });
    }

    const token = jwt.sign(
      { userId: user.userID, userType: user.userType },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.json({
      success: true,
      token,
      userType: user.userType
    });
  } catch (err) {
    res.status(500).json({ success: false, message: '伺服器錯誤' });
  }
});

// 取得聊天記錄
app.get('/api/chat/history', authenticateToken, (req, res) => {
  try {
    const records = JSON.parse(fs.readFileSync(chatRecordsFile, 'utf8'));
    const userRecords = records[req.user.userId] || [];
    
    res.json({
      success: true,
      records: userRecords
    });
  } catch (err) {
    res.status(500).json({ success: false, message: '讀取聊天記錄失敗' });
  }
});

// 新增聊天記錄
app.post('/api/chat/send', authenticateToken, (req, res) => {
  const { content } = req.body;
  const timestamp = new Date();
  
  try {
    const records = JSON.parse(fs.readFileSync(chatRecordsFile, 'utf8'));
    
    if (!records[req.user.userId]) {
      records[req.user.userId] = [];
    }
    
    records[req.user.userId].push({
      messageId: Date.now().toString(),
      content,
      timestamp,
      isBot: false
    });

    fs.writeFileSync(chatRecordsFile, JSON.stringify(records, null, 2));
    
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false, message: '儲存聊天記錄失敗' });
  }
});

// 取得使用者偏好設定
app.get('/api/user/preferences', authenticateToken, (req, res) => {
  try {
    const preferences = JSON.parse(fs.readFileSync(preferencesFile, 'utf8'));
    const userPreferences = preferences[req.user.userId] || {};
    
    res.json({
      success: true,
      preferences: userPreferences
    });
  } catch (err) {
    res.status(500).json({ success: false, message: '讀取偏好設定失敗' });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`伺服器正在運行於 http://localhost:${PORT}`);
});
