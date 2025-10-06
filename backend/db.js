import { MongoClient } from 'mongodb';

let client = null;

export async function getDb() {
  if (!client) {
    const uri = process.env.MONGODB_URI;
    if (!uri) {
      throw new Error('MONGODB_URI environment variable is not set');
    }
    client = new MongoClient(uri);
    await client.connect();
    console.log('✓ Connected to MongoDB');
  }
  return client.db();
}

export async function closeDb() {
  if (client) {
    await client.close();
    client = null;
  }
}
