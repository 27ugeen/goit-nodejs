const MongoDB = require('mongodb');
const { MongoClient, ObjectId } = MongoDB;

const MONGO_DB_URL =
  'mongodb+srv://Gin:fmWWfAzcokOeKaiR@cluster0-0lvef.mongodb.net/db-contacts'; // TODO: add your url for MongoDB Atlas
const DB_NAME = 'db-contacts';

// console.log(MongoClient.connect(MONGO_DB_URL));

async function main() {
  const client = await MongoClient.connect(MONGO_DB_URL);
  const db = client.db(DB_NAME);

  const contacts = await db.createCollection('contacts');

  //   C (Created)

  //   await contacts.insertOne({
  //     name: 'Hello',
  //     email: 'Test@email.com',
  //     phone: '777-888-999'
  //   });

  //   await contacts.insertOne({
  //     name: 'test',
  //     surname: 'testosteron',
  //   });

  // R (read)

  //   console.log(await contacts.find({ name: 'test3' }).toArray());
  //   console.log(await contacts.find().toArray());

  // U (Update)
  //   await contacts.updateOne(
  //     { name: 'Hello' },
  //     { $set: { email: 'updated@mail.com' } },
  //   );
  //   await contacts.updateMany(
  //     { name: 'Hello' },
  //     { $set: { email: 'updated_many@mail.com' } },
  //   );

  // D (Delete)
  //   await contacts.deleteOne({ name: 'Hello' });
  //   await contacts.deleteMany({ name: "second" });

  //   console.log(
  //     await contacts.findOne({ _id: new ObjectId('5eae67f3a433015438b91558') }),
  //   );
//   console.log(ObjectId.isValid('5eae67f3a433015438b91558'));
}

main();
