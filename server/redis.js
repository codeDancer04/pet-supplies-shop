const { createClient } = require('redis');

const client = createClient({
  url: 'redis://localhost:6379' // 默认端口
});

client.on('error', (err) => console.error('Redis Client Error', err));

// 创建连接完成的Promise
const connectionPromise = (async () => {
  try {
    await client.connect();
    console.log('Redis connected successfully');
    return client; // 连接成功后返回客户端实例
  } catch (err) {
    console.error('Redis connection failed:', err);
    // 可根据需求处理连接失败情况（如重连/退出进程等）
    process.exit(1); // 连接失败时退出进程
  }
})();

module.exports = {
  // 暴露连接状态的Promise
  getClient: async () => {
    try {
      // 确保返回已连接的客户端
      return await connectionPromise;
    } catch (err) {
      throw new Error('Failed to get Redis client: ' + err.message);
    }
  }
};