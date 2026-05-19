import 'express-async-errors';
import express from 'express';
import cors from 'cors';
import { corsOptions } from './config/cors';
import { errorHandler } from './middleware/errorHandler';
import routes from './routes';

const app = express();

app.use(cors(corsOptions));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', service: 'machy-api', timestamp: new Date().toISOString() });
});

app.use('/api', routes);

app.use(errorHandler);

export default app;
