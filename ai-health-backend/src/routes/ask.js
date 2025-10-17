import { Router } from 'express';
import { v4 as uuid } from 'uuid';
import { db } from '../data.js';
import { geminiAnswerWithCitations } from '../lib/gemini.js';

export const askRouter = Router();

// TODO: replace with real retrieval (Elastic) -> top-k passages
async function retrieveContext(question) {
  // Minimal placeholder: map your own content db/content index here
  return db.content.slice(0, 3).map(c => ({ title: c.title, url: c.url, text: '...' }));
}

// POST /api/ask { question: string }
askRouter.post('/', async (req, res) => {
  try {
    const { question } = req.body || {};
    if (!question || typeof question !== 'string') {
      return res.status(400).json({ error: 'Missing question' });
    }

    const ctx = await retrieveContext(question);
    const { text, citations } = await geminiAnswerWithCitations(question, ctx);

    // Build sources list using our context order (fallback if Gemini didn’t return URIs)
    const sources = ctx.map((c) => ({ title: c.title, url: c.url }));

    // Telemetry
    const event_id = uuid();
    const created_at = new Date().toISOString();
    const user_hash = 'u_' + Math.random().toString(36).slice(2, 10);

    db.events.push({
      event_id, user_hash, question,
      answer_len: text.length, latency_ms: 0, // fill in if you measure duration
      sources_count: sources.length, thumbs_up: null, created_at
    });

    db.messages.push({ message_id: uuid(), event_id, role: 'user',      text: question, tokens: question.length, created_at });
    db.messages.push({ message_id: uuid(), event_id, role: 'assistant',  text,          tokens: Math.floor(text.length/4), created_at });

    sources.forEach((s, i) => db.sources.push({
      source_id: uuid(), event_id, title: s.title, url: s.url,
      domain: new URL(s.url).hostname, rank: i+1, created_at
    }));

    res.json({ answer: text, sources });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Gemini request failed' });
  }
});
