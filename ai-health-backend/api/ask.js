import { geminiAnswerWithCitations } from '../src/lib/gemini.js';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { question } = req.body;
    if (!question) {
      return res.status(400).json({ error: 'Question is required' });
    }

    const result = await geminiAnswerWithCitations(question, []);
    
    res.json({
      answer: result.text,
      sources: result.citations || []
    });
  } catch (error) {
    console.error('Ask API error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}