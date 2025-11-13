const express = require('express');
const mineflayer = require('mineflayer');
const { AutoAuth } = require('mineflayer-auto-auth');
const config = require('./falix.config.json');
const app = express();

let moveInterval;  // 🔥 新增：定时器句柄，用于清理

function startBot() {
  const bot = mineflayer.createBot({
    host: config.serverIP,
    port: config.serverPort,
    username: config.botUsername,
    plugins: [AutoAuth],
    AutoAuth: 'bot112022'
  });

  bot.on('error', (err) => {
    console.log('Bot encountered an error:', err);
    clearInterval(moveInterval);  // 🔥 清理定时器
  });

  bot.on('end', () => {
    console.log('Bot disconnected from the server');
    clearInterval(moveInterval);  // 🔥 清理定时器
    setTimeout(startBot, 5000);   // 🔥 自动重连（5秒后）
  });

  bot.on('spawn', () => {
    console.log('Bot has spawned successfully.');
    bot.chat('Connected Sucessfully!');

    // 🔥 新增：简单跳跃移动功能（每 20-40 秒随机跳 + 前进，防 AFK）
    moveInterval = setInterval(() => {
      // 随机方向：forward 或 back
      const direction = Math.random() > 0.5 ? 'forward' : 'back';
      bot.setControlState(direction, true);  // 前进/后退
      bot.setControlState('jump', true);     // 跳跃

      console.log(`🦘 Bot 跳跃移动：${direction.toUpperCase()}!`);

      // 持续 500ms 后停止（模拟自然动作）
      setTimeout(() => {
        bot.setControlState(direction, false);
        bot.setControlState('jump', false);
      }, 500);
    }, 20000 + Math.random() * 20000);  // 随机间隔 20-40 秒

    startLiveApp();
  });
}

function startLiveApp() {
  app.get('/', (req, res) => {
    res.send('Minecraft Connected!');
  });
  app.listen(3000, () => {
    console.log(`Website is Running on http://localhost:3000`);
  });
}

startBot();