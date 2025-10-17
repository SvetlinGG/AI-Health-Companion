import { Router } from "express";
import { db } from '../data.js'

export const feedbackRouter = Router();

// Post /api/feedback { event_id: string, thumbs_up: boolean }

feedbackRouter.post('/', (req, res) => {
    const {event_id, thumbs_up } = req.body || {};
    if ( !event_id || typeof thumbs_up !== 'boolean') {

        return res.status(400).json({ error: 'event_id and thumbs_up are required'});
    }
    const ev = db.events.find( e => e.event_id === event_id);
    if ( !ev ) return res.status(404).json({ error: 'event not found' });
    ev.thumbs_up = thumbs_up;
    return res.json({ ok: true });
});