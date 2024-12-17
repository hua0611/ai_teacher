const chatRecordsFile = path.join(__dirname, 'chatRecords.json'); // 對話紀錄檔案路徑

// API: 取得學生對話紀錄
app.get('/api/chatRecords', (req, res) => {
    if (!req.session.user || req.session.user.userType !== 'student') {
        return res.status(403).json({ success: false, message: '未授權操作' });
    }

    const userID = req.session.user.userID;

    fs.readFile(chatRecordsFile, 'utf8', (err, data) => {
        if (err) return res.status(500).json({ success: false, message: '伺服器錯誤' });

        const records = JSON.parse(data);
        const userRecords = records[userID] || [];
        res.json({ success: true, records: userRecords });
    });
});

// API: 儲存學生與 AI 的對話紀錄
app.post('/api/saveChat', (req, res) => {
    if (!req.session.user || req.session.user.userType !== 'student') {
        return res.status(403).json({ success: false, message: '未授權操作' });
    }

    const userID = req.session.user.userID;
    const { role, message } = req.body;

    if (!role || !message) {
        return res.status(400).json({ success: false, message: '角色與訊息內容不可為空' });
    }

    fs.readFile(chatRecordsFile, 'utf8', (err, data) => {
        if (err) return res.status(500).json({ success: false, message: '伺服器錯誤' });

        const records = JSON.parse(data);
        if (!records[userID]) {
            records[userID] = [];
        }

        records[userID].push({
            role,
            message,
            timestamp: new Date().toISOString()
        });

        fs.writeFile(chatRecordsFile, JSON.stringify(records, null, 2), 'utf8', (err) => {
            if (err) return res.status(500).json({ success: false, message: '儲存失敗' });
            res.json({ success: true, message: '對話紀錄已儲存' });
        });
    });
});
