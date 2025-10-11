import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';


dotenv.config();
const app = express();

const PORT = process.env.PORT || 3001;
const API_BASE = process.env.API_BASE || '/api';

app.use(cors());
app.use(express.json());

// health 
app.get('/', (_req, res) => res.json({ok: true, name: 'ai-health-backend'}));

// routes
// app.use(`${API_BASE}/ask`, askRouter);
// app.use(`${API_BASE}/etl`, etlRouter);

// not found
app.use((req, res) => res.status(404).json({error: 'Not found', path: req.path}));

app.listen(PORT, () => {
    console.log(`Server listening on http://lokalhost:${PORT}${API_BASE}`);
    
})

