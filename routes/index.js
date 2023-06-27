import AppController from '../controllers/AppController.js';

function addRoutes(app) {
  app.get('/status', AppController.getStatus);
  app.get('/stats', AppController.getStats);
}

export default addRoutes;
