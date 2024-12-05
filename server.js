const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const app = express();
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.static('public'));
app.use(express.json());

// 確保 users 資料夾存在
const usersDir = path.join(__dirname, 'users');
if (!fs.existsSync(usersDir)) {
    fs.mkdirSync(usersDir);
}

// 根路由
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// 註冊頁面路由
app.get('/register', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'register.html'));
});

// 登錄 API
app.post('/api/login', (req, res) => {
    const { username, password } = req.body;

    const userFilePath = path.join(usersDir, `${username}.json`);

    // 檢查用戶是否存在
    if (!fs.existsSync(userFilePath)) {
        return res.json({ success: false, message: '帳號或密碼錯誤' });
    }

    // 讀取用戶資料並驗證密碼
    const userData = JSON.parse(fs.readFileSync(userFilePath, 'utf8'));
    if (userData.password !== password) {
        return res.json({ success: false, message: '帳號或密碼錯誤' });
    }

    // 驗證成功
    res.json({ success: true, userType: 'student' });
});

// 註冊 API
app.post('/api/register', (req, res) => {
    const { username, password } = req.body;

    const userFilePath = path.join(usersDir, `${username}.json`);

    // 檢查用戶是否已存在
    if (fs.existsSync(userFilePath)) {
        return res.json({ success: false, message: '帳號已存在' });
    }

    // 保存用戶資料
    fs.writeFileSync(userFilePath, JSON.stringify({ username, password }, null, 2));

    res.json({ success: true });
});

// 啟動伺服器
app.listen(port, () => {
    console.log(`伺服器正在 http://localhost:${port} 運行`);
});
