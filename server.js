// server.js - 取代 Cloudflare Worker 的 Render Web Service
const express = require('express');
const cors = require('cors');
const axios = require('axios');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// 啟用 CORS 和 JSON 解析
app.use(cors());
app.use(express.json({ limit: '10mb' }));  // 增加限制以處理較大的請求

// 記錄請求中間件 (方便調試)
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
  next();
});

// 靜態文件服務 - 提供前端文件
app.use(express.static('./'));

// 服務器狀態檢查端點
app.get('/api/status', (req, res) => {
  res.json({
    status: 'ok',
    time: new Date().toISOString(),
    env: {
      hasApiKey: Boolean(process.env.OPENAI_API_KEY),
      model: process.env.OPENAI_MODEL || 'gpt-4.1'
    }
  });
});

// OpenAI API 代理端點
app.post('/api/openai', async (req, res) => {
  try {
    console.log('收到 OpenAI API 請求');
    const openaiApiKey = process.env.OPENAI_API_KEY;
    
    if (!openaiApiKey) {
      throw new Error('未設置 OpenAI API 密鑰');
    }

    console.log('使用模型:', req.body.model);
    
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

    console.log('OpenAI API 回應成功');
    res.json(response.data);
  } catch (error) {
    console.error('API 請求失敗:', error.message);
    
    // 更詳細的錯誤記錄
    if (error.response) {
      console.error('響應錯誤:', {
        status: error.response.status,
        headers: error.response.headers,
        data: error.response.data
      });
    }
    
    res.status(error.response?.status || 500).json({
      error: error.message,
      details: error.response?.data || '無詳細信息'
    });
  }
});

// 處理所有其他請求，重定向到前端 (SPA 路由支持)
app.get('*', (req, res) => {
  res.sendFile('index.html', { root: './' });
});

// 錯誤處理中間件
app.use((err, req, res, next) => {
  console.error('伺服器錯誤:', err);
  res.status(500).json({ error: '伺服器內部錯誤', message: err.message });
});

app.listen(PORT, () => {
  console.log(`伺服器運行在 http://localhost:${PORT}`);
  console.log('環境變數狀態:', {
    NODE_ENV: process.env.NODE_ENV,
    hasApiKey: Boolean(process.env.OPENAI_API_KEY),
    model: process.env.OPENAI_MODEL || 'gpt-4.1'
  });
});