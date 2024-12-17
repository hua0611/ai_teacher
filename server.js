const path = require('path');
const fs = require('fs');
const express = require('express');
const session = require('express-session');
const app = express();

const chatRecordsFile = path.join(__dirname, 'chatRecords.json');

// 檢查或初始化 chatRecords.json
if (!fs.existsSync(chatRecordsFile)) {
    fs.writeFileSync(chatRecordsFile, JSON.stringify({}, null, 2));
}

// 設定靜態資源
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

// 中間件函數：驗證學生身份
function authenticateStudent(req, res, next) {
    if (!req.session.user || req.session.user.userType !== 'student') {
        return res.status(403).json({ success: false, message: '未授權操作' });
    }
    next();
}

// 根路由：返回學習檔案頁面
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', '學習檔案.html')); // 返回學習檔案頁面
});

// API: 取得學生對話紀錄
app.get('/api/chatRecords', authenticateStudent, (req, res) => {
    const userID = req.session.user.userID;

    fs.readFile(chatRecordsFile, 'utf8', (err, data) => {
        if (err) {
            console.error('讀取對話紀錄檔案失敗:', err);
            return res.status(500).json({ success: false, message: '伺服器錯誤' });
        }

        const records = JSON.parse(data);
        const userRecords = records[userID] || [];
        res.json({ success: true, records: userRecords });
    });
});

// API: 儲存學生與 AI 的對話紀錄
app.post('/api/saveChat', authenticateStudent, (req, res) => {
    const userID = req.session.user.userID;
    const { role, message } = req.body;

    if (!role || !message) {
        return res.status(400).json({ success: false, message: '角色與訊息內容不可為空' });
    }

    fs.readFile(chatRecordsFile, 'utf8', (err, data) => {
        if (err) {
            console.error('讀取對話紀錄檔案失敗:', err);
            return res.status(500).json({ success: false, message: '伺服器錯誤' });
        }

        const records = JSON.parse(data);
        if (!records[userID]) {
            records[userID] = [];
        }

        records[userID].push({
            role,
            message,
            timestamp: new Date().toISOString(),
        });

        fs.writeFile(chatRecordsFile, JSON.stringify(records, null, 2), 'utf8', (err) => {
            if (err) {
                console.error('寫入對話紀錄檔案失敗:', err);
                return res.status(500).json({ success: false, message: '儲存失敗' });
            }
            res.json({ success: true, message: '對話紀錄已儲存' });
        });
    });
});

// 啟動伺服器
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`伺服器正在運行於 http://localhost:${PORT}`);
});
