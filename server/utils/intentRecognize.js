const axios = require('axios');

// 模型输出可能会带一些说明文字（例如：```json ... ``` 或“以下是 JSON：...”），
// 这里用“截取第一个 { 到最后一个 }”的方式尽量取出 JSON。
const extractJsonObject = (text) => {
  const s = String(text ?? '');
  const start = s.indexOf('{');
  const end = s.lastIndexOf('}');
  if (start === -1 || end === -1 || end <= start) return null;
  return JSON.parse(s.slice(start, end + 1));
};

// 调用模型进行意图识别
const callModelForDecision = async ({ text, userId, messages }) => {

  const apiKey = process.env.DASHSCOPE_API_KEY ?? '';

  if (!apiKey) return { 
    shouldUseTool: false, 
    via: 'model', 
    confidence: 0, 
    reason: '服务端未配置 DASHSCOPE_API_KEY' 
  };

  // 这份“工具说明”是给模型看的，帮助它知道我有哪些工具可用
  const toolSpec = {
    tools: [
      {
        name: 'query_db',
        description: '查询商品/订单/用户数据（订单/用户只允许查询当前登录用户）'
      },
      {
        name: 'create_order',
        description: '创建订单（必须是当前用户）'
      }
    ]
  };

  // 调用 DashScope 兼容模式（OpenAI 格式）
  const response = await axios.post(
    'https://dashscope.aliyuncs.com/compatible-mode/v1/chat/completions',
    {
      model: 'qwen-plus',
      messages: [
        {
          role: 'system',
          content:
            '你是电商购物助手的意图识别器。只输出 JSON，不要输出额外文本。' +
            '在args中包含必要参数（例如：如果你要查询商品表（products），就在args中包含resource = products,以及category（只能为food,furniture,toy）；' +
            '如果你要查询订单表（orders），就在args中包含resource = orders；如果你要查询用户表（users），就在args中包含resource = users；' +
            '如果你要创建订单（orders），就在args中包含productId或者productName（必须包含一个）、amount（数量，1-99）。' +
            '不得要求/返回其他用户隐私信息；订单/用户查询只能针对当前用户。' +
            '再次注意，你只能输出JSON格式的内容，不能输出其他文本。' +
            '返回格式：{"tool":"none"|"query_db"|"create_order","args":{},"confidence":0-1,"reason":"..."}。'
        },
        ...(messages ? messages.map(m => ({
          role: m.role,
          content: m.content
        })) : []),
        {
          role: 'user',
          content: JSON.stringify({ input: { text, userId }, toolSpec })
        }
      ]
    },
    {
      headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
      timeout: 30000,
      proxy: false
    }
  );

  // 取模型返回的文本内容
  const content = response?.data?.choices?.[0]?.message?.content;
  if (typeof content !== 'string') return { shouldUseTool: false, via: 'model', confidence: 0, reason: '模型未返回可解析内容' };

  // 尝试解析模型 JSON
  let obj;
  try {
    obj = extractJsonObject(content);
  } catch {
    return { shouldUseTool: false, via: 'model', confidence: 0, reason: '模型返回非 JSON' };
  }

  // 工具名白名单：即使模型胡乱输出，也不会被执行到未知工具
  const tool = obj?.tool === 'query_db' || obj?.tool === 'create_order' ? obj.tool : 'none';
  const confidence = obj?.confidence ?? 0;
  const reason = obj?.reason ?? '没有理由';
  const args = obj.args ?? {};

  if (tool === 'none') return { shouldUseTool: false, via: 'model', confidence, reason };
  return { 
      shouldUseTool: true, 
      tool, 
      args, 
      via: 'model', 
      confidence, 
      reason 
  };
};


const recognizeIntent = async ({ text, userId, messages } = {}) => {
  return callModelForDecision({ text, userId, messages });
};

module.exports = { recognizeIntent };
