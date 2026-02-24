import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Button, Input, Space, Tag, Typography } from 'antd';
import { LoadingOutlined, RobotOutlined, SendOutlined, ThunderboltOutlined, UserOutlined } from '@ant-design/icons';
import styles from './index.module.css';
import createTokenAxios from '../../utils/createTokenAxios';
import ItemBlock from '../ItemBlock';

type ChatRole = 'user' | 'assistant';

type Product = {
  id: number;
  name: string;
  price: number;
  stock: number;
  class: string;
  img_url?: string | null;
};

type ToolResult = {
  resource?: string;
  rows?: Product[];
  message?: string;
  orderId?: number;
  selectedProductIds?: number[];
};

type ChatCompletionsResponse = {
  choices: Array<{ message: { content: string } }>;
  tool_result?: ToolResult;
};

type ChatMessage = {
  id: string;
  role: ChatRole;
  content: string;
  createdAt: number;
  products?: Product[];
};

const { TextArea } = Input;

const normalizeProductsFromToolResult = (toolResult?: ToolResult): Product[] | undefined => {
  if (!toolResult) return undefined;
  if (toolResult.resource !== 'products') return undefined;
  if (!toolResult.rows?.length) return undefined;
  if (!toolResult.selectedProductIds?.length) return toolResult.rows;
  const idSet = new Set(toolResult.selectedProductIds);
  const selected = toolResult.rows.filter((p) => idSet.has(p.id));
  return selected.length ? selected : toolResult.rows;
};

