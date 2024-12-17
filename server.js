const express = require('express');
const path = require('path');
const fs = require('fs');
const session = require('express-session');
const app = express();
const port = process.env.PORT || 5000;

// 設定 EJS 模板引擎
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// 讀取 users.json 資料
const usersFile = path.join(__dirname, 'users.json');

// 用於存儲最新指令
let latestInstruction = '';

// 中間件
app.use(express.static('public')); // 配置靜態資源
app.use(express.json());
app.use(session({
    secret: 'your-secret-key',
    resave: false,
    saveUninitialized: true,
}));

// 根路由（登入頁面）
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html')); // 靜態登入頁面
});

// 登錄 API
app.post('/api/login', (req, res) => {
    const { username, password } = req.body;

    // 讀取用戶資料
    fs.readFile(usersFile, 'utf8', (err, data) => {
        if (err) {
            return res.status(500).json({ success: false, message: '伺服器錯誤' });
        }

        const users = JSON.parse(data);

        // 查找匹配的用戶
        const user = users.find(u => u.username === username && u.password === password);
        if (!user) {
            return res.json({ success: false, message: '帳號或密碼錯誤' });
        }

        // 儲存用戶資料到 session
        req.session.user = user;

        // 回傳 userType 以利前端跳轉
        res.json({ success: true, userType: user.userType });
    });
});

// 學生專屬頁面
app.get('/student', (req, res) => {
    if (!req.session.user || req.session.user.userType !== 'student') {
        return res.redirect('/'); // 未登入或非學生
    }

    const user = req.session.user;
    res.render('student_home', { userID: user.userID, user }); // EJS 渲染學生頁面
});

// 教師專屬頁面
app.get('/teacher', (req, res) => {
    if (!req.session.user || req.session.user.userType !== 'teacher') {
        return res.redirect('/'); // 未登入或非教師
    }

    const user = req.session.user;
    res.render('teacher_home', { user }); // EJS 渲染教師頁面
});

// 老師發送指令 API
app.post('/api/send-instruction', (req, res) => {
    if (!req.session.user || req.session.user.userType !== 'teacher') {
        return res.status(403).json({ success: false, message: '未授權操作' });
    }

    const { instruction } = req.body;
    if (!instruction) {
        return res.status(400).json({ success: false, message: '指令內容不可為空' });
    }

    latestInstruction = instruction; // 保存指令
    res.json({ success: true, message: '指令已發送' });
});

// 學生獲取指令 API
app.get('/api/get-instruction', (req, res) => {
    if (!req.session.user || req.session.user.userType !== 'student') {
        return res.status(403).json({ success: false, message: '未授權操作' });
    }

    res.json({ success: true, instruction: latestInstruction });
});

// 啟動伺服器
app.listen(port, () => {
    console.log(`伺服器正在 http://localhost:${port} 運行`);
});
