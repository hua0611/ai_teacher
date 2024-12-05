const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const app = express();
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.static('public'));
app.use(express.json());

// 模擬資料庫
const users = [];

// 根路由
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// 註冊 API
app.post('/api/register', (req, res) => {
    const { username, password } = req.body;

    if (users.find(user => user.username === username)) {
        return res.json({ success: false, message: '帳號已存在' });
    }

    users.push({ username, password, userType: 'student' });
    res.json({ success: true });
});

// 登錄 API
app.post('/api/login', (req, res) => {
    const { username, password } = req.body;
    const user = users.find(u => u.username === username && u.password === password);

    if (user) {
        res.json({ success: true, userType: user.userType });
    } else {
        res.json({ success: false, message: '帳號或密碼錯誤' });
    }
});

// 動態學生頁面
app.get('/student/:username', (req, res) => {
    const username = req.params.username;
    const user = users.find(u => u.username === username);

    if (!user) {
        return res.status(404).send('學生未找到');
    }

    res.send(`
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="UTF-8">
            <title>${username} 的專屬頁面</title>
        </head>
        <body>
            <h1>歡迎，${username}</h1>
            <p>這是你的專屬頁面。</p>
            <a href="/">返回登入</a>
        </body>
        </html>
    `);
});

app.listen(port, () => {
    console.log(`伺服器正在 http://localhost:${port} 運行`);
});
