const express = require('express');
const path = require('path');
const session = require('express-session');
const app = express();
const port = process.env.PORT || 5000;

// 用戶資料（固定資料，只包含名稱和身份類型）
const users = [
    { username: 'xiaoming', password: 'pass123', userType: 'student', displayName: '小明' },
    { username: 'xiaohua', password: 'pass123', userType: 'student', displayName: '小華' },
    { username: 'teacher1', password: 'teach123', userType: 'teacher', displayName: '老師王' }
];

// 中間件
app.use(express.static('public'));
app.use(express.json());
app.use(session({
    secret: 'your-secret-key', // 替換為你的密鑰
    resave: false,
    saveUninitialized: true
}));

// 根路由（登入頁面）
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// 登錄 API
app.post('/api/login', (req, res) => {
    const { username, password } = req.body;

    // 查找用戶
    const user = users.find(u => u.username === username && u.password === password);
    if (!user) {
        return res.status(400).json({ success: false, message: '帳號或密碼錯誤' });
    }

    // 儲存用戶資訊到 Session
    req.session.user = user;
    res.json({ success: true, userType: user.userType });
});

// 檢查是否登入的中間件
function checkAuthentication(req, res, next) {
    if (!req.session.user) {
        return res.redirect('/'); // 如果未登入，跳回登入頁
    }
    next();
}

// 動態生成學生專屬頁面
app.get('/student', checkAuthentication, (req, res) => {
    if (req.session.user.userType !== 'student') {
        return res.redirect('/'); // 非學生身份，跳回登入頁
    }

    const user = req.session.user; // 當前用戶資料

    // 模擬的固定學習任務
    const task = `${user.displayName}，今天的學習任務是完成數學基礎練習。`;

    // 動態生成學生專屬頁面
    res.send(`
        <!DOCTYPE html>
        <html lang="zh-TW">
        <head>
            <meta charset="UTF-8">
            <title>${user.displayName} 的學生專屬頁面</title>
            <link rel="stylesheet" href="https://maxcdn.bootstrapcdn.com/bootstrap/4.5.2/css/bootstrap.min.css">
        </head>
        <body class="container">
            <h1>歡迎, ${user.displayName}！</h1>
            <p>今天的學習任務：${task}</p>
            <h2>專屬功能</h2>
            <ul>
                <li><b>狀態追蹤</b>：暫無</li>
                <li><b>個人化筆記</b>：暫無</li>
                <li><b>課堂資訊</b>：暫無</li>
            </ul>
            <a href="/" class="btn btn-primary">返回登入</a>
        </body>
        </html>
    `);
});

// 動態生成教師專屬頁面
app.get('/teacher', checkAuthentication, (req, res) => {
    if (req.session.user.userType !== 'teacher') {
        return res.redirect('/'); // 非教師身份，跳回登入頁
    }

    const user = req.session.user; // 當前用戶資料

    // 模擬的固定教學任務
    const task = `${user.displayName}，今天的教學任務是檢查學生作業並準備下次課程。`;

    // 動態生成教師專屬頁面
    res.send(`
        <!DOCTYPE html>
        <html lang="zh-TW">
        <head>
            <meta charset="UTF-8">
            <title>${user.displayName} 的教師專屬頁面</title>
            <link rel="stylesheet" href="https://maxcdn.bootstrapcdn.com/bootstrap/4.5.2/css/bootstrap.min.css">
        </head>
        <body class="container">
            <h1>歡迎, ${user.displayName}！</h1>
            <p>今天的任務：${task}</p>
            <h2>教師專屬功能</h2>
            <ul>
                <li>學習檔案管理</li>
                <li>出題系統</li>
            </ul>
            <a href="/" class="btn btn-primary">返回登入</a>
        </body>
        </html>
    `);
});

// 啟動伺服器
app.listen(port, () => {
    console.log(`伺服器正在 http://localhost:${port} 運行`);
});
