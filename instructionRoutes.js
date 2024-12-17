const express = require('express');
const router = express.Router();

// 用於存儲指令
let latestInstruction = '';

// API: 老師發送指令
router.post('/send-instruction', (req, res) => {
  const { instruction } = req.body;
  if (!instruction) {
    return res.status(400).json({ success: false, message: '指令內容不可為空' });
  }
  latestInstruction = instruction; // 保存指令
  res.json({ success: true, message: '指令已發送' });
});

// API: 學生獲取最新指令
router.get('/get-instruction', (req, res) => {
  res.json({ success: true, instruction: latestInstruction });
});

module.exports = router;
