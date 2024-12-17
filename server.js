const chatRecordsFile = path.join(__dirname, 'chatRecords.json'); // 對話紀錄檔案路徑

// API: 取得學生對話紀錄
app.get('/api/chatRecords', (req, res) => {
    // 確認 API 金鑰（可選）
    const apiKey = req.headers['x-api-key'];
    if (apiKey !== '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') {
        return res.status(403).json({ success: false, message: '無效的 API 金鑰' });
    }

    // 確認是否已登入並是學生用戶
    if (!req.session.user || req.session.user.userType !== 'student') {
        return res.status(403).json({ success: false, message: '未授權操作' });
    }

    const userID = req.session.user.userID;

    // 讀取對話紀錄檔案
    fs.readFile(chatRecordsFile, 'utf8', (err, data) => {
        if (err) {
            console.error('讀取對話紀錄檔案失敗:', err);
            return res.status(500).json({ success: false, message: '伺服器錯誤' });
        }

        const records = JSON.parse(data);
        const userRecords = records[userID] || []; // 取得特定使用者的對話紀錄
        res.json({ success: true, records: userRecords });
    });
});

// API: 儲存學生與 AI 的對話紀錄
app.post('/api/saveChat', (req, res) => {
    // 確認 API 金鑰（可選）
    const apiKey = req.headers['x-api-key'];
    if (apiKey !== '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') {
        return res.status(403).json({ success: false, message: '無效的 API 金鑰' });
    }

    // 確認是否已登入並是學生用戶
    if (!req.session.user || req.session.user.userType !== 'student') {
        return res.status(403).json({ success: false, message: '未授權操作' });
    }

    const userID = req.session.user.userID;
    const { role, message } = req.body;

    // 確認請求內容是否合法
    if (!role || !message) {
        return res.status(400).json({ success: false, message: '角色與訊息內容不可為空' });
    }

    // 讀取對話紀錄檔案
    fs.readFile(chatRecordsFile, 'utf8', (err, data) => {
        if (err) {
            console.error('讀取對話紀錄檔案失敗:', err);
            return res.status(500).json({ success: false, message: '伺服器錯誤' });
        }

        const records = JSON.parse(data);
        if (!records[userID]) {
            records[userID] = []; // 如果該使用者無紀錄，初始化一個空陣列
        }

        // 新增對話紀錄
        records[userID].push({
            role,
            message,
            timestamp: new Date().toISOString()
        });

        // 寫入更新後的紀錄
        fs.writeFile(chatRecordsFile, JSON.stringify(records, null, 2), 'utf8', (err) => {
            if (err) {
                console.error('寫入對話紀錄檔案失敗:', err);
                return res.status(500).json({ success: false, message: '儲存失敗' });
            }
            res.json({ success: true, message: '對話紀錄已儲存' });
        });
    });
});
