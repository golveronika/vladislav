
module.exports = function(db) {

    console.log("BOT FILE!");

    const kompromat = [
        "https://i.pinimg.com/236x/ea/d1/6d/ead16d1a6aa69eeb1d935ce3adcd440b.jpg",
        "https://boombo.biz/uploads/posts/2022-05/thumbs/1651626871_36-boombo-biz-p-yaoi-golie-parni-erotika-43.jpg",
        "https://pw.artfile.me/wallpaper/11-03-2019/650x249/anime-kantai-collection-seksi-devushki-1444569.jpg",
    ];

    const telegramApi = require('node-telegram-bot-api');
    const schedule = require('node-schedule');

    const config = require('./config/config.json');

    const TOKEN = config.token;
    const PORT = config.port;
    const ngrockUrl = config.url;
    const HEROKU_URL = config.HEROKU_URL;

    const chatID = config.chatID;

    // const bot = new telegramApi(TOKEN, {polling: true});


    // const bot = new telegramApi(TOKEN, {
    //     webHook : {
    //         port: PORT,
    //         autoOpen: false
    //     }
    // });


    var express = require('express');
    var packageInfo = require('./package.json');
    var bodyParser = require('body-parser');

    var app = express();
    app.use(bodyParser.json());

    app.get('/', function (req, res) {
        res.json({ version: packageInfo.version });
    });

    var server = app.listen(PORT, function () {
    var host = server.address().address;
    var port = server.address().port;

    console.log('Web server started at http://%s:%s', host, port);
    });




    bot = new telegramApi(TOKEN);
    bot.setWebHook(HEROKU_URL + bot.token);


    app.post('/' + token, function (req, res) {
        bot.processUpdate(req.body);
        res.sendStatus(200);
      });

    // bot.openWebHook();
    // Телеграм промит иметь защищенный url address
    // мы должны иметь ssl сертификат
    // bot.setWebHook(`https://vladislav-go-beer.herokuapp.com/bot${TOKEN}`);

    let Answers = db.collection('answers');

    bot.on('message', msg => {

        const { text, chat: { id } } = msg;

        if (text && !text.match(/^\//gm)) {

            // console.log(text.toLocaleLowerCase().trim().indexOf("найди компромат на"))
            if (text.toLocaleLowerCase().trim().indexOf("найди компромат на") > -1) {
                if (msg.entities && msg.entities[0]) {
                    const mention = text.substr(msg.entities[0].offset + 1, msg.entities[0].length);
                    if (mention.indexOf("golveronika") > -1) {
                        bot.sendMessage(id, `На Веронику ничего не нашел`); 
                    } else {
                        const index = Math.floor(Math.random() * (kompromat.length));
                        bot.sendPhoto(id, kompromat[index], {caption: `Смотри что я нашел в папке "C:\\\\Users\\${mention}\\drochka\\" у @${mention}`});
                    }

                }

            } else {
                Answers.findOne({ key: text.toLocaleLowerCase() }, (error, result) => {
                    if (!error && result) {
                        const user_name = msg.from.username;
                        // console.log(msg)
                        bot.sendMessage(id, `${result.answer}`); 
                    }
                });                
            }
        }



    });

    bot.onText(/\/addAnswer (.+)/, (msg, match) => {

            if (match[1]) {
                const key = match[1].match(/^(.+)=/gm)[0].replace("=","").toLocaleLowerCase().trim();
                const answer = match[1].replace(key,"").replace("=","");
    
                if (key && answer) {
                    Answers.insertOne({
                        key,
                        answer
                    }, (error, result) => {
                        if (!error) {
                            bot.sendMessage(msg.chat.id, "Добавил."); 
                        }
                    })                    
                }

            }
    
      
      });


    let Randoms = db.collection('randoms');

    //Отсылка рандомной фразы из БД 
    const sentRandom = async () => {
        const length = await Randoms.count();
        const index = Math.floor(Math.random() * (length));
        const message = await Randoms.findOne({},{"skip": index,});
        if (message) {
            bot.sendMessage(chatID, message.text);
        }
    }

    const job = schedule.scheduleJob({ minute: 0 }, function() {
        sentRandom();
    });
    const job2 = schedule.scheduleJob({ minute: 30 }, function() {
        sentRandom();
    });
    
    //Добавление рандомной фразы в БД

    bot.onText(/\/addRandom (.+)/, (msg, match) => {
        const text = match[1]; 
        if (text) {
            Randoms.insertOne({
                text
             }, (error, result) => {
                 if (error) {
                     return console.log('Unable to insert Random!');
                 } else {
                    bot.sendMessage(msg.chat.id, "Спасибо."); 
                 }
             })           
        }
      });

};