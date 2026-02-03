const express = require('express');
const router = express.Router();
const axios = require('axios');

// 这个文件做的事情：提供一个后端接口，把前端的聊天请求转发给阿里云 DashScope（兼容 OpenAI 的 Chat Completions 接口）
// 这样前端不需要直接暴露/携带 API Key，也避免浏览器跨域等问题。
router.post('/chat/completions', async (req, res) => {
    try {
        // 前端需要传入 model 和 messages（messages 是一个数组，元素形如 { role, content }）
        const { model, messages } = req.body ?? {};
        if (!model || !messages || !Array.isArray(messages)) {
            return res.status(400).json({
                error: '缺少必需参数: model 或 messages'
            });
        }

        // 从环境变量读取 DashScope API Key
        const apiKey = process.env.DASHSCOPE_API_KEY ?? '';
        if (!apiKey) {
            return res.status(500).json({
                error: '服务端未配置 DASHSCOPE_API_KEY'
            });
        }

        // 组装发往 DashScope 的请求体：基本等同 OpenAI 的 chat/completions
        const requestBody = {
            model,
            messages,
            enable_search: true
        };

        // 通过 axios 向 DashScope 发起请求：
        // - validateStatus: () => true 让 axios 不因非 2xx 抛错，便于我们把上游错误原样返回给前端
        // - timeout: 控制上游请求超时，避免前端一直转圈
        const response = await axios.post(
            'https://dashscope.aliyuncs.com/compatible-mode/v1/chat/completions',
            requestBody,
            {
                headers: {
                    Authorization: `Bearer ${apiKey}`,
                    'Content-Type': 'application/json'
                },
                timeout: 15000,
                validateStatus: () => true
            }
        );

        // DashScope 返回的 statusCode；2xx 视为成功，其余按上游状态码透传
        const statusCode = typeof response.status === 'number' ? response.status : 0;
        const payload = response.data;

        // 如果上游非 2xx：返回上游状态码与内容，前端可据此展示更具体的错误
        if (statusCode < 200 || statusCode >= 300) {
            return res.status(statusCode || 502).json(payload ?? { error: 'DashScope 请求失败' });
        }

        // 上游成功：直接把内容返回给前端（前端从 choices[0].message.content 读取文本）
        return res.json(payload ?? {});
    } catch (err) {
        // 只有在 axios 自己抛错（比如网络错误、超时）或代码异常时会走到这里
        return res.status(500).json({
            error: '模型调用失败',
            details: err instanceof Error ? err.message : String(err)
        });
    }
});

module.exports = router;
