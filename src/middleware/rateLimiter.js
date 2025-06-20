const rateLimit = require('express-rate-limit');

// 通用限流中间件
const createRateLimit = (windowMs, max, message) => {
  return rateLimit({
    windowMs,
    max,
    message: { message },
    standardHeaders: true,
    legacyHeaders: false
  });
};

// API通用限流
const apiLimiter = createRateLimit(
  parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000, // 15分钟
  parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100, // 100次请求
  '请求过于频繁，请稍后再试'
);

// 登录限流
const loginLimiter = createRateLimit(
  15 * 60 * 1000, // 15分钟
  5, // 5次尝试
  '登录尝试过于频繁，请15分钟后再试'
);

// 注册限流
const registerLimiter = createRateLimit(
  60 * 60 * 1000, // 1小时
  3, // 3次注册
  '注册过于频繁，请1小时后再试'
);

// 文件上传限流
const uploadLimiter = createRateLimit(
  60 * 1000, // 1分钟
  10, // 10个文件
  '文件上传过于频繁，请稍后再试'
);

module.exports = {
  apiLimiter,
  loginLimiter,
  registerLimiter,
  uploadLimiter
};

