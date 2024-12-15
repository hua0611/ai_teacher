const express = require('express');
const path = require('path');
const fs = require('fs');  // 用於讀取 JSON 檔案
const session = require('express-session');
const app = express();
const port = process.env.PORT || 5000;

// 設定 EJS 模板引擎
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// 讀取 users.json 資料
const usersFile = path.join(__dirname, 'users.json');

// 中間件
app.use('/teacher', express.static(path.join(__dirname, 'public/teacher'))); // 配置教師靜態資源
app.use(express.static('public')); // 配置一般靜態資源
app.use(express.json());
app.use(session({
    secret: 'your-secret-key',
    resave: false,
    saveUninitialized: true
}));

// 根路由（登入頁面）
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html')); // 使用靜態檔案作為登入頁面
});

// 登錄 API
app.post('/api/login', (req, res) => {
    const { username, password } = req.body;

    // 讀取用戶資料
    fs.readFile(usersFile, 'utf8', (err, data) => {
        if (err) {
            return res.status(500).json({ success: false, message: '伺服器錯誤' });
        }

        // 解析用戶資料
        const users = JSON.parse(data);

        // 查找匹配的用戶
        const user = users.find(u => u.username === username && u.password === password);
        if (!user) {
            return res.json({ success: false, message: '帳號或密碼錯誤' });
        }

        // 儲存用戶資料到 session
        req.session.user = user;

        // 回傳 userType 以利前端判斷是 student 還是 teacher
        res.json({ success: true, userType: user.userType });
    });
});

// 學生專屬頁面
app.get('/student', (req, res) => {
    if (!req.session.user || req.session.user.userType !== 'student') {
        return res.redirect('/');  // 未登入或非學生身份則重導至首頁
    }

    const user = req.session.user;
    res.render('student_home', { user }); // 使用 EJS 渲染學生專屬頁面
});

// 教師專屬頁面
app.get('/teacher', (req, res) => {
    if (!req.session.user || req.session.user.userType !== 'teacher') {
        return res.redirect('/');  // 未登入或非教師身份
    }

    const user = req.session.user;
    res.render('teacher_home', { user }); // 使用 EJS 渲染教師專屬頁面
});

// 教師學習檔案頁面
app.get('/teacher/learn_course', (req, res) => {
    if (!req.session.user || req.session.user.userType !== 'teacher') {
        return res.redirect('/'); // 未登入或非教師身份
    }

    res.sendFile(path.join(__dirname, 'public/teacher', 'learn_course.html'));
});

// 教師教學指令頁面
app.get('/teacher/ask', (req, res) => {
    if (!req.session.user || req.session.user.userType !== 'teacher') {
        return res.redirect('/'); // 未登入或非教師身份
    }

    res.sendFile(path.join(__dirname, 'public/teacher', 'ask.html'));
});

// 啟動伺服器
app.listen(port, () => {
    console.log(`伺服器正在 http://localhost:${port} 運行`);
});
