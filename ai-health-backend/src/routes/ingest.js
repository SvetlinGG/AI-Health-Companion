import { Router  } from "express";
import fetch from 'node-fetch';
import { v4 as uuid } from "uuid";
import { db } from '../data.js';
import { geminiAnswerWithCitations } from '../lib/gemini.js';

export const ingestRouter = Router();

// Secure with a simple token or IAM ( Cloud Scheduler OIDC -> IAP best)
ingestRouter.post('/daily', async (req, res) => {
    try {
        // 1) Pull feed (replace with real medical feeds)
        const items = [
            { title: 'New diabetes guidance', url: 'https://example.org/diabetes-guidance'},
            { title: 'Heart health checklist', url: 'https://example.org/heart-health'}
        ];

        // 2) Auto-annotate with Gemini (tags/summary)
        for ( const it of items) {
            const {text} = await geminiAnswerWithCitations(
                `Create 3-6 tags for this medical article and a 1-sentence summary:\nTitle: ${it.title}\nURL: ${it.url}\nTEXT: (fetch-html-if-needed)`,
                []
            );
            const tags = ( text.match(/#\w+/g) || []).map( t => t.replace('#', ''));
            db.content.push({
                content_id: uuid(),
                title: it.title,
                url: it.url,
                tags,
                published_at: new Date().toISOString(),
                ingested_at: new Date().toISOString()
            });
        }
        res.json({ ok: true, added: items.length });
    } catch (e) {
        console.error(e);
        res.status(500).json({ error: 'ingest failed'})
    }
});