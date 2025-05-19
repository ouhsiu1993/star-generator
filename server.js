// server.js - 取代 Cloudflare Worker 的 Render Web Service

const express = require('express');
const cors = require('cors');
const axios = require('axios');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// 啟用 CORS 和 JSON 解析
app.use(cors());
app.use(express.json());

// 靜態文件服務 - 提供前端文件
app.use(express.static('./'));

// OpenAI API 代理端點
app.post('/api/openai', async (req, res) => {
  try {
    const openaiApiKey = process.env.OPENAI_API_KEY;
    
    if (!openaiApiKey) {
      throw new Error('未設置 OpenAI API 密鑰');
    }

    const response = await axios.post(
      'https://api.openai.com/v1/chat/completions',
      req.body,
      {
        headers: {
          'Authorization': `Bearer ${openaiApiKey}`,
          'Content-Type': 'application/json'
        }
      }
    );

    res.json(response.data);
  } catch (error) {
    console.error('API 請求失敗:', error.message);
    res.status(error.response?.status || 500).json({
      error: error.message,
      details: error.response?.data
    });
  }
});

// 處理所有其他請求，重定向到前端 (SPA 路由支持)
app.get('*', (req, res) => {
  res.sendFile('index.html', { root: './' });
});

app.listen(PORT, () => {
  console.log(`服務器運行在 http://localhost:${PORT}`);
});