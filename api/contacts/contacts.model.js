const { MongoClient, ObjectId } = require('mongodb');

class ContactsModel {
  constructor() {
    this.contacts = null;
  }

  async createContact(contactParams) {
    await this.getContactsCollection();
    const insertResult = await this.contacts.insertOne(contactParams);

    return this.contacts.findOne({
      _id: new ObjectId(insertResult.insertedId),
    });
  }

  async findAllContacts() {
    await this.getContactsCollection();
    return this.contacts.find().toArray();
  }

  async findContactById(id) {
    await this.getContactsCollection();
    if (!ObjectId.isValid(id)) {
      return null;
    }

    console.log('id', id);

    return this.contacts.findOne({ _id: new ObjectId(id) });
  }

  async updateContactById(id, contactParams) {
    await this.getContactsCollection();
    if (!ObjectId.isValid(id)) {
      return null;
    }

    return this.contacts.findOneAndUpdate(
      {
        _id: new ObjectId(id),
      },
      { $set: contactParams },
      { new: true },
    );
  }

  async deleteContactById(id) {
    await this.getContactsCollection();
    if (!ObjectId.isValid(id)) {
      return null;
    }

    return this.contacts.deleteOne({ _id: new ObjectId(id) });
  }

  async getContactsCollection() {
    if (this.contacts) {
      return;
    }

    const client = await MongoClient.connect(process.env.MONGO_DB_URL);
    const db = client.db(process.env.MONGO_DB_NAME);

    this.contacts = await db.createCollection('contacts');
  }
}

export const contactsModel = new ContactsModel();
