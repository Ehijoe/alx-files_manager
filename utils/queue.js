import Queue from 'bull';

const fileQueue = Queue('thumbnail generation');

export default { fileQueue };
