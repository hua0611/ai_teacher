const path = require('path');
const fs = require('fs');
const express = require('express');
const session = require('express-session');

const app = express();

// 設定 EJS 模板引擎（因為 student_home 需要動態）
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// 使用 JSON Body 解析中間件
app.use(express.json());

// 設定 Session（必須在路由之前）
app.use(
    session({
        secret: 'your-secret-key',
        resave: false,
        saveUninitialized: true,
    })
);

// 使用靜態資源 (將 public 資料夾設為靜態檔案根目錄)
app.use(express.static(path.join(__dirname, 'public')));

// 初始化檔案路徑
const chatRecordsFile = path.join(__dirname, 'chatRecords.json');
const usersFile = path.join(__dirname, 'users.json');

// 確保 chatRecords.json 存在
if (!fs.existsSync(chatRecordsFile)) {
    fs.writeFileSync(chatRecordsFile, JSON.stringify({}, null, 2));
}

// 確保 users.json 存在
if (!fs.existsSync(usersFile)) {
    fs.writeFileSync(usersFile, JSON.stringify([
        { username: 'student1', password: '123456', userID: 'stu123', userType: 'student', displayName: '學生A' },
        { username: 'teacher1', password: '654321', userID: 'tea123', userType: 'teacher', displayName: '老師B' }
    ], null, 2));
}

// 根路由：返回學習檔案 (靜態 HTML)
app.get('/', (req, res) => {
    // 假設你的學習檔案.html 位於 public/student 資料夾中
    res.sendFile(path.join(__dirname, 'public', 'student', '學習檔案.html'));
});

// 學生主頁路由：使用 EJS 模板 (動態)
app.get('/student/', (req, res) => {
    // 若尚未登入，導回首頁或登入頁
    if (!req.session.user) {
        return res.redirect('/');
    }

    // 傳入 user 物件給 EJS 模板使用
    res.render('student_home', { user: req.session.user });
});

// 教師主頁路由：使用 EJS 模板 (動態)
app.get('/teacher/', (req, res) => {
    // 檢查是否已登入且為教師
    if (!req.session.user || req.session.user.userType !== 'teacher') {
        return res.redirect('/');
    }
    res.render('teacher_home', { user: req.session.user });
});

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
