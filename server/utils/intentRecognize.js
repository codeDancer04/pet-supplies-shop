const axios = require('axios');

const normalize = (text) => String(text ?? '').trim().toLowerCase();

const matchAny = (haystack, keywords) => keywords.some((k) => haystack.includes(k));

const inferQueryResource = (text) => {
  const t = normalize(text);
  if (t.includes('订单')) return 'orders';
  if (t.includes('用户') || t.includes('账号')) return 'user';
  if ((t.includes('我') || t.includes('我的')) && (t.includes('信息') || t.includes('资料') || t.includes('头像') || t.includes('昵称') || t.includes('个人'))) {
    return 'user';
  }
  return 'products';
};

// 模型输出可能会带一些说明文字（例如：```json ... ``` 或“以下是 JSON：...”），
// 这里用“截取第一个 { 到最后一个 }”的方式尽量取出 JSON。
const extractJsonObject = (text) => {
  const s = String(text ?? '');
  const start = s.indexOf('{');
  const end = s.lastIndexOf('}');
  if (start === -1 || end === -1 || end <= start) return null;
  return JSON.parse(s.slice(start, end + 1));
};

const callModelForDecision = async ({ text, userId }) => {
  const apiKey = process.env.DASHSCOPE_API_KEY ?? '';
  if (!apiKey) return { shouldUseTool: false, via: 'model', confidence: 0, reason: '服务端未配置 DASHSCOPE_API_KEY' };

  // 这份“工具说明”是给模型看的，帮助它知道你有哪些工具可用
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
            '返回格式：{"tool":"none"|"query_db"|"create_order","args":{},"confidence":0-1,"reason":"..."}。' +
            '不得要求/返回其他用户隐私信息；订单/用户查询只能针对当前用户。'
        },
        {
          role: 'user',
          content: JSON.stringify({ input: { text, userId }, toolSpec })
        }
      ]
    },
    { headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' }, timeout: 30000 }
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
  const confidence = typeof obj?.confidence === 'number' && Number.isFinite(obj.confidence) ? obj.confidence : 0;
  const reason = typeof obj?.reason === 'string' ? obj.reason : 'model';
  const args = obj?.args && typeof obj.args === 'object' && !Array.isArray(obj.args) ? obj.args : {};

  if (tool === 'none') return { shouldUseTool: false, via: 'model', confidence, reason };
  return { shouldUseTool: true, tool, args, via: 'model', confidence, reason };
};

// - shouldUseTool + tool + args（或 shouldUseTool=false）
const recognizeIntent = async ({ text, userId } = {}) => {
  const normalized = normalize(text);
  const buyKeywords = ['买', '下单'];
  const queryKeywords = ['查找', '查', '查询', '搜索', '找', '看看', '有哪些', '有什么', '有'];

  if (matchAny(normalized, buyKeywords)) {
    return callModelForDecision({ text, userId });
  }

  if (matchAny(normalized, queryKeywords)) {
    return {
      shouldUseTool: true,
      tool: 'query_db',
      args: { resource: inferQueryResource(text) },
      via: 'keyword',
      confidence: 0.8,
      reason: '命中查找关键词'
    };
  }

  return callModelForDecision({ text, userId });
};

module.exports = { recognizeIntent };
