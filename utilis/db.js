#!/usr/bin/node

const { MongoClient } = require('mongodb');
const { DB_HOST, DB_PORT, DB_DATABASE } = process.env;
const { pwHashed } = require('./utils');

class DBClient {
    constructor() {
        const url = `mongodb://${DB_HOST}:${DB_PORT}`;
        MongoClient.connect(url, { useUnifiedTopology: true }, (err, client) => {
        if (!err) {
            this.db = client.db(DB_DATABASE);
        } else {
            this.db = false;
        }
        });
    }
    
    isAlive() {
        return !!this.db;
    }

    async nbUsers() {
        return this.db.collection('users').countDocuments();
    }

    async nbFiles() {
        return this.db.collection('files').countDocuments();
    }

    async findUser(user) {
        return this.db.collection('users').findOne(user);
    }

    async createUser(email, password) {
        return this.db.collection('users').insertOne({ email, password: pwHashed(password) });
    }

    async updateUser(email, password) {
        return this.db.collection('users').updateOne({ email }, { $set: { password: pwHashed(password) } });
    }

    async deleteUser(email) {
        return this.db.collection('users').deleteOne({ email });
    }

    async getConnect(email, password) {
        return this.db.collection('users').findOne({ email, password: pwHashed(password) });
    }

    async disconnect(token) {
        return this.db.collection('users').updateOne({ token }, { $set: { token: null } });
    }

    async saveFile(user, name, type, data) {
        return this.db.collection('files').insertOne({ userId: user, name, type, data });
    }

    async getFile(fileId) {
        return this.db.collection('files').findOne({ _id: fileId });
    }

    async deleteFile(fileId) {

    }

    async saveImage(user, body) {
        return this.db.collection('files').insertOne({ userId: user, body });
    }

    async getImage(imageId) {

    }
}

const dbClient = new DBClient();
module.exports = dbClient;

