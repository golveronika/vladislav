let cachedArray = {};

const messageCountParser = (message) => {
	wordArray = message
		.replace(/,/g, ' ')
		.replace('.', ' ')
		.replace('?', ' ')
		.toLowerCase()
		.split(' ')
		.filter((word) => word.length >= 3);
	addWordsToCachedArray(wordArray);
};

const addWordsToCachedArray = (wordArray) => {
	let countWordsArray = {};
	for (let i = 0; i < wordArray.length; i++) {
		let word = wordArray[i];
		countWordsArray[word] = countWordsArray[word] + 1 || 1;
	}
	if (Object.keys(cachedArray).length === 0) {
		cachedArray = countWordsArray;
	} else {
		// merging cachedArray and countWordsArray
		Object.keys(countWordsArray).forEach((word) => {
			cachedArray[word] = (cachedArray[word] ? cachedArray[word] : 0) + countWordsArray[word];
		});
	}
};

const MongoClient = require('mongodb').MongoClient;

async function main() {
	const client = await MongoClient.connect('mongodb://localhost:27017', {
		useNewUrlParser: true,
		useUnifiedTopology: true
	}).catch((err) => console.log(err));

	const databaseName = 'vladislav';
	const db = client.db(databaseName);
	let Words = db.collection('words');
	// Words.deleteMany({});
	messageCountParser('привет всем, я, тип, ну короче это Ваня меня зовут, Ваня, вот');
	messageCountParser('ну а если это, бля, короче, Ваня, Ваня нахуй, Ваня. похуй');
	cachedMalformedArray = [];

	// console.log(cachedMalformedArray);
	// Words.insertMany(cachedMalformedArray);

	// taking from BD any of records which has same ids as cachedArray keys
	const existingArray = await Words.find({ _id: { $in: Object.keys(cachedArray) } }).toArray();
	// console.log(existingArray);

	// checking if array is empty
	if (existingArray.length !== 0) {
		// taking count variable from BD records and adding it to cachedArray count field
		Object.keys(cachedArray).forEach((word) => {
			// sugar magic
			cachedArray[word] += existingArray.filter((el) => el._id === word)[0].count || 0;
		});
	}
	// console.log(cachedArray);
	// making new array from cachedArray, which mongodb will eat
	Object.keys(cachedArray).forEach((key) => {
		cachedMalformedArray.push({ _id: key, count: cachedArray[key] });
	});

	// console.log(cachedMalformedArray);
	Words.insertMany(cachedMalformedArray, { ordered: true });
	// taking current records from BD to make sure that everything is ok
	const requestedWords = await Words.find().sort({ count: -1 }, { item: 1, status: 1 }).limit(10).toArray();
	console.log('in bd: ', requestedWords);
}

main()
	.then(() => console.log('ok'))
	.catch((err) => console.error(err));
