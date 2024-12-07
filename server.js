const express = require('express');
const path = require('path');
const session = require('express-session');
const app = express();
const port = process.env.PORT || 5000;

// 用戶資料（假設為靜態的範例資料，可以從 users.json 讀取）
const users = [
    {
        username: 'xiaoming',
        password: 'pass123',
        userType: 'student',
        displayName: '小明',
        task: '完成數學基礎練習',
        progress: '50%',
        notes: ['數學基礎練習筆記：需要加強加減法運算。', '語文閱讀筆記：記得閱讀《海底兩萬里》一章。'],
        classroomInfo: '本週課程：數學基礎加減法，語文閱讀理解。'
    },
    {
        username: 'xiaohua',
        password: 'pass123',
        userType: 'student',
        displayName: '小華',
        task: '完成語文閱讀練習',
        progress: '30%',
        notes: ['語文閱讀筆記：理解故事情節。'],
        classroomInfo: '本週課程：語文閱讀理解，數學運算基礎。'
    },
    {
        username: 'teacher1',
        password: 'teach123',
        userType: 'teacher',
        displayName: '老師王',
        task: '檢查學生作業並準備下次課程',
        notes: ['準備下次數學課程。']
    }
];

// 設定模板引擎（我們這裡使用 EJS）
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// 中間件
app.use(express.static('public'));
app.use(express.json());
app.use(session({
    secret: 'your-secret-key', // 替換為你的密鑰
    resave: false,
    saveUninitialized: true
}));

// 登入 API
app.post('/api/login', (req, res) => {
    const { username, password } = req.body;
    const user = users.find(u => u.username === username && u.password === password);

    if (!user) {
        return res.json({ success: false, message: '帳號或密碼錯誤' });
    }

    req.session.user = user;  // 儲存用戶資料
    res.json({ success: true, userType: user.userType });
});

// 檢查是否登入的中間件
function checkAuthentication(req, res, next) {
    if (!req.session.user) {
        return res.redirect('/'); // 如果未登入，跳回登入頁
    }
    next();
}

// 學生頁面（動態生成）
app.get('/student', checkAuthentication, (req, res) => {
    const user = req.session.user;

    if (user.userType !== 'student') {
        return res.redirect('/'); // 非學生身份，跳回登入頁
    }

    // 渲染學生頁面，並傳遞學生資料
    res.render('student', { 
        displayName: user.displayName,
        task: user.task,
        progress: user.progress,
        notes: user.notes,
        classroomInfo: user.classroomInfo
    });
});

// 教師頁面（動態生成）
app.get('/teacher', checkAuthentication, (req, res) => {
    const user = req.session.user;

    if (user.userType !== 'teacher') {
        return res.redirect('/'); // 非教師身份，跳回登入頁
    }

    // 渲染教師頁面，並傳遞教師資料
    res.render('teacher', {
        teacherName: user.displayName,
        task: user.task,
        notes: user.notes
    });
});

// 啟動伺服器
app.listen(port, () => {
    console.log(`伺服器正在 http://localhost:${port} 運行`);
});
