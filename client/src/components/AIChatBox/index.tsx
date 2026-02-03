import React, { useState, useRef, useEffect, useMemo } from 'react';
import createAxios from '../../api/utils/createAxios';
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
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
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

        const nextMessages = [...messages, userMsg];
        setMessages(nextMessages);
        setInputValue('');
        setIsLoading(true);

        // 调用 DashScope API
        try {
            const response = await api.post('/api/chat/completions', {
                model: 'qwen-plus',
                messages: nextMessages.map((m) => ({
                    role: m.sender === 'user' ? 'user' : 'assistant',
                    content: m.text
                }))
            });
            const data = response.data;
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

            setMessages(prev => [...prev, {
                id: (Date.now() + 2).toString(),
                text: serverMsg ? `抱歉，出错了：${serverMsg}` : '抱歉，我暂时无法回答你的问题。请稍后再试。',
                sender: 'ai'
            }]);
        } finally {
            setIsLoading(false);
        }
    };

    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            handleSend();
        }
    };

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <RobotOutlined className={styles.headerIcon} />
                <span>AI 购物助手</span>
            </div>
            
            <div className={styles.messagesContainer}>
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
                <div ref={messagesEndRef} />
            </div>

            <div className={styles.inputArea}>
                <input
                    className={styles.input}
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="我想买..."
                    disabled={isLoading}
                />
                <button 
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
