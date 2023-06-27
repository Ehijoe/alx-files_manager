import express from 'express';
import addRoutes from './routes/index.js';

const app = express();

const port = process.env.PORT || '5000';

addRoutes(app);

app.listen(port, () => {
  console.log(`Listening on port ${port}`);
});

export default app;
