// const https = require('https');
const axios = require('axios').default;

const config = require('./config.json');
require('dotenv').config();
var token = config.token;

var Bot = require('node-telegram-bot-api');
var bot;

if (process.env.NODE_ENV === 'production') {
	bot = new Bot(token);
	bot.setWebHook(config.url + bot.token);
} else {
	bot = new Bot(token, { polling: true });
}

console.log('bot server started...');

//-------------------------------------------------------------------

const MongoClient = require('mongodb').MongoClient;
const databaseName = 'vladislav';
const uri = config.mongoUri;

MongoClient.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true }, (error, client) => {
	if (error) {
		console.log(error);
		return console.log('Unable to connect to database!');
	}

	console.log('Connected correctly!');

	const db = client.db(databaseName);

	const kompromat = [
		'https://i.pinimg.com/236x/ea/d1/6d/ead16d1a6aa69eeb1d935ce3adcd440b.jpg',
		'https://boombo.biz/uploads/posts/2022-05/thumbs/1651626871_36-boombo-biz-p-yaoi-golie-parni-erotika-43.jpg',
		'https://pw.artfile.me/wallpaper/11-03-2019/650x249/anime-kantai-collection-seksi-devushki-1444569.jpg'
	];

	const chatID = config.chatID;

	let Answers = db.collection('answers');
	let Randoms = db.collection('randoms');

	bot.on('message', (msg) => {
		const {
			text,
			chat: { id }
		} = msg;
		if (text && !text.match(/^\//gm)) {
			if (text.toLocaleLowerCase().trim().indexOf('найди компромат на') > -1) {
				if (msg.entities && msg.entities[0]) {
					const mention = text.substr(msg.entities[0].offset + 1, msg.entities[0].length);
					if (mention.indexOf('golveronika') > -1) {
						bot.sendMessage(id, `На Веронику ничего не нашел`);
					} else {
						const index = Math.floor(Math.random() * kompromat.length);
						bot.sendPhoto(id, kompromat[index], {
							caption: `Смотри что я нашел в папке "C:\\\\Users\\${mention}\\drochka\\" у @${mention}`
						});
					}
				}
			} else {
				Answers.findOne({ key: text.toLocaleLowerCase() }, (error, result) => {
					if (!error && result) {
						bot.sendMessage(id, `${result.answer}`);
					}
				});
			}
		}
	});

	bot.onText(/\/addAnswer (.+)/, (msg, match) => {
		if (match[1]) {
			const key = match[1]
				.match(/^(.+)=/gm)[0]
				.replace('=', '')
				.toLocaleLowerCase()
				.trim();
			const answer = match[1].replace(key, '').replace('=', '');

			if (key && answer) {
				Answers.insertOne(
					{
						key,
						answer
					},
					(error, result) => {
						if (!error) {
							bot.sendMessage(msg.chat.id, 'Добавил.');
						}
					}
				);
			}
		}
	});

	bot.onText(/\/addRandom (.+)/, (msg, match) => {
		const text = match[1];
		if (text) {
			Randoms.insertOne(
				{
					text
				},
				(error, result) => {
					if (error) {
						return console.log('Unable to insert Random!');
					} else {
						bot.sendMessage(msg.chat.id, 'Спасибо.');
					}
				}
			);
		}
	});

	const schedule = require('node-schedule');

	const sentRandom = async () => {
		const length = await Randoms.count();
		const index = Math.floor(Math.random() * length);
		const message = await Randoms.findOne({}, { skip: index });
		if (message) {
			bot.sendMessage(chatID, message.text);
		}
	};

	const job = schedule.scheduleJob({ minute: 0 }, function () {
		sentRandom();
	});
	const job2 = schedule.scheduleJob({ minute: 30 }, function () {
		sentRandom();
	});


	if (process.env.NODE_ENV === 'production') {
		const selfWakeUpHeroku = () => {
			axios.get(config.url)
				.then(function (response) {
					console.info('self wake up request done');
				})
				.catch(function (error) {
					console.info('self wake up request error');
				})
		}
		schedule.scheduleJob('*/10 * * * *', selfWakeUpHeroku)		
	}


	// if (process.env.NODE_ENV === 'production') {
	// 	const selfWakeUpHeroku = () => {
	// 		const options = {
	// 			hostname: (new URL(config.url)).hostname,
	// 			method: 'GET'
	// 		}
	// 		https.request(options)
	// 		console.info('self wake up request done');
	// 	}
	// 	schedule.scheduleJob('*/10 * * * *', selfWakeUpHeroku)		
	// }

});

module.exports = bot;
