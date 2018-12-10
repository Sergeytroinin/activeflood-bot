const TelegramBot = require('node-telegram-bot-api');
const fromElvesToRussian = require('./elves-translator');
const config = require('./config.json');
const request = require('request');

const app = require('express')();
app.set('view engine', 'pug');
const http = require('http').Server(app);
const io = require('socket.io')(http);

const token = config.token;
const bot = new TelegramBot(token, {polling: true});

let JOKE = null;

setInterval(() => {
  request('http://umorili.herokuapp.com/api/random?num=1', { json: true }, (err, res) => {
    if (err) {
      return console.log(err);
    }

    const joke = strip_html_tags(res.body[0].elementPureHtml);

    if(joke !== JOKE) {
      JOKE = joke;
      bot.sendMessage(msg.chat.id, joke);
    }
  })
}, 1000 * 60 * 10);

bot.onText(/\/gongalomod/, (msg) => {
  if (msg.text) {
    let text = msg.text.replace(/\/gongalomod/, '');
    bot.sendMessage(msg.chat.id, msg.from.first_name + " хотел сказать : " + fromElvesToRussian(text));
  }
});

function strip_html_tags(str)
{
  if ((str===null) || (str===''))
    return false;
  else
    str = str.toString();
  return str.replace(/<[^>]*>/g, '');
}

bot.onText(/\/joke/, (msg) => {
  request('http://umorili.herokuapp.com/api/random?num=1', { json: true }, (err, res) => {
    if (err) {
      return console.log(err);
    }

    const joke = strip_html_tags(res.body[0].elementPureHtml);

    if(joke === JOKE) {
      bot.sendMessage(msg.chat.id, 'Не время улыбаться');
    } else {
      JOKE = joke;
      bot.sendMessage(msg.chat.id, joke);
    }


  })
});

function getRandomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1) + min);
}

bot.onText(/\/roll/, msg => {
  bot.sendMessage(msg.chat.id, getRandomInt(1, 100));
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
    res.render('spoiler', { title: 'Spoiler', text: spoiler.text.replace(/(СПОЙЛЕР)/g, '') });
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
