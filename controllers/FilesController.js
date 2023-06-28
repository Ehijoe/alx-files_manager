import { ObjectId } from 'mongodb';
import { v4 as uuidv4 } from 'uuid';
import fs from 'fs';
import dbClient from '../utils/db.js';
import redisClient from '../utils/redis.js';

class FilesController {
  static async postUpload(request, response) {
    const files = dbClient.database.collection('files');
    const fileType = request.body.type;
    const {
      name, parentId, isPublic, data,
    } = request.body;
    const document = {
      name,
      type: fileType,
      parentId: parentId || 0,
      isPublic: isPublic || false,
    };
    if (!name) {
      response.status(400).json({ error: 'Missing name' });
      return;
    }
    if (!['folder', 'file', 'image'].includes(fileType)) {
      response.status(400).json({ error: 'Missing type' });
      return;
    }
    if (fileType !== 'folder') {
      if (!data) {
        response.status(400).json({ error: 'Missing data' });
        return;
      }
      document.data = data;
    }

    if (parentId) {
      const parent = files.findOne({ _id: ObjectId(parentId) });
      if (!parent) {
        response.status(400).json({ error: 'Parent not found' });
        return;
      }
      if (parent.type !== 'folder') {
        response.status(400).json({ error: 'Parent is not a folder' });
        return;
      }
    }

    const token = request.get('X-Token');
    let userId;
    try {
      userId = await redisClient.get(`auth_${token}`);
    } catch (err) {
      console.log(err);
      response.status(401).json({ error: 'Unauthorized' });
      return;
    }
    if (!userId) {
      response.status(401).json({ error: 'Unauthorized' });
      return;
    }
    document.userId = userId;

    if (document.type === 'folder') {
      files.insertOne(document);
      response.status(201).json(document);
      return;
    }

    const rootDir = process.env.FOLDER_PATH || '/tmp/files_manager';

    if (!fs.existsSync(rootDir)) {
      fs.mkdirSync(rootDir, { recursive: true });
    }
    const filename = uuidv4();
    document.localPath = `${rootDir}/${filename}`;
    fs.writeFile(document.localPath, Buffer.from(data, 'base64'), (err) => {
      if (err) console.log('Error writing file:', err);
    });
    response.status(201).json(document);
  }
}

export default FilesController;
