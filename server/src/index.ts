import express from 'express';
import cors from 'cors';
import artworksRouter from './routes/artworks';
import exhibitionsRouter from './routes/exhibitions';
import subscriptionsRouter from './routes/subscriptions';
import pickupsRouter from './routes/pickups';
import statisticsRouter from './routes/statistics';
import revenuesRouter from './routes/revenues';
import handoversRouter from './routes/handovers';

const app = express();
const PORT = 9502;

app.use(cors());
app.use(express.json());

app.use('/api/artworks', artworksRouter);
app.use('/api/exhibitions', exhibitionsRouter);
app.use('/api/subscriptions', subscriptionsRouter);
app.use('/api/pickups', pickupsRouter);
app.use('/api/statistics', statisticsRouter);
app.use('/api/revenues', revenuesRouter);
app.use('/api/handovers', handoversRouter);

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: '服务器运行正常' });
});

app.listen(PORT, () => {
  console.log(`服务器运行在 http://localhost:${PORT}`);
});

export default app;
