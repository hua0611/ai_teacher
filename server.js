const express = require('express');
const cors = require('cors');
const path = require('path');
const app = express();
const port = process.env.PORT || 5000;

// 啟用 CORS 支持，以允許來自不同域的請求
app.use(cors());

// 使用 express 提供 public 文件夾中的靜態文件
app.use(express.static('public'));

// 解析 JSON 格式的請求體
app.use(express.json());

// 添加根路由處理
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// 定義 API 路由，例如登錄 API
app.post('/api/login', (req, res) => {
    const { username, password } = req.body;
    const validCredentials = [
        { username: "1", password: "1", userType: "teacher" },
        { username: "1", password: "1", userType: "student" }
    ];

    const user = validCredentials.find(u => u.username === username && u.password === password);
    if (user) {
        res.json({ success: true, message: '登入成功', userType: user.userType });
    } else {
        res.json({ success: false, message: '帳號或密碼錯誤' });
    }
});

// 啟動伺服器
app.listen(port, () => {
    console.log(`伺服器正在 http://localhost:${port} 運行`);
});
