const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const app = express();
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.static('public'));
app.use(express.json());

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

    // 模擬用戶驗證
    const validCredentials = [
        { username: "teacher1", password: "pass123", userType: "teacher" },
        { username: "student1", password: "pass123", userType: "student" }
    ];

    const user = validCredentials.find(u => u.username === username && u.password === password);

    if (user) {
        res.json({ success: true, userType: user.userType });
    } else {
        res.json({ success: false, message: '帳號或密碼錯誤' });
    }
});

// 註冊 API
app.post('/api/register', (req, res) => {
    const { username, password } = req.body;

    // 簡單模擬：檢查用戶名是否已存在
    const existingUser = fs.existsSync(`users/${username}.json`);
    if (existingUser) {
        return res.json({ success: false, message: '帳號已存在' });
    }

    // 保存用戶資料
    fs.writeFileSync(`users/${username}.json`, JSON.stringify({ username, password }));
    res.json({ success: true });
});

// 啟動伺服器
app.listen(port, () => {
    console.log(`伺服器正在 http://localhost:${port} 運行`);
});
