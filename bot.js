const TelegramBot = require('node-telegram-bot-api');
const fromElvesToRussian = require('./elves-translator');
const config = require('./config.json');

const app = require('express')();
const http = require('http').Server(app);
const io = require('socket.io')(http);

const token = config.token;
const bot = new TelegramBot(token, {polling: true});

bot.onText(/\/gongalomod/, (msg) => {

  if (msg.text) {

    let text = msg.text.replace(/\/gongalomod/, '');

    bot.sendMessage(msg.chat.id, msg.from.first_name + " хотел сказать : " + fromElvesToRussian(text));
  }

});

bot.on('message', (msg) => {

  const chatId = msg.chat.id;

  let translated = fromElvesToRussian(msg.text);

  if(translated !== msg.text) {
    bot.sendMessage(chatId, `Эльф в чате! Похоже он хотел сказать: ${translated}`);
  }

  if(msg.text.includes('СПОЙЛЕР')) {
    bot.deleteMessage(chatId, msg.message_id)
  }

});


app.get('/', function(req, res){
  res.sendFile(__dirname + '/index.html');
});


http.listen(3000, function(){
  console.log('listening on *:3000');
});

io.on('connection', function(socket){
  socket.on('chat message', function(msg){
    bot.sendMessage(-1001123167251, msg);
  });
});
