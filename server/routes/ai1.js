const express = require('express');
const router = express.Router();
const axios = require('axios');
const jwt = require('jsonwebtoken');
const { recognizeIntent } = require('../utils/intentRecognize');
const { queryDb, createOrder } = require('../utils/tools');

const JWT_SECRET = process.env.JWT_SECRET || 'my-256-bit-secret';

// 从请求头中提取 userId
const getUserIdFromRequest = (req) => {
    const authHeader = String(req.headers?.authorization ?? '');
    if (!authHeader) return undefined;
    const token = authHeader.startsWith('Bearer ') ? authHeader.slice('Bearer '.length) : authHeader;
    try {
        const payload = jwt.verify(token, JWT_SECRET);
        const userId = Number(payload.userId);
        return userId;
    } catch {
        return undefined;
    }
};
// 从消息数组中提取最后一个用户消息
const getLastUserText = (messages) => {
    //反向遍历
    for (let i = messages.length - 1; i >= 0; i -= 1) {
        const m = messages[i];
        if (m && typeof m === 'object' && m.role === 'user' && typeof m.content === 'string' && m.content.trim()) {
            // 当找到用户消息时，返回其内容，函数结束，后续消息不再遍历
            return m.content.trim();
        }
    }
    // 如果没有找到用户消息，返回空字符串
    return '';
};
// 转换为符合 OpenAI Chat Completions 接口的格式
const toChatCompletion = (content, model = 'qwen-plus') => ({
    choices: [
        {
            message: { role: 'assistant', content: String(content ?? '') },
            finish_reason: 'stop',
            index: 0,
            logprobs: null
        }
    ],
    object: 'chat.completion',
    usage: { prompt_tokens: 0, completion_tokens: 0, total_tokens: 0, prompt_tokens_details: { cached_tokens: 0 } },
    created: Math.floor(Date.now() / 1000),
    system_fingerprint: null,
    model,
    id: `chatcmpl-${Math.random().toString(16).slice(2)}`
});

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
        // 取userId和用户最新消息
        const userId = getUserIdFromRequest(req);
        const lastUserText = getLastUserText(messages);

        // 进行意图识别与工具调用
        let toolResult = null;  // 工具调用结果
        let intentDecision = null;  // 意图决策
        if (lastUserText) {
            // 过滤掉最后一条消息（因为 lastUserText 已经提取出来了，且 recognizeIntent 内部会再次构造 user 消息）
            // 或者你可以选择保留所有 history，这取决于你想让模型看到多少。
            // 简单起见，我们把整个 messages 传进去，但在 intentRecognize 内部，我们应该小心不要重复添加最后一条 input。
            // 更好的做法是：只传历史记录（messages.slice(0, -1)）。
            const historyMessages = messages.slice(0, -1);
            const decision = await recognizeIntent({ text: lastUserText, userId, messages: historyMessages });
            intentDecision = decision;
            console.log('意图数据', intentDecision);
            // 如果需要调用工具，执行调用
            if (decision && decision.shouldUseTool && decision.tool) {
                try {
                    // 根据工具类型调用不同的工具函数
                    if (decision.tool === 'query_db') {
                        toolResult = await queryDb(decision.args, { userId });
                    } else if (decision.tool === 'create_order') {
                        toolResult = await createOrder(decision.args, { userId });
                    }
                } catch (toolErr) {
                    const statusCode =
                        toolErr && typeof toolErr === 'object' && 'statusCode' in toolErr && typeof toolErr.statusCode === 'number'
                            ? toolErr.statusCode
                            : undefined;
                    const msg = toolErr instanceof Error ? toolErr.message : String(toolErr);
                    const reply = statusCode === 401 ? `需要登录后才能继续：${msg}` : `工具调用失败：${msg}`;
                    return res.json(toChatCompletion(reply, model));
                }
            }
        }

        // 截取最近 10 条消息，避免 DashScope 上下文过长
        const slicedMessages = Array.isArray(messages) ? messages.slice(-10) : [];
        const assistantSystem = {
            role: 'system',
            content: '你是宠物用品电商平台的购物助手。优先依据工具结果回答，避免编造。'
        };
        // 如果有工具调用结果，添加到系统消息中
        const toolSystem = toolResult
            ? {
                role: 'system',
                content: `工具调用结果(JSON)：${JSON.stringify(toolResult)}`
            }
            : null;

        // 组装发往 DashScope 的请求体
        const requestBody = {
            model,
            // 组装prompt：助手角色提示词 + 工具调用结果（如果有）+ 最近 10 条上下文
            messages: toolSystem ? [assistantSystem, toolSystem, ...slicedMessages] 
            : [assistantSystem, ...slicedMessages],
        };

        // 通过 axios 向 DashScope 发起请求：
        // - validateStatus: () => true 让 axios 不因非 2xx 抛错，便于我们把上游错误原样返回给前端
        const response = await axios.post(
            'https://dashscope.aliyuncs.com/compatible-mode/v1/chat/completions',
            requestBody,
            {
                headers: {
                    Authorization: `Bearer ${apiKey}`,
                    'Content-Type': 'application/json'
                },
                timeout: 30000,
                validateStatus: () => true,
                proxy: false
            }
        );
        //取 DashScope 返回的 数据
        const payload = response.data;

        if (payload && typeof payload === 'object' && req.body?.debug === true) {
            // 手动组装调试信息，告诉前端工具调用结果和意图决策
            payload.tool_result = toolResult;
            payload.intent_decision = intentDecision;
        }

        // 把内容返回给前端（前端从 choices[0].message.content 读取文本）
        return res.json(payload ?? {});

    } catch (err) {
        // 只有在 axios 自己抛错（比如网络错误、超时）或代码异常时会走到这里
        const maybeAxiosError = err && typeof err === 'object' ? err : null;
        const code =
            maybeAxiosError && 'code' in maybeAxiosError && typeof maybeAxiosError.code === 'string'
                ? maybeAxiosError.code
                : undefined;
        const message = err instanceof Error ? err.message : String(err);
        return res.status(500).json({
            error: '模型调用失败',
            details: code ? `${message} (${code})` : message
        });
    }
});

module.exports = router;