const AIShoppingModePage: React.FC = () => {
  const api = useMemo(() => createTokenAxios(), []);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      role: 'assistant',
      content: '你好！我是你的 AI 购物助手。你可以告诉我预算、宠物类型和需求，我来帮你推荐并下单。',
      createdAt: Date.now()
    }
  ]);
  const listRef = useRef<HTMLDivElement>(null);

  // 快捷提问：帮用户一键生成“信息密度高”的需求描述，便于模型做推荐/调用工具。
  const quickPrompts = useMemo(
    () => [
      { label: '买点狗粮', value: '给金毛推荐一些狗粮' },
      { label: '给猫咪买零食', value: '我想买猫咪零食，有什么推荐？' },
      { label: '推荐玩具', value: '推荐几款耐咬的狗狗玩具' },
      { label: '查全部商品', value: '把店里所有商品列出' }
    ],
    []
  );

  const scrollToBottom = useCallback(() => {
    const el = listRef.current;
    if (!el) return;
    el.scrollTop = el.scrollHeight;
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading, scrollToBottom]);

  const sendMessage = useCallback(
    async (text: string) => {
      const trimmed = text.trim();
      if (!trimmed || isLoading) return;

      // 1) 先把用户消息写入本地状态，UI 立即可见；同时把该消息纳入“上下文”发送给后端。
      const userMsg: ChatMessage = {
        id: String(Date.now()),
        role: 'user',
        content: trimmed,
        createdAt: Date.now()
      };

      const nextMessages = [...messages, userMsg];
      setMessages(nextMessages);
      setInputValue('');
      setIsLoading(true);

      try {
        // 2) 调用后端 /api/chat/completions。
        // 后端会做“意图识别 ->（必要时）调用工具 queryDb/createOrder -> 把工具结果喂给模型 -> 返回模型回复”。
        const response = await api.post<ChatCompletionsResponse>(
          '/api/chat/completions',
          {
            model: 'qwen-plus',
            debug: true,
            messages: nextMessages.slice(-10).map((m) => ({
              role: m.role === 'user' ? 'user' : 'assistant',
              content: m.content
            }))
          },
          { timeout: 30000 }
        );

        const data = response.data;
        // 3) 解析模型文本回复（这里直接假设后端返回格式稳定）
        const assistantText = data.choices[0].message.content;

        // 4) 如果后端在 debug 模式附带了工具返回（tool_result），把商品推荐结构化出来，用卡片展示图片/价格/库存。
        const products = normalizeProductsFromToolResult(data.tool_result);

        const aiMsg: ChatMessage = {
          id: String(Date.now() + 1),
          role: 'assistant',
          content: assistantText,
          createdAt: Date.now(),
          products: products && products.length ? products.slice(0, 12) : undefined
        };
        setMessages((prev) => [...prev, aiMsg]);
      } catch (error) {
        const maybeAxiosError = error as { response?: { data?: { error?: string; message?: string } }; message?: string };
        const serverMsg = maybeAxiosError.response?.data?.message || maybeAxiosError.response?.data?.error || maybeAxiosError.message || '请求失败';

        setMessages((prev) => [
          ...prev,
          {
            id: String(Date.now() + 2),
            role: 'assistant',
            content: `抱歉，我这边遇到一点问题：${serverMsg}`,
            createdAt: Date.now()
          }
        ]);
      } finally {
        setIsLoading(false);
      }
    },
    [api, isLoading, messages]
  );

  const handleSend = useCallback(() => {
    void sendMessage(inputValue);
  }, [inputValue, sendMessage]);

  return (
    <div className={styles.page}>
      <div className={styles.panel}>
        <div className={styles.header}>
          <div className={styles.headerLeft}>
            <div className={styles.headerIcon}>
              <RobotOutlined />
            </div>
            <div className={styles.headerText}>
              <div className={styles.title}>AI 购物助手</div>
              <div className={styles.subtitle}>智能推荐 · 图片展示 · 一键下单</div>
            </div>
          </div>
          <Tag color="processing" className={styles.badge}>
            Shopping Mode
          </Tag>
        </div>

        <div className={styles.list} ref={listRef}>
          {messages.map((m) => {
            const isUser = m.role === 'user';
            return (
              <div key={m.id} className={`${styles.row} ${isUser ? styles.rowUser : styles.rowAi}`}>
                <div className={styles.avatar}>{isUser ? <UserOutlined /> : <RobotOutlined />}</div>
                <div className={styles.bubbleWrap}>
                  <div className={`${styles.bubble} ${isUser ? styles.bubbleUser : styles.bubbleAi}`}>
                    <Typography.Paragraph className={styles.text} style={{ marginBottom: 0 }} ellipsis={false}>
                      {m.content}
                    </Typography.Paragraph>
                  </div>

                  {/* 当工具返回了商品列表时，用卡片网格展示“推荐商品”
                  （图片、价格、库存、快捷下单入口）。 */}
                  {!!m.products?.length && (
                    <div className={styles.products}>
                      <div className={styles.productsHeader}>
                        <ThunderboltOutlined />
                        <span>符合条件的商品</span>
                      </div>
                      <div className={styles.productsGrid}>
                        {m.products.map((p) => (
                          <ItemBlock
                            key={p.id}
                            name={p.name}
                            category={p.class}
                            productId={p.id}
                            price={p.price}
                            img_url={p.img_url || 'logo.jpg'}
                          />
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            );
          })}

          {isLoading && (
            <div className={`${styles.row} ${styles.rowAi}`}>
              <div className={styles.avatar}>
                <RobotOutlined />
              </div>
              <div className={styles.bubbleWrap}>
                <div className={`${styles.bubble} ${styles.bubbleAi}`}>
                  <Space size={8}>
                    <LoadingOutlined />
                    <span className={styles.thinking}>正在思考...</span>
                  </Space>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className={styles.composer}>
          <div className={styles.quickRow}>
            {quickPrompts.map((p) => (
              <Button
                key={p.label}
                className={styles.quickButton}
                onClick={() => {
                  void sendMessage(p.value);
                }}
                disabled={isLoading}
                type="default"
              >
                {p.label}
              </Button>
            ))}
          </div>

          <div className={styles.inputRow}>
            <TextArea
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="告诉我你想买什么，比如：猫粮、狗狗玩具、预算、年龄、口味偏好…"
              autoSize={{ minRows: 1, maxRows: 4 }}
              onKeyDown={(e) => {
                if (e.key !== 'Enter') return;
                if (e.shiftKey) return;
                e.preventDefault();
                // Enter 发送，Shift+Enter 换行
                void sendMessage(inputValue);
              }}
              disabled={isLoading}
              className={styles.input}
            />
            <Button
              type="primary"
              className={styles.send}
              onClick={handleSend}
              disabled={isLoading || !inputValue.trim()}
              icon={<SendOutlined />}
            >
              发送
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AIShoppingModePage;
