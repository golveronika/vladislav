const axios = require('axios').default;
const Bot = require('node-telegram-bot-api');

require('dotenv').config();

const TOKEN = (process.env.NODE_ENV === 'production') ? process.env.BOT_TOKEN : process.env.BOT_TEST_TOKEN;
const webHookUrl = process.env.HEROKU_URL;

let bot;

if (process.env.NODE_ENV === 'production') {
	bot = new Bot(TOKEN);
	bot.setWebHook(webHookUrl + bot.token);
} else {
	bot = new Bot(TOKEN, { polling: true });
}

console.log('bot server started...');

// Connection to Database an massage handlers:

const MongoClient = require('mongodb').MongoClient;
const databaseName = 'vladislav';
const uri = process.env.MONGO_URL;

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

	const CHAT_ID = process.env.CHAT_ID;

	let Answers = db.collection('answers');
	let Randoms = db.collection('randoms');

	bot.onText(/найди компромат/i, (msg, match) => {

		const entity = msg.entities ? msg.entities[0] : null;
		const { text } = msg;
		const chatid = msg.chat.id;

		if (entity) {
			const mention = text.substr(entity.offset + 1, entity.length);
			if (mention.toLocaleLowerCase().indexOf('golveronika') > -1) {
				bot.sendMessage(chatid, `На Веронику ничего не нашел`);
			} else {
				const index = Math.floor(Math.random() * kompromat.length);
				bot.sendPhoto(chatid, kompromat[index], {
					caption: `Смотри что я нашел в папке "C:\\\\Users\\${mention}\\drochka\\" у @${mention}`
				});
			}
		}
	})

	bot.onText(/\/addRandom (.+)/, (msg, match) => {

		const text = match[1];
		const chatid = msg.chat.id;
		
		if (text) {
			Randoms.insertOne({
				text
			},(error) => {
				if (error) {
					return console.log('Unable to insert Random!');
				} else {
					bot.sendMessage(chatid, 'Спасибо.');
				}
			});
		}
	});

	bot.onText(/\/addAnswer (.+)/, (msg, match) => {
		if (match[1]) {
			const key = match[1].split('=')[0];
			const answer = match[1].split('=')[1];

			if (key && answer) {
				Answers.insertOne({ key: key.trim(), answer },
					(error) => {
						if (!error) {
							bot.sendMessage(msg.chat.id, 'Добавил.');
						}
					}
				);
			}
		}
	});

	//Hanldler on ANY message:
	bot.on('message', async (msg) => {
		const { text } = msg;
		const chatid = msg.chat.id;

		if (text && !text.match(/^\//gm)) {

			if (text.toLocaleLowerCase().indexOf('собери всех на') >= 0) {
				const question = text.toLocaleLowerCase().replace('собери', 'Cобирайтесь').replace('всех', 'все')
				bot.sendPoll(
					chatid, 
					`${question} @all душечки красотулечки, вы как? Идём ${question.replace('Cобирайтесь все', '')}?`, 
					['Иду','Не иду','Не знаю'], { is_anonymous: false});
				return;
			} 

			const allAnswers = await Answers.find().toArray().then(result => result);

			const answer = allAnswers.find(item => {
				const currentAnswer = item.answer;
				let arrKey = item.key.replace(/([^a-zA-Z^а-яА-Я^\s])/gmi, '').split(' ');
				arrKey = arrKey.map(item => item.toLocaleLowerCase());
				const match = text.toLocaleLowerCase().match(new RegExp('('+arrKey.join(')|(')+')', 'i'))
				if (match) return currentAnswer;
				else false;
			});
			if (answer) {
				bot.sendMessage(chatid, answer.answer);
			}
		}
	})


	const schedule = require('node-schedule');

	const sendRandom = async () => {
		const length = await Randoms.count();
		const index = Math.floor(Math.random() * length);
		const message = await Randoms.findOne({}, { skip: index });
		if (message) {
			bot.sendMessage(CHAT_ID, message.text);
		}
	};

	const job = schedule.scheduleJob({ hour: 14, minute: 0 }, function () {
		sendRandom();
	});
	// const job2 = schedule.scheduleJob({ hour: 14 }, function () {
	// 	sendRandom();
	// });
	// const job3 = schedule.scheduleJob({ hour: 18 }, function () {
	// 	sendRandom();
	// });


	if (process.env.NODE_ENV === 'production') {
		const selfWakeUpHeroku = () => {
			axios.get(webHookUrl)
				.then(function (response) {
					console.info('self wake up request done');
				})
				.catch(function (error) {
					console.info('self wake up request error');
				})
		}
		schedule.scheduleJob('*/10 * * * *', selfWakeUpHeroku)		
	}

});

module.exports = bot;
