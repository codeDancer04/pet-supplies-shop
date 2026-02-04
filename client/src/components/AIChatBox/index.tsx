import React, { useState, useRef, useEffect, useMemo } from 'react';
import createAxios from '../../utils/createAxios';
import { SendOutlined, RobotOutlined } from '@ant-design/icons';
import styles from './index.module.css';

type Message = {
    id: string;
    text: string;
    sender: 'user' | 'ai';
};

const AIChatBox = () => {
    const [inputValue, setInputValue] = useState('');
    const [messages, setMessages] = useState<Message[]>([
        {
            id: '1',
            text: '你好！我是你的AI购物助手，有什么可以帮你的吗？',
            sender: 'ai'
        }
    ]);
    const [isLoading, setIsLoading] = useState(false);
    const messagesContainerRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        const el = messagesContainerRef.current;
        if (!el) return;
        el.scrollTo({ top: el.scrollHeight, behavior: 'smooth' });
    };
    // 创建 Axios 实例
    const api = useMemo(() => createAxios(), []);

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const handleSend = async () => {
        if (!inputValue.trim()) return;

        const userMsg: Message = {
            id: Date.now().toString(),
            text: inputValue,
            sender: 'user'
        };
        // 除了添加新消息，还保留之前全部的历史消息，让ai基于全部上下文生成回复
        const nextMessages = [...messages, userMsg];
        setMessages(nextMessages);
        // 发送消息后清空输入框
        setInputValue(''); 
        // 发送消息后设置加载状态
        setIsLoading(true);

        // 调用 DashScope API
        try {
            const response = await api.post('/api/chat/completions', {
                model: 'qwen-plus',
                // 传递所有消息，包括历史记录
                messages: nextMessages.slice(-10).map((m) => ({
                    role: m.sender === 'user' ? 'user' : 'assistant',
                    content: m.text
                }))
            }, { timeout: 30000 });
            const data = response.data;
            //整合模型返回的内容，确保是字符串类型
            const content =
                (data &&
                    typeof data === 'object' &&
                    'choices' in data &&
                    Array.isArray((data as { choices?: unknown }).choices) &&
                    (data as { choices: Array<{ message?: { content?: unknown } }> }).choices[0]?.message?.content) ||
                (data && typeof data === 'object' && 'error' in data && (data as { error?: unknown }).error) ||
                null;

            if (!content || typeof content !== 'string') {
                throw new Error('模型返回格式异常');
            }
            // 组合完整的数据结构，添加到消息列表中
            const aiMsg: Message = {
                id: (Date.now() + 1).toString(),
                text: content,
                sender: 'ai'
            };
            setMessages(prev => [...prev, aiMsg]);
        } catch (error) {
            const maybeAxiosError = error as {
                response?: { data?: unknown };
                message?: unknown;
            };
            // 处理模型返回的错误信息
            const serverMsg =
                (maybeAxiosError.response &&
                    maybeAxiosError.response.data &&
                    typeof maybeAxiosError.response.data === 'object' &&
                    'message' in maybeAxiosError.response.data &&
                    typeof (maybeAxiosError.response.data as { message?: unknown }).message === 'string' &&
                    (maybeAxiosError.response.data as { message: string }).message) ||
                (maybeAxiosError.response &&
                    maybeAxiosError.response.data &&
                    typeof maybeAxiosError.response.data === 'object' &&
                    'error' in maybeAxiosError.response.data &&
                    typeof (maybeAxiosError.response.data as { error?: unknown }).error === 'string' &&
                    (maybeAxiosError.response.data as { error: string }).error) ||
                (typeof maybeAxiosError.message === 'string' ? maybeAxiosError.message : null);

            const detailsMsg =
                (maybeAxiosError.response &&
                    maybeAxiosError.response.data &&
                    typeof maybeAxiosError.response.data === 'object' &&
                    'details' in maybeAxiosError.response.data &&
                    typeof (maybeAxiosError.response.data as { details?: unknown }).details === 'string' &&
                    (maybeAxiosError.response.data as { details: string }).details) ||
                null;

            const finalMsg =
                serverMsg && detailsMsg && serverMsg !== detailsMsg ? `${serverMsg}：${detailsMsg}` : serverMsg;

            setMessages(prev => [...prev, {
                id: (Date.now() + 2).toString(),
                text: finalMsg ? `抱歉，出错了：${finalMsg}` : '抱歉，我暂时无法回答你的问题。请稍后再试。',
                sender: 'ai'
            }]);
        } finally {
            setIsLoading(false);
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key !== 'Enter') return;
        e.preventDefault();
        e.stopPropagation();
        handleSend();
    };

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <RobotOutlined className={styles.headerIcon} />
                <span>AI 购物助手</span>
            </div>
            
            <div className={styles.messagesContainer} ref={messagesContainerRef}>
                {messages.map(msg => (
                    <div 
                        key={msg.id} 
                        className={`${styles.message} ${msg.sender === 'user' ? styles.userMessage : styles.aiMessage}`}
                    >
                        {msg.text}
                    </div>
                ))}
                {isLoading && (
                    <div className={`${styles.message} ${styles.aiMessage}`}>
                        正在思考...
                    </div>
                )}
            </div>

            <div className={styles.inputArea}>
                <input
                    className={styles.input}
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="我想买..."
                    disabled={isLoading}
                />
                <button 
                    type="button"
                    className={styles.sendButton}
                    onClick={handleSend}
                    disabled={isLoading || !inputValue.trim()}
                >
                    <SendOutlined />
                </button>
            </div>
        </div>
    );
};

export default AIChatBox;
