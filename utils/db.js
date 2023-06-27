import { MongoClient } from 'mongodb';

class DBClient {
  contructor() {
    console.log('Creating MongoDB client');
    const host = process.getenv('DB_HOST', 'localhost');
    const port = process.getenv('DB_PORT', '27017');
    const database = process.getenv('DB_DATABASE', 'files_manager');
    this.client = new MongoClient(`mongodb://${host}:${port}`, { useUnifiedTopology: true });
    try {
      this.client.connect();
      this.database = this.client.db(database);
    } catch (err) {
      console.log('Could not connect to database:', err);
    }
  }

  isAlive() {
    if (!this.client) {
      return false;
    }
    return this.client.isConnected();
  }

  async nbUsers() {
    const users = this.database.collection('users');
    const nb = await users.countDocuments({}, { hint: '_id_' });
    return nb;
  }

  async nbFiles() {
    const files = this.database.collection('files');
    const nb = await files.countDocuments({}, { hint: '_id_' });
    return nb;
  }
}

const dbClient = new DBClient();
export default dbClient;
