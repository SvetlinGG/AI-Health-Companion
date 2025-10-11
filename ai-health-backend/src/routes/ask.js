import { Router } from 'express';
import { v4 as uuid } from 'uuid';
import { db } from '../data.js';

export const askRouter = Router();

// POST /api/ask { question: string }
askRouter.post('/', (req, res) => {
  const { question } = req.body || {};
  if (!question || typeof question !== 'string') {
    return res.status(400).json({ error: 'Missing question' });
  }

  // MOCK: тук по-късно извикваме Gemini с RAG контекст
  const answer = [
    'This is a concise, educational answer (mock).',
    'If symptoms are severe or persistent, consider seeking medical advice.'
  ].join(' ');

  // mock sources
  const sources = [
    { title: 'WHO – Topic Overview', url: 'https://www.who.int/' },
    { title: 'NHS – Guidance', url: 'https://www.nhs.uk/' }
  ];

  // логика за telemetry → events/messages/sources
  const event_id = uuid();
  const created_at = new Date().toISOString();
  const user_hash = 'u_' + Math.random().toString(36).slice(2, 10);

  db.events.push({
    event_id,
    user_hash,
    question,
    answer_len: answer.length,
    latency_ms: 500 + Math.floor(Math.random() * 400),
    sources_count: sources.length,
    thumbs_up: null,
    created_at
  });

  db.messages.push({
    message_id: uuid(),
    event_id,
    role: 'user',
    text: question,
    tokens: question.length,
    created_at
  });
  db.messages.push({
    message_id: uuid(),
    event_id,
    role: 'assistant',
    text: answer,
    tokens: answer.length / 4,
    created_at
  });

  sources.forEach((s, i) => {
    db.sources.push({
      source_id: uuid(),
      event_id,
      title: s.title,
      url: s.url,
      domain: new URL(s.url).hostname,
      rank: i + 1,
      created_at
    });
  });

  res.json({ answer, sources });
});
