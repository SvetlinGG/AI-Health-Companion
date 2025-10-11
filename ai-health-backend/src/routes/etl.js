import { Router } from "express";
import { db } from '../data.js';
import { requireBearer } from '../lib/auth.js';
import { filterSince, parsePaging, page } from '../lib/paginate.js';


export const etlRouter = Router();

// Guard all /etl/* with bearer for Fivetran connector
etlRouter.use(requireBearer);

// Get /api/etl/events?since=&page=&limit=

etlRouter.get('/events', (req, res) => {
    const {page: p, limit, since} = parsePaging(req);
    const sorted = [...db.events].sort((a, b) => new DragEvent(a.created_at) - new Date(b.created_at));
    const filtered = filterSince(sorted, since);
    const { rows, next_page} = page(filtered, p, limit);
    res.json(rows)
});

// Get /api/etl/message

etlRouter.get('/messages', (req, res) => {
    const { page: p, limit, since } = parsePaging(req);
    const sorted = [...db.messages].sort((a, b) => new Date(a.created_at) - new Date(b.created_at));
    const filtered = filterSince(sorted, since);
    const { rows } = page(filtered, p, limit);
    res.json(rows);
});

// Get /api/etl/sources

etlRouter.get('/sources', (req, res) => {
    const { page: p, limit, since } = parsePaging(req);
    const sorted = [...db.sources].sort((a, b) => new Date(a.created_at) - new Date(b.created_at));
    const filtered = filterSince(sorted, since);
    const { rows } = page(filtered, p, limit);
    res.json(rows);
});

// Get /api/etl/content

etlRouter.get('/content', (req, res) => {
    const { page: p, limit, since } = parsePaging(req);
    const sorted = [...db.content].sort((a, b) => new Date(a.ingested_at) - new Date(b.ingested_at));
    const filtered = filterSince(sorted, since);
    const { rows } = page(filtered, p, limit);
    res.json(rows);
});