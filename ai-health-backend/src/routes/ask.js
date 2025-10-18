import { Router } from 'express';
import { v4 as uuid } from 'uuid';
import { db } from '../data.js';

export const askRouter = Router();

// POST /api/ask { question: string }
askRouter.post('/', async (req, res) => {
  try {
    const { question } = req.body || {};
    if (!question || typeof question !== 'string') {
      return res.status(400).json({ error: 'Missing question' });
    }

    // Mock response for testing
    const text = `I understand you're asking about "${question}". This is a mock response while the AI system is being configured. Please consult with healthcare professionals for medical advice.`;
    const sources = [
      { title: "Health Information", url: "https://example.com/health" },
      { title: "Medical Resources", url: "https://example.com/medical" }
    ];

    // Telemetry
    const event_id = uuid();
    const created_at = new Date().toISOString();
    const user_hash = 'u_' + Math.random().toString(36).slice(2, 10);

    db.events.push({
      event_id, user_hash, question,
      answer_len: text.length, latency_ms: 0,
      sources_count: sources.length, thumbs_up: null, created_at
    });

    db.messages.push({ message_id: uuid(), event_id, role: 'user', text: question, tokens: question.length, created_at });
    db.messages.push({ message_id: uuid(), event_id, role: 'assistant', text, tokens: Math.floor(text.length/4), created_at });

    sources.forEach((s, i) => db.sources.push({
      source_id: uuid(), event_id, title: s.title, url: s.url,
      domain: 'example.com', rank: i+1, created_at
    }));

    res.json({ answer: text, sources });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Server error' });
  }
});