const express = require('express');
const mineflayer = require('mineflayer');
const { AutoAuth } = require('mineflayer-auto-auth');
const config = require('./config.json');
const app = express();

let moveInterval;
let botStatus = 'disconnected';
let lastError = null;

function startBot() {
  const bot = mineflayer.createBot({
    host: config.serverIP,
    port: config.serverPort,
    username: config.botUsername,
    version: '1.21.8',
    auth: 'offline',
    plugins: [AutoAuth],
    AutoAuth: {
      logging: true,
      password: 'bot112022',
      ignoreRepeat: true
    }
  });

  bot.on('error', (err) => {
    console.log('Bot encountered an error:', err);
    lastError = err.message;
    botStatus = 'error';
    clearInterval(moveInterval);
  });

  bot.on('end', () => {
    console.log('Bot disconnected from the server');
    botStatus = 'disconnected';
    clearInterval(moveInterval);
    setTimeout(startBot, 5000);
  });

  bot.on('spawn', () => {
    console.log('Bot has spawned successfully.');
    botStatus = 'connected';
    lastError = null;
    bot.chat('Connected Sucessfully!');

    moveInterval = setInterval(() => {
      const direction = Math.random() > 0.5 ? 'forward' : 'back';
      bot.setControlState(direction, true);
      bot.setControlState('jump', true);

      console.log(`🦘 Bot 跳跃移动：${direction.toUpperCase()}!`);

      setTimeout(() => {
        bot.setControlState(direction, false);
        bot.setControlState('jump', false);
      }, 500);
    }, 20000 + Math.random() * 20000);
  });
}

app.get('/', (req, res) => {
  res.send(`
    <html>
      <head>
        <title>Minecraft Bot Status</title>
        <style>
          body { font-family: Arial, sans-serif; max-width: 800px; margin: 50px auto; padding: 20px; }
          .status { padding: 20px; border-radius: 8px; margin: 20px 0; }
          .connected { background-color: #d4edda; color: #155724; }
          .disconnected { background-color: #fff3cd; color: #856404; }
          .error { background-color: #f8d7da; color: #721c24; }
          h1 { color: #333; }
          .info { background-color: #f8f9fa; padding: 15px; border-radius: 5px; margin: 10px 0; }
        </style>
      </head>
      <body>
        <h1>Minecraft AFK Bot</h1>
        <div class="status ${botStatus}">
          <h2>Status: ${botStatus.toUpperCase()}</h2>
          ${lastError ? `<p>Last Error: ${lastError}</p>` : ''}
        </div>
        <div class="info">
          <h3>Configuration</h3>
          <p><strong>Server:</strong> ${config.serverIP}:${config.serverPort}</p>
          <p><strong>Username:</strong> ${config.botUsername}</p>
        </div>
        <div class="info">
          <h3>Instructions</h3>
          <p>Update the <code>config.json</code> file with your Minecraft server details:</p>
          <ul>
            <li><strong>serverIP:</strong> Your Minecraft server address</li>
            <li><strong>serverPort:</strong> Your Minecraft server port (default: 25565)</li>
            <li><strong>botUsername:</strong> Your Minecraft account username</li>
          </ul>
        </div>
      </body>
    </html>
  `);
});

app.listen(5000, '0.0.0.0', () => {
  console.log(`Website is Running on http://0.0.0.0:5000`);
});

startBot();
