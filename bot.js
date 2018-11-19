const TelegramBot = require('node-telegram-bot-api');
const fromElvesToRussian = require('./elves-translator');
const config = require('./config.json');

const app = require('express')();
app.set('view engine', 'pug');
const http = require('http').Server(app);
const io = require('socket.io')(http);

const token = config.token;
const bot = new TelegramBot(token, {polling: true});


const spoilers = {
  456: {

  }
};



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

    const spoilerId = Math.random();

    const spoiler = {
      text: msg.text,
      author: `${msg.from.first_name} ${msg.from.last_name}`
    };

    spoilers[spoilerId] = spoiler;

    bot.deleteMessage(chatId, msg.message_id);
    bot.sendMessage(chatId, `Посмотреть спойлер: http://45.32.234.128:3000/spoiler/${spoilerId}`)
  }

});


app.get('/', function(req, res){
  res.sendFile(__dirname + '/index.html');
});

app.get('/spoiler/:id', function(req, res){

  const spoilerId = req.params.id;
  const spoiler = spoilers[spoilerId];

  if(!spoiler) {
    res.status(404).send('Нет такого спойлера');
  } else {
    res.render('spoiler', { title: 'Spoiler', text: spoiler.text });
  }
});


http.listen(3000, function(){
  console.log('listening on *:3000');
});

io.on('connection', function(socket){
  socket.on('chat message', function(msg){
    bot.sendMessage(-1001123167251, msg);
  });
});
