const path = require('path');
const fs = require('fs');
const express = require('express');
const session = require('express-session');
const app = express();

// 設定 EJS 模板引擎
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// 初始化所需檔案
const chatRecordsFile = path.join(__dirname, 'chatRecords.json');
const usersFile = path.join(__dirname, 'users.json');

// 檢查或初始化 chatRecords.json
if (!fs.existsSync(chatRecordsFile)) {
    fs.writeFileSync(chatRecordsFile, JSON.stringify({}, null, 2));
}

// 檢查或初始化 users.json
if (!fs.existsSync(usersFile)) {
    fs.writeFileSync(usersFile, JSON.stringify([
        { username: 'student1', password: '123456', userID: 'stu123', userType: 'student', displayName: '學生A' },
        { username: 'teacher1', password: '654321', userID: 'tea123', userType: 'teacher', displayName: '老師B' }
    ], null, 2));
}

// 使用靜態資源
app.use(express.static(path.join(__dirname, 'public')));

// 使用 JSON Body 解析中間件
app.use(express.json());

// 設定 Session
app.use(
    session({
        secret: 'your-secret-key',
        resave: false,
        saveUninitialized: true,
    })
);

// 根路由：顯示學習檔案頁面 (已改為 EJS)
app.get('/', (req, res) => {
    // 原本是 sendFile('學習檔案.html')，現在改為使用 EJS 模板
    res.render('學習檔案');
});

// 學生主頁路由：使用 EJS 模板 (原 student_home.html -> student_home.ejs)
app.get('/student/', (req, res) => {
    res.render('student_home');
});

// (若將來需要教師主頁路由，則同理)
// app.get('/teacher/', (req, res) => {
//     res.render('teacher_home');
// });

// API: 處理登入
app.post('/api/login', (req, res) => {
    const { username, password } = req.body;

    fs.readFile(usersFile, 'utf8', (err, data) => {
        if (err) {
            console.error('讀取用戶檔案失敗:', err);
            return res.status(500).json({ success: false, message: '伺服器錯誤' });
        }

        const users = JSON.parse(data);
        const user = users.find(u => u.username === username && u.password === password);

        if (!user) {
            return res.status(401).json({ success: false, message: '帳號或密碼錯誤' });
        }

        req.session.user = user;
        res.json({ success: true, userType: user.userType });
    });
});

// API: 取得學生對話紀錄
app.get('/api/chatRecords', (req, res) => {
    if (!req.session.user || req.session.user.userType !== 'student') {
        return res.status(403).json({ success: false, message: '未授權操作' });
    }

    const userID = req.session.user.userID;
    fs.readFile(chatRecordsFile, 'utf8', (err, data) => {
        if (err) {
            console.error('讀取對話紀錄失敗:', err);
            return res.status(500).json({ success: false, message: '伺服器錯誤' });
        }

        const records = JSON.parse(data);
        const userRecords = records[userID] || [];
        res.json({ success: true, records: userRecords });
    });
});

// 啟動伺服器
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`伺服器正在運行於 http://localhost:${PORT}`);
});
