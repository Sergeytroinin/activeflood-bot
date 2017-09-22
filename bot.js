const TelegramBot = require('node-telegram-bot-api');
const fromElvesToRussian = require('./elves-translator');
const config = require('./config.json');

const token = config.token;
const bot = new TelegramBot(token, {polling: true});

bot.onText(/\/gongalomod/, (msg) => {

  if (msg.text) {
    bot.sendMessage(msg.chat.id, msg.from.first_name + " хотел сказать : " + fromElvesToRussian(text));
  }

});

bot.on('message', (msg) => {

  const chatId = msg.chat.id;

  if (msg.text && msg.text.toLowerCase().includes("флуд")) {
    bot.sendMessage(msg.chat.id, "Хочешь пофлудить, " + msg.from.first_name + "?");
  }

  let translated = fromElvesToRussian(msg.text);

  if(translated !== msg.text) {
    bot.sendMessage(chatId, `Эльф в чате! Похоже он хотел сказать: ${translated}`);
  }

});