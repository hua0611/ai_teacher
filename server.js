const express = require('express');
const cors = require('cors');
const path = require('path');
const app = express();
const port = process.env.PORT || 5000;

// 啟用 CORS 支持
app.use(cors());

// 提供靜態文件
app.use(express.static('public'));

// 解析 JSON
app.use(express.json());

// 根路由處理
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// 登錄 API
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

app.listen(port, () => {
    console.log(`伺服器正在 http://localhost:${port} 運行`);
});
